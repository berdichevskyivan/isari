import json
import torch
import torch.nn.functional as F
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
predicted_tokens = []
activations_count = 0
lm_head_activations_count = 0

# Hook function to capture the activation and prepare t-SNE data
def get_activation(name):
    def hook(model, input, output):
        global batched_activations, activations_count
        # print("Retrieving activation from Layer: ", name)
        output = output[0]  # Ensure we are getting the correct part of the output
        activation = output.detach().to(torch.float32)
        activation_np = activation.cpu().numpy()
        # print("Activation retrieved: ", activation_np)

        # Print the shape of the activation
        # print("Activation shape:", activation_np.shape)

        # For now we want to capture singular activations from generated tokens as these
        # represent the entire context of the input sequence as well
        if activation_np.shape[1] == 1:
            # print("Singular activation being triggered!")
            # We reshape the activation
            reshaped_activation = activation_np.reshape(1, 3072)
            # Now we can add this reshaped activation inside of the batched_activations list

            batched_activations.append(reshaped_activation[0].tolist())
            activations_count = activations_count + 1

            # print("Activation stored in batched_activations. Batched Activations: ", np.array(batched_activations).shape)

        if len(batched_activations) >= 10:
            # print("There are currently 10 or more batched activations.")
            tsne = TSNE(n_components=3, perplexity=5, random_state=42)
            tsne_result = tsne.fit_transform(np.array(batched_activations))
            # print("tSNE Result: ", tsne_result)

            # Ensure all values are floats
            tsne_result = tsne_result.astype(float).tolist()

            # Convert tSNE results to the desired JSON format
            json_results = [
                {"x": sample[0], "y": sample[1], "z": sample[2], "layer_name": name}
                for sample in tsne_result
            ]

            # Convert to JSON string
            # json_string = json.dumps(json_results, indent=2)

            # Print or send the JSON string
            # print(json_string)

            # Emit the t-SNE results to the frontend
            emit('updateTSNEData', json_results, namespace="/", broadcast=True)

            # Once we have the results, we flush the batched_activations array
            batched_activations = []
            # print("batched_activations variable has been flushed.")
    return hook

# Hook function to capture the activation and prepare t-SNE data
def get_last_activation(name, tokenizer, temperature=0.7, do_sample=True, top_k=50, top_p=0.9):
    def hook(model, input, output):
        global predicted_tokens, lm_head_activations_count
        # print("Retrieving activation from Layer: ", name)
        output = output[0]  # Ensure we are getting the correct part of the output
        activation = output.detach().to(torch.float32)
        activation_np = activation.cpu().numpy()

        if activation_np.shape[0] > 1:
            print("This activation contains more than 1 elements: ", activation_np, activation_np.shape)

        if activation_np.shape[0] == 1:
            lm_head_activations_count = lm_head_activations_count + 1
            # print("Activation retrieved: ", activation_np)

            # Print the shape of the activation
            # print("Activation shape:", activation_np.shape)

            # Apply temperature scaling
            scaled_logits = activation / temperature

            # Apply softmax to get probabilities
            probabilities = F.softmax(scaled_logits, dim=-1)

            # Apply top-k sampling
            if top_k > 0:
                top_k_probabilities, top_k_indices = torch.topk(probabilities, top_k, dim=-1)
            else:
                top_k_probabilities, top_k_indices = probabilities, torch.arange(probabilities.size(-1))

            # Apply top-p sampling within the top-k probabilities
            sorted_probabilities, sorted_indices = torch.sort(top_k_probabilities, descending=True)
            cumulative_probabilities = torch.cumsum(sorted_probabilities, dim=-1)
            cutoff_index = torch.where(cumulative_probabilities >= top_p)[1][0].item()
            top_p_indices = sorted_indices[:, :cutoff_index + 1]
            top_p_probabilities = sorted_probabilities[:, :cutoff_index + 1]

            # Sampling from top-p probabilities
            if do_sample:
                chosen_index = torch.multinomial(top_p_probabilities, 1)
                predicted_token_id = top_k_indices[0, top_p_indices[0, chosen_index]]
            else:
                # Choose the token with the highest probability
                predicted_token_id = top_k_indices[0, top_p_indices[0, 0]]

            token = tokenizer.convert_ids_to_tokens(predicted_token_id.item())
            predicted_tokens.append(token)
            print(f"Predicted token ID: {predicted_token_id.item()}, Token: {token}")

    return hook

