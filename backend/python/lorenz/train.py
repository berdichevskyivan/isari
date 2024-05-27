import torch
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import autocast, GradScaler
from torch.utils.data import DataLoader, Dataset
from torch.utils.checkpoint import checkpoint
from lorenz import GPT, save_model, build_vocab, preprocess_sequence, pad_sequence
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import reuters
import json
import os
from tqdm import tqdm

def save_vocab(vocab, file_path):
    with open(file_path, 'w') as f:
        json.dump(vocab, f)

if __name__ == "__main__":
    vocab = build_vocab()
    save_vocab(vocab, "vocab.json")

log_file_path = "gpu_usage_log.json"

# Initialize the log file
with open(log_file_path, 'w') as log_file:
    json.dump([], log_file)  # Create an empty JSON array

# Ensure the reuters and punkt corpora are downloaded
nltk.download('reuters')
nltk.download('punkt')

def profile_model_parameters(model):
    total_params = sum(p.numel() for p in model.parameters())
    print(f"Total Model Parameters: {total_params}")
    total_size = sum(p.numel() * p.element_size() for p in model.parameters()) / (1024 ** 2)
    print(f"Total Model Size: {total_size:.2f} MB")

def average_sentence_length(dataset):
    total_length = sum(len(sentence) for sentence in dataset)
    return total_length / len(dataset)

def sample_size_in_bytes(average_length, token_size=4):
    return average_length * token_size

def total_dataset_size_in_bytes(num_samples, average_sample_size):
    return num_samples * average_sample_size

def print_gpu_memory():
    """
    Print the current GPU memory usage.
    """
    allocated = torch.cuda.memory_allocated() / (1024 ** 3)
    reserved = torch.cuda.memory_reserved() / (1024 ** 3)
    free = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3) - reserved
    print(f"Allocated Memory: {allocated:.2f} GB")
    print(f"Reserved Memory: {reserved:.2f} GB")
    print(f"Free Memory: {free:.2f} GB")

def log_gpu_usage(epoch, batch_idx, len_dataloader, input_ids_size, allocated, reserved, free):
    log_entry = {
        "epoch": epoch,
        "batch_idx": batch_idx + 1,
        "total_batches": len_dataloader,
        "batch_size": input_ids_size,
        "allocated_memory_gb": allocated,
        "reserved_memory_gb": reserved,
        "free_memory_gb": free
    }
    
    # Append the log entry to the JSON file
    with open(log_file_path, 'r+') as log_file:
        logs = json.load(log_file)
        logs.append(log_entry)
        log_file.seek(0)
        json.dump(logs, log_file, indent=4)

class CheckpointedGPT(GPT):
    def forward(self, x):
        # Ensure input tensor is integer type for embedding lookup
        assert x.dtype in [torch.int64, torch.int32], "Input to embedding layer must be integer type"
        return checkpoint(self._forward_impl, x, use_reentrant=False)  # Explicitly set use_reentrant

    def _forward_impl(self, x):
        # Forward implementation with conversion to float after embedding if necessary
        x = self.embedding(x)
        x = x.float()  # Convert to float after embedding if necessary
        for layer in self.transformer_layers:
            x = layer(x)
        x = self.ln_f(x)
        logits = self.head(x)
        return logits

class SimpleDataset(Dataset):
    """
    A simple dataset for demonstration purposes.
    """

    def __init__(self, data, vocab):
        """
        Initialize the dataset.

        :param data: List of sequences
        :param vocab: Vocabulary dictionary mapping words to IDs
        """
        self.data = [preprocess_sequence(word_tokenize(seq), vocab) for seq in data]
        self.vocab = vocab

    def __len__(self):
        """
        Return the length of the dataset.
        """
        return len(self.data)

    def __getitem__(self, idx):
        """
        Get an item from the dataset.

        :param idx: Index of the item
        :return: Tuple (input_sequence, target_sequence)
        """
        input_seq = self.data[idx]
        target_seq = input_seq.copy()  # For simplicity, target is the same as input
        return torch.tensor(input_seq), torch.tensor(target_seq)

# Training function
def train_model(model, dataset, epochs, batch_size, lr):
    """
    Train the GPT model.

    :param model: GPT model to train
    :param dataset: Training dataset
    :param epochs: Number of training epochs
    :param batch_size: Batch size
    :param lr: Learning rate
    """
    pad_token_id = dataset.vocab["<pad>"]
    print("Creating DataLoader...")
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True, collate_fn=lambda batch: pad_sequence(batch, pad_token_id))
    print("DataLoader created successfully.")
    
    optimizer = optim.Adam(model.parameters(), lr=lr)
    criterion = nn.CrossEntropyLoss()
    scaler = GradScaler()

    model.train()
    print(f"Total size of the dataset: {len(dataset)} samples")

    if len(dataloader) == 0:
        print("Dataloader is empty.")
        return

    # Check the first few samples
    for i in range(5):
        print(f"Sample {i}: {dataset[i]}")

    print("Starting training loop...")
    for epoch in range(epochs):
        print(f"Starting epoch {epoch+1}/{epochs}")
        epoch_loss = 0
        progress_bar = tqdm(enumerate(dataloader), total=len(dataloader), desc=f"Epoch [{epoch+1}/{epochs}]")
        for batch_idx, (input_ids, target_ids) in progress_bar:
            input_ids, target_ids = input_ids.to(device), target_ids.to(device)
            
            optimizer.zero_grad()
            with autocast():
                outputs = model(input_ids)
                loss = criterion(outputs.view(-1, model.head.out_features), target_ids.view(-1))

            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

            # Update progress bar with loss
            progress_bar.set_postfix(loss=loss.item())

            # Accumulate loss for the epoch
            epoch_loss += loss.item()

            # Log GPU usage
            allocated = torch.cuda.memory_allocated() / (1024 ** 3)
            reserved = torch.cuda.memory_reserved() / (1024 ** 3)
            free = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3) - reserved
            log_gpu_usage(epoch, batch_idx, len(dataloader), input_ids.size(0), allocated, reserved, free)
        
        # Print the detailed loss at the end of each epoch
        avg_epoch_loss = epoch_loss / len(dataloader)
        print(f"Epoch [{epoch+1}/{epochs}] completed. Average Loss: {avg_epoch_loss:.4f}")

    save_model(model, "./models/lorenz_model.pth")
    print("Model saved successfully.")

if __name__ == "__main__":
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    vocab = build_vocab()
    vocab_size = len(vocab)

    n_embd = 256
    n_layer = 6
    n_head = 8

    model = CheckpointedGPT(vocab_size, n_embd, n_layer, n_head).to(device)

    sentences = reuters.sents()
    tokenized_sentences = [word_tokenize(" ".join(sent)) for sent in sentences[:1000]]

    avg_length = average_sentence_length(tokenized_sentences)
    print(f"Average Sentence Length: {avg_length:.2f} tokens")

    sample_size = sample_size_in_bytes(avg_length)
    print(f"Sample Size: {sample_size:.2f} bytes")

    total_size = total_dataset_size_in_bytes(len(tokenized_sentences), sample_size)
    print(f"Total Dataset Size: {total_size / (1024 ** 2):.2f} MB")
    
    example_data = [" ".join(sent) for sent in tokenized_sentences]

    # Verify the preprocessed data
    for i in range(5):
        print(f"Sample {i}: {example_data[i]}")
    
    dataset = SimpleDataset(example_data, vocab)
    print(f"Total size of the dataset: {len(dataset)} samples")

    train_model(model, dataset, epochs=5, batch_size=8, lr=0.001)
