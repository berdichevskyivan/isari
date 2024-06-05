import json
import torch
import numpy as np
import onnxruntime_genai as og
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from flask import request, jsonify
from sklearn.manifold import TSNE
import traceback
from flask_socketio import emit

# Global variables to store the model and tokenizer
model = None
tokenizer = None
hook_handles = []

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
    
# Global variables to store activations
batched_activations = []
activations_count = 0

# Hook function to capture the activation and prepare t-SNE data
def get_activation(name):
    def hook(model, input, output):
        global batched_activations, activations_count
        print("Retrieving activation from Layer: ", name)
        output = output[0]  # Ensure we are getting the correct part of the output
        activation = output.detach().to(torch.float32)
        activation_np = activation.cpu().numpy()
        print("Activation retrieved: ", activation_np)

        # Print the shape of the activation
        print("Activation shape:", activation_np.shape)

        # For now we want to capture singular activations from generated tokens as these
        # represent the entire context of the input sequence as well
        if activation_np.shape[1] == 1:
            print("Singular activation being triggered!")
            # We reshape the activation
            reshaped_activation = activation_np.reshape(1, 3072)
            # Now we can add this reshaped activation inside of the batched_activations list

            batched_activations.append(reshaped_activation[0].tolist())
            activations_count = activations_count + 1

            print("Activation stored in batched_activations. Batched Activations: ", np.array(batched_activations).shape)

        if len(batched_activations) >= 10:
            print("There are currently 10 or more batched activations.")
            tsne = TSNE(n_components=3, perplexity=5, random_state=42)
            tsne_result = tsne.fit_transform(np.array(batched_activations))
            print("tSNE Result: ", tsne_result)

            # Ensure all values are floats
            tsne_result = tsne_result.astype(float).tolist()

            # Convert tSNE results to the desired JSON format
            json_results = [
                {"x": sample[0], "y": sample[1], "z": sample[2], "layer_name": name}
                for sample in tsne_result
            ]

            # Convert to JSON string
            json_string = json.dumps(json_results, indent=2)

            # Print or send the JSON string
            print(json_string)

            # Emit the t-SNE results to the frontend
            emit('updateTSNEData', json_results, namespace="/", broadcast=True)

            # Once we have the results, we flush the batched_activations array
            batched_activations = []
            print("batched_activations variable has been flushed.")
    return hook

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
    global batched_activations, hook_handles, activations_count

    # Unregister existing hooks
    for handle in hook_handles:
        handle.remove()

    hook_handles = []
    batched_activations = []  # Reset activations for each run
    activations_count = 0

    print(f"Running inference for input text: {input_text}")

    messages = [
        {"role": "user", "content": input_text},
    ]

    # Register hooks for a layer
    layer_name = 'model.layers.31'  # You can change this to any layer you are interested in
    layer = dict([*model.named_modules()])[layer_name]
    hook_handle = layer.register_forward_hook(get_activation(layer_name))
    hook_handles.append(hook_handle)

    # for module in model.named_modules():
    #     module_name = module[0]
    #     print(module)
        # if "model.layers." in module_name and module_name.count('.') == 2:
        #     layer = dict([*model.named_modules()])[module_name]
        #     layer.register_forward_hook(get_activation(module_name))
        #     print("Hook attached to layer: ", module_name)

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

    print("output: ", output)

    # Print the generated output
    generated_text = output[0]['generated_text']

    return generated_text

def run_inference_endpoint():
    try:
        global model, tokenizer
        data = request.json
        input_text = data.get('input_text', '')
        print(f"Received input text: {input_text}")

        if model is None or tokenizer is None:
            print("Im here!!!")
            model_path = "microsoft/Phi-3-mini-4k-instruct"
            model, tokenizer = load_model_and_tokenizer(model_path)
        
        generated_text = run_inference(model, tokenizer, input_text)
        print("Generated text:", generated_text)

        print("Tokenizer", dir(tokenizer))

        # Tokenize the generated text
        tokens = tokenizer.tokenize(generated_text)
        print("Tokenized text:", tokens)
        print("Tokenized text length: ", len(tokens))
        print("Activations count is: ", activations_count)
        return jsonify({'success': True, 'output': generated_text})
    except Exception as e:
        print(f"Error during inference: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Internal server error.'}), 500