def load_model_and_tokenizer(model_path):
    print(f"Loading model from: {model_path}")
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        device_map="auto",
        torch_dtype="auto",
        trust_remote_code=True,
    )
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    print("Model and tokenizer loaded successfully.")
    return model, tokenizer

def run_inference(model, tokenizer, input_text):
    global batched_activations, hook_handles, activations_count, lm_head_activations_count, predicted_tokens

    # Unregister existing hooks
    for handle in hook_handles:
        handle.remove()

    hook_handles = []
    predicted_tokens = []
    batched_activations = []
    activations_count = 0
    lm_head_activations_count = 0

    print(f"Running inference for input text: {input_text}")

    messages = [
        {"role": "user", "content": input_text},
    ]

    for module in model.named_modules():
        module_name = module[0]
        print(module_name)
        print(module)

    # Register hooks for a layer
    layer_name = 'model.layers.31'
    layer = dict([*model.named_modules()])[layer_name]
    hook_handle = layer.register_forward_hook(get_activation(layer_name))
    hook_handles.append(hook_handle)

    # Register hook for last layer
    last_layer_name = 'lm_head'
    last_layer = dict([*model.named_modules()])[last_layer_name]
    last_hook_handle = last_layer.register_forward_hook(get_last_activation(last_layer_name, tokenizer))
    hook_handles.append(last_hook_handle)

    # for module in model.named_modules():
    #     module_name = module[0]
    #     print(module)
        # if "model.layers." in module_name and module_name.count('.') == 2:
        #     layer = dict([*model.named_modules()])[module_name]
        #     layer.register_forward_hook(get_activation(module_name))
        #     print("Hook attached to layer: ", module_name)

    pipe = pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
    )

    generation_args = {
        "max_new_tokens": 50,  # Limit to a smaller number for testing
        "return_full_text": False,
        "temperature": 0.7,
        "do_sample": True,
        "top_k": 50,
        "top_p": 0.9,
    }

    output = pipe(messages, **generation_args)

    print("output: ", output)

    generated_text = output[0]['generated_text']

    return generated_text

def truncate_text(text):
    last_period = text.rfind('.')
    last_exclamation = text.rfind('!')
    if last_period == -1 and last_exclamation == -1:
        return text  # No period or exclamation found, return the original text
    if last_period > last_exclamation:
        return text[:last_period + 1]
    else:
        return text[:last_exclamation + 1]

def run_inference_endpoint():
    try:
        global model, tokenizer, predicted_tokens, batched_activations
        data = request.json
        input_text = data.get('input_text', '')
        print(f"Received input text: {input_text}")

        if model is None or tokenizer is None:
            model_path = "microsoft/Phi-3-mini-4k-instruct"
            model, tokenizer = load_model_and_tokenizer(model_path)
        
        generated_text = run_inference(model, tokenizer, input_text)

        # print("There are currently 10 or more batched activations.")
        tsne = TSNE(n_components=3, perplexity=round(len(batched_activations)/2), random_state=42)
        tsne_result = tsne.fit_transform(np.array(batched_activations))
        # print("tSNE Result: ", tsne_result)

        # Ensure all values are floats
        tsne_result = tsne_result.astype(float).tolist()

        # Convert tSNE results to the desired JSON format
        json_results = [
            {"x": sample[0], "y": sample[1], "z": sample[2], "layer_name": "model.layers.31"}
            for sample in tsne_result
        ]

        # Convert to JSON string
        json_string = json.dumps(json_results, indent=2)

        # Print or send the JSON string
        print("sending last batch of activations: ", json_string)

        # Emit the t-SNE results to the frontend
        emit('updateTSNEData', json_results, namespace="/", broadcast=True)

        # Emitting the predicted tokens here too
        emit('updatePredictedTokensData', predicted_tokens, namespace="/", broadcast=True)

        batched_activations = []

        print("Generated text:", generated_text)

        # Tokenize the generated text
        tokens = tokenizer.tokenize(generated_text)
        print("Predicted Tokens:", predicted_tokens)
        print("Predicted Tokens length: ", len(predicted_tokens))
        print("Tokenized text:", tokens)
        print("Tokenized text length: ", len(tokens))
        print("Activations count is: ", activations_count)
        print("LM Activations count is: ", lm_head_activations_count)

        # Truncate the generated text before returning it
        generated_text = truncate_text(generated_text)

        return jsonify({'success': True, 'output': generated_text})
    except Exception as e:
        print(f"Error during inference: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Internal server error.'}), 500
