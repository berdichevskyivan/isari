from transformers import GPT2Tokenizer

# Load a preset tokenizer from Hugging Face transformers
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")

# Add a padding token if it doesn't exist
if tokenizer.pad_token is None:
    tokenizer.add_special_tokens({'pad_token': '[PAD]'})

# Tokenize a sample input
tokens = tokenizer("The quick brown fox jumped.", return_tensors="tf")
print(f"Tokenized output: {tokens['input_ids']}")

# Detokenize the tokens back to text
detokenized_text = tokenizer.decode(tokens['input_ids'][0], skip_special_tokens=True)
print(f"Detokenized output: {detokenized_text}")

# Tokenize a batched input
batch_tokens = tokenizer(["The quick brown fox jumped.", "The fox slept."], return_tensors="tf", padding=True)
print(f"Batched tokenized output: {batch_tokens['input_ids']}")

# Detokenize batched tokens back to text without special tokens
batch_detokenized_text = [tokenizer.decode(token_ids, skip_special_tokens=True) for token_ids in batch_tokens['input_ids']]
print(f"Batched detokenized output: {batch_detokenized_text}")
