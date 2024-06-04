import os
import json
import torch
import numpy as np
import onnxruntime_genai as og
import onnxruntime as ort
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from flask import request, jsonify
from sklearn.manifold import TSNE
from sklearn.decomposition import PCA
import traceback

def load_model_og(model_path):
    print(f"Loading model from: {model_path}")
    model = og.Model(model_path)
    print("Model loaded successfully.")
    return model

def load_tokenizer_og(model):
    print("Loading tokenizer for the model.")
    tokenizer = og.Tokenizer(model)
    print("Tokenizer loaded successfully.")
    return tokenizer

def run_inference_og(model, tokenizer, input_text):
    print(f"Running inference for input text: {input_text}")
    search_options = {"max_length": 1024, "temperature": 0.3}
    params = og.GeneratorParams(model)
    params.try_graph_capture_with_max_batch_size(1)
    params.set_search_options(**search_options)

    prompt = f"<|user|>{input_text}<|end|><|assistant|>"
    
    input_tokens = tokenizer.encode(prompt)
    print(f"Encoded input tokens: {input_tokens}")
    params.input_ids = input_tokens

    generator = og.Generator(model, params)
    tokenizer_stream = tokenizer.create_stream()
    
    generated_text = ""

    # Run the generator to completion
    while not generator.is_done():
        generator.compute_logits()
        generator.generate_next_token()

        # Get the new token and decode it
        new_token = generator.get_next_tokens()[0]
        decoded_token = tokenizer_stream.decode(new_token)
        print(f"Generated token: {new_token}, Decoded token: {decoded_token}")
        generated_text += decoded_token

    print(f"Final generated text: {generated_text}")
    return generated_text

def run_inference_with_phi3_mini_endpoint():
    try:
        data = request.json
        input_text = data.get('input_text', '')
        print(f"Received input text: {input_text}")
        model_path = "./models/phi-3-mini-4k-instruct-onnx-directml-int4-awq"
        model = load_model_og(model_path)
        tokenizer = load_tokenizer_og(model)
        generated_text = run_inference_og(model, tokenizer, input_text)
        print("Generated text:", generated_text)
        return jsonify({'success': True, 'output': generated_text})
    except Exception as e:
        print(f"Error during inference: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Internal server error.'}), 500
    
# Global variable to store activations
activations = []
max_length = 0

# Hook function to capture the activation and save to a tsne_result.json file
def get_activation(name):
    def hook(model, input, output):
        global activations, max_length
        print("Retrieving activation from Layer: ", name)
        output = output[0]  # Ensure we are getting the correct part of the output
        activation = output.detach().to(torch.float32)  # Ensure compatibility with t-SNE
        activation_np = activation.cpu().numpy()
        print("Activation retrieved: ", activation_np)

        # Print the shape of the activation
        print("Activation shape:", activation_np.shape)

        activations.append(activation_np)
        if activation.shape[1] > max_length:
            max_length = activation.shape[1]

        if activation_np.shape[0] > 1:
            # Apply t-SNE
            tsne = TSNE(n_components=3, perplexity=max(1, activation_np.shape[0] // 2), random_state=42)
            result = tsne.fit_transform(activation_np)
            print("t-SNE result:", result)
        else:
            # Apply PCA if there is only one sample
            pca = PCA(n_components=1)
            result = pca.fit_transform(activation_np)
            print("PCA result:", result)

        # Print the result
        print("Result:", result)

        # Save the result to a JSON file
        result_file_path = os.path.join(os.path.dirname(__file__), "result.json")
        with open(result_file_path, 'w') as f:
            json.dump(result.tolist(), f, indent=4)

    return hook

def pad_activations(activations, max_length):
    padded_activations = []
    for activation in activations:
        if activation.shape[1] < max_length:
            padding = np.zeros((activation.shape[0], max_length - activation.shape[1]))
            padded_activation = np.hstack([activation, padding])
        else:
            padded_activation = activation
        padded_activations.append(padded_activation)
    return np.vstack(padded_activations)

def load_model_and_tokenizer(model_path):
    print(f"Loading model from: {model_path}")
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        device_map="auto",  # Use 'cuda' for GPU or 'auto' to automatically select the device
        torch_dtype="auto",  # Use appropriate dtype
        trust_remote_code=True,
    )
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    print("Model and tokenizer loaded successfully.")
    return model, tokenizer

def run_inference(model, tokenizer, input_text):
    global activations
    activations = []  # Reset activations for each run

    print(f"Running inference for input text: {input_text}")

    messages = [
        {"role": "user", "content": input_text},
    ]

    # Register hooks for a layer
    layer_name = 'model.layers.0.mlp.down_proj'  # You can change this to any layer you are interested in
    layer = dict([*model.named_modules()])[layer_name]
    layer.register_forward_hook(get_activation(layer_name))

    # Create a text generation pipeline
    pipe = pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
    )

    # Define the generation arguments
    generation_args = {
        "max_new_tokens": 50,  # Limit to a smaller number for testing
        "return_full_text": False,
        "temperature": 0.7,
        "do_sample": True,
        "top_k": 50,
        "top_p": 0.9,
    }

    # Run the pipeline with the input text and generation arguments
    output = pipe(messages, **generation_args)

    # Print the generated output
    generated_text = output[0]['generated_text']

    # After collecting all activations
    # if activations:
    #     combined_activations = pad_activations(activations, max_length)
    #     print(f"Combined activations shape: {combined_activations.shape}")

    #     # Apply t-SNE on combined activations
    #     tsne = TSNE(n_components=3, perplexity=5)
    #     tsne_result = tsne.fit_transform(combined_activations)
    #     print(f"t-SNE result: {tsne_result}")

    return generated_text

def run_inference_endpoint():
    try:
        data = request.json
        input_text = data.get('input_text', '')
        print(f"Received input text: {input_text}")

        model_path = "microsoft/Phi-3-mini-4k-instruct"
        model, tokenizer = load_model_and_tokenizer(model_path)
        
        generated_text = run_inference(model, tokenizer, input_text)
        print("Generated text:", generated_text)
        return jsonify({'success': True, 'output': generated_text})
    except Exception as e:
        print(f"Error during inference: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Internal server error.'}), 500
