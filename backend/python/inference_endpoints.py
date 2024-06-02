import os
import onnxruntime_genai as og
from flask import request, jsonify
import traceback

def load_model(model_path):
    print(f"Loading model from: {model_path}")
    model = og.Model(model_path)
    print("Model loaded successfully.")
    return model

def load_tokenizer(model):
    print("Loading tokenizer for the model.")
    tokenizer = og.Tokenizer(model)
    print("Tokenizer loaded successfully.")
    return tokenizer

def run_inference(model, tokenizer, input_text):
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
        model = load_model(model_path)
        tokenizer = load_tokenizer(model)
        generated_text = run_inference(model, tokenizer, input_text)
        print("Generated text:", generated_text)
        return jsonify({'success': True, 'output': generated_text})
    except Exception as e:
        print(f"Error during inference: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Internal server error.'}), 500
