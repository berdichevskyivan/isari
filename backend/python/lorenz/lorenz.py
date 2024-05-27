import torch
import torch.nn as nn
from torch.nn.functional import softmax
import json
import os
import nltk
from nltk.corpus import words
from nltk.tokenize import word_tokenize

nltk.download('words')

def build_vocab():
    """
    Build vocabulary from the NLTK words corpus including special tokens, symbols, and numbers.

    :return: Dictionary mapping from word to index
    """
    # Define special tokens, symbols, and numbers
    special_tokens = ["<unk>", "<sos>", "<eos>", "<pad>", "<sep>", "<cls>", "<mask>"]
    symbols = list("!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~")
    numbers = [str(i) for i in range(10)]

    # Initialize vocabulary with special tokens, symbols, and numbers
    vocab = {token: idx for idx, token in enumerate(special_tokens + symbols + numbers)}
    print(f"Initial vocab (special tokens, symbols, numbers): {len(vocab)}")

    # Add words from the NLTK words corpus
    word_list = words.words()
    word_offset = len(vocab)

    print(f"Starting to add words from NLTK corpus, word offset: {word_offset}")

    # Use a set to ensure no duplicates
    added_words = set()
    last_idx = -1
    for idx, word in enumerate(word_list):
        if word not in added_words:
            expected_index = len(vocab)  # Expected index should be the current length of the vocab
            vocab[word] = expected_index
            added_words.add(word)
            # Check for any gaps in indices
            if last_idx != -1 and vocab[word] != last_idx + 1:
                print(f"Gap detected: last index = {last_idx}, current index = {vocab[word]}, word = '{word}'")
            last_idx = vocab[word]
            # Add detailed logging for the first few words
            if idx < 10:
                print(f"Added word '{word}' with index {vocab[word]}")
            elif idx == 10:
                print("...")
    
    # Print the total vocabulary size
    print(f"Total words added: {len(added_words)}")
    print(f"Final vocab size: {len(vocab)}")

    # Check for gaps or overlaps in indices
    indices = set(vocab.values())
    if len(indices) != len(vocab):
        print(f"Duplicate indices found. Indices count: {len(indices)}, Vocab count: {len(vocab)}")
        raise AssertionError("Duplicate indices found in the vocabulary")

    # Check for vocabulary size
    expected_vocab_size = max(vocab.values()) + 1
    actual_vocab_size = len(vocab)
    if actual_vocab_size != expected_vocab_size:
        print(f"Vocabulary size mismatch: len(vocab) = {actual_vocab_size}, max index = {max(vocab.values())}")
        raise AssertionError("Vocabulary size mismatch")

    return vocab

def preprocess_sequence(sequence, vocab):
    """
    Preprocess the sequence by adding special tokens and converting to IDs.

    :param sequence: List of words in the sequence.
    :param vocab: Vocabulary dictionary mapping words to IDs.
    :return: List of token IDs with special tokens added.
    """
    tokens = ["<sos>"] + sequence + ["<eos>"]
    token_ids = [vocab.get(token.lower(), vocab["<unk>"]) for token in tokens]
    # print(f"Tokens: {tokens}")
    # print(f"Token IDs: {token_ids}")
    return token_ids


def pad_sequence(batch, pad_token_id):
    """
    Pad sequences in the batch to the same length.

    :param batch: List of tuples (input_sequence, target_sequence)
    :param pad_token_id: ID of the padding token
    :return: Tuple of padded input and target sequences
    """
    max_len = max(len(seq[0]) for seq in batch)
    padded_inputs = []
    padded_targets = []

    for input_seq, target_seq in batch:
        padded_inputs.append(list(input_seq) + [pad_token_id] * (max_len - len(input_seq)))
        padded_targets.append(list(target_seq) + [pad_token_id] * (max_len - len(target_seq)))

    return torch.tensor(padded_inputs), torch.tensor(padded_targets)

def top_p_sampling(logits, top_p=0.9, special_token_ids=None):
    if special_token_ids is None:
        special_token_ids = []

    sorted_logits, sorted_indices = torch.sort(logits, descending=True)
    cumulative_probs = torch.cumsum(softmax(sorted_logits, dim=-1), dim=-1)

    # Remove tokens with cumulative probability above the threshold
    sorted_indices_to_remove = cumulative_probs > top_p
    sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
    sorted_indices_to_remove[..., 0] = 0

    # Remove special tokens from sampling
    for token_id in special_token_ids:
        logits[token_id] = -float('Inf')

    probabilities = softmax(logits, dim=-1)
    next_token = torch.multinomial(probabilities, 1)
    return next_token.item()

