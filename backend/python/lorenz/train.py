import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import ReduceLROnPlateau
from torch.cuda.amp import autocast, GradScaler
from torch.utils.data import DataLoader, Dataset
from torch.utils.checkpoint import checkpoint
from transformers import GPT2Tokenizer
import json
import os
import nltk
from lorenz import GPT, save_model, pad_sequence
from tqdm import tqdm
from nltk.corpus import reuters

# Initialize the GPT-2 tokenizer
tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
tokenizer.pad_token = tokenizer.eos_token  # Set the pad token to the end-of-text token

# Save vocabulary function is no longer needed since we use the tokenizer directly
# log_file_path and other initial setup remains the same

log_file_path = "gpu_usage_log.json"

# Initialize the log file
with open(log_file_path, 'w') as log_file:
    json.dump([], log_file)  # Create an empty JSON array

# Ensure the reuters corpus is downloaded
nltk.download('reuters')

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
        assert x.dtype in [torch.int64, torch.int32], "Input to embedding layer must be integer type"
        return checkpoint(self._forward_impl, x, use_reentrant=False)  # Explicitly set use_reentrant

    def _forward_impl(self, x):
        x = self.embedding(x)
        x = x.float()  # Convert to float after embedding if necessary
        for layer in self.transformer_layers:
            x = layer(x)
        x = self.ln_f(x)
        logits = self.head(x)
        return logits

class SimpleDataset(Dataset):
    def __init__(self, data, tokenizer):
        self.data = [tokenizer.encode(seq, add_special_tokens=True) for seq in data]
        self.tokenizer = tokenizer

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        input_seq = self.data[idx]
        target_seq = input_seq.copy()  # For simplicity, target is the same as input
        return torch.tensor(input_seq), torch.tensor(target_seq)

# Training function
def train_model(model, dataset, epochs, batch_size, lr):
    pad_token_id = tokenizer.pad_token_id
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True, collate_fn=lambda batch: pad_sequence(batch, pad_token_id))
    
    optimizer = optim.Adam(model.parameters(), lr=lr)
    scheduler = ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=5, verbose=True)
    criterion = nn.CrossEntropyLoss()
    scaler = GradScaler()

    model.train()
    print(f"Total size of the dataset: {len(dataset)} samples")

    if len(dataloader) == 0:
        print("Dataloader is empty.")
        return

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

            progress_bar.set_postfix(loss=loss.item())

            epoch_loss += loss.item()

            allocated = torch.cuda.memory_allocated() / (1024 ** 3)
            reserved = torch.cuda.memory_reserved() / (1024 ** 3)
            free = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3) - reserved
            log_gpu_usage(epoch, batch_idx, len(dataloader), input_ids.size(0), allocated, reserved, free)
        
        avg_epoch_loss = epoch_loss / len(dataloader)
        print(f"Epoch [{epoch+1}/{epochs}] completed. Average Loss: {avg_epoch_loss:.4f}")

        # Step the scheduler with the validation loss (avg_epoch_loss)
        scheduler.step(avg_epoch_loss)

    save_model(model, "./models/lorenz_model.pth")
    print("Model saved successfully.")

if __name__ == "__main__":
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    vocab_size = tokenizer.vocab_size

    n_embd = 512
    n_layer = 8
    n_head = 16

    model = CheckpointedGPT(vocab_size, n_embd, n_layer, n_head).to(device)

    sentences = reuters.sents()
    tokenized_sentences = [" ".join(sent) for sent in sentences[:2000]]

    avg_length = average_sentence_length(tokenized_sentences)
    print(f"Average Sentence Length: {avg_length:.2f} tokens")

    sample_size = sample_size_in_bytes(avg_length)
    print(f"Sample Size: {sample_size:.2f} bytes")

    total_size = total_dataset_size_in_bytes(len(tokenized_sentences), sample_size)
    print(f"Total Dataset Size: {total_size / (1024 ** 2):.2f} MB")
    
    dataset = SimpleDataset(tokenized_sentences, tokenizer)
    print(f"Total size of the dataset: {len(dataset)} samples")

    train_model(model, dataset, epochs=5, batch_size=8, lr=0.001)
