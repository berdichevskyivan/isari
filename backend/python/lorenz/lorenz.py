import torch
import torch.nn as nn
from torch.nn.functional import softmax
import json
import os
from transformers import GPT2Tokenizer

def pad_sequence(batch, pad_token_id):
    inputs = []
    targets = []

    for item in batch:
        input_seq, target_seq = item
        if input_seq is None or target_seq is None:
            raise ValueError(f"Found None in batch item: {item}")
        inputs.append(input_seq.tolist())
        targets.append(target_seq.tolist())

    max_length = max(len(seq) for seq in inputs)

    padded_inputs = [seq + [pad_token_id] * (max_length - len(seq)) for seq in inputs]
    padded_targets = [seq + [pad_token_id] * (max_length - len(seq)) for seq in targets]

    padded_inputs_tensor = torch.tensor(padded_inputs, dtype=torch.long)
    padded_targets_tensor = torch.tensor(padded_targets, dtype=torch.long)

    return padded_inputs_tensor, padded_targets_tensor

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

def run_inference(model, input_text):
    tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
    tokenized_input = tokenizer.encode(input_text, return_tensors='pt')

    # Perform inference
    model.eval()
    with torch.no_grad():
        output = model(tokenized_input)

    # Get the most likely tokens
    predicted_token_ids = torch.argmax(output, dim=-1)

    # Decode the predicted tokens to a string
    decoded_output = tokenizer.decode(predicted_token_ids[0], skip_special_tokens=True)
    return decoded_output