def decode_output(output, vocab, top_p=0.9):
    id_to_word = {idx: word for word, idx in vocab.items()}
    word_to_id = {word: idx for idx, word in id_to_word.items()}
    special_tokens = {"<sos>", "<unk>", "<eos>", "<pad>", "<sep>", "<cls>", "<mask>"}
    special_token_ids = [word_to_id[token] for token in special_tokens if token in word_to_id]
    output_ids = []

    for i in range(output.size(1)):  # Assuming output is [batch_size, seq_len, vocab_size]
        logits = output[0, i, :]  # Select the logits for the ith position in the sequence
        next_token = top_p_sampling(logits, top_p, special_token_ids)
        output_ids.append(next_token)

    print(f"Output IDs: {output_ids}")
    tokens = [id_to_word.get(id, "<unk>") for id in output_ids if id_to_word.get(id) not in special_tokens]
    return " ".join(tokens)

class GPT(nn.Module):
    """
    A simplified GPT model.
    
    This class defines a basic GPT architecture with minimal layers for easy understanding and analysis.
    """

    def __init__(self, vocab_size, n_embd, n_layer, n_head):
        """
        Initialize the GPT model.

        :param vocab_size: Size of the vocabulary
        :param n_embd: Dimensionality of the embeddings
        :param n_layer: Number of transformer layers
        :param n_head: Number of attention heads
        """
        super(GPT, self).__init__()
        self.embedding = nn.Embedding(vocab_size, n_embd)
        self.transformer_layers = nn.ModuleList([
            nn.TransformerEncoderLayer(d_model=n_embd, nhead=n_head)
            for _ in range(n_layer)
        ])
        self.ln_f = nn.LayerNorm(n_embd)
        self.head = nn.Linear(n_embd, vocab_size)

    def forward(self, x):
        """
        Forward pass through the GPT model.

        :param x: Input tensor
        :return: Output tensor
        """
        x = self.embedding(x)
        for layer in self.transformer_layers:
            x = layer(x)
        x = self.ln_f(x)
        logits = self.head(x)
        return logits

def load_model(model_path, vocab_size, n_embd, n_layer, n_head):
    """
    Load the model from a file if it exists.

    :param model_path: Path to the model file
    :param vocab_size: Size of the vocabulary
    :param n_embd: Dimensionality of the embeddings
    :param n_layer: Number of transformer layers
    :param n_head: Number of attention heads
    :return: Loaded model or None if file doesn't exist
    """
    model = GPT(vocab_size, n_embd, n_layer, n_head)
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path))
    return model

def save_model(model, model_path):
    """
    Save the model to a file.

    :param model: Model to save
    :param model_path: Path to save the model
    """
    torch.save(model.state_dict(), model_path)

def load_vocab(file_path):
    with open(file_path, 'r') as f:
        vocab = json.load(f)
    print(f"Loaded vocabulary of size: {len(vocab)}")
    return vocab

if __name__ == "__main__":
    vocab = load_vocab("vocab.json")
    vocab_size = len(vocab)
    n_embd = 256  # Change this to match the embedding size used during training
    n_layer = 6   # Change this to match the number of layers used during training
    n_head = 8    # Change this to match the number of attention heads used during training

    model_path = "./models/lorenz_model.pth"

    if os.path.exists(model_path):
        model = load_model(model_path, vocab_size, n_embd, n_layer, n_head)

        # Example input (modify this to a meaningful sentence for testing)
        test_sentence = "This is a test sentence for inference."
        tokenized_input = preprocess_sequence(test_sentence.split(), vocab)
        input_ids = torch.tensor(tokenized_input).unsqueeze(0)  # Add batch dimension

        # Print input IDs for debugging
        print(f"Token IDs: {tokenized_input}")
        print(f"Vocabulary size: {vocab_size}")

        # Perform inference
        model.eval()
        with torch.no_grad():
            output = model(input_ids)
            # print(f"Model output logits: {output}")
            decoded_output = decode_output(output, vocab)  # Decode the output
            print(decoded_output)  # Print the decoded output
    else:
        print(f"Model file {model_path} does not exist. Please train the model first.")
