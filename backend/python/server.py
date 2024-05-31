from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import tensorflow as tf
import numpy as np
import json
import os
from transformers import GPT2Tokenizer
from lorenz.lorenz import run_inference, load_model, load_vocab

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load OpenCV's pre-trained Haar Cascade classifier for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Paths to the model files
model_weights_path = os.path.join(os.path.dirname(__file__), 'models', 'model.weights.h5')
model_config_path = os.path.join(os.path.dirname(__file__), 'models', 'config.json')

# Load the model architecture from the config file
with open(model_config_path, 'r') as json_file:
    model_config = json.load(json_file)

# Reconstruct the model from the JSON configuration
deepfake_model = tf.keras.models.model_from_json(
    json.dumps(model_config), 
    custom_objects={"EfficientNetV2Backbone": tf.keras.applications.EfficientNetV2B0}
)

# Build the model with the defined input shape
input_shape = (1, 224, 224, 3)
sample_input = np.zeros(input_shape)
deepfake_model(sample_input)  # Call the model once with a sample input

# Load the model weights
deepfake_model.load_weights(model_weights_path)

@app.route('/analyzeWorkerData', methods=['POST'])
def analyze_worker_data():
    try:
        # Handle form data
        data = request.form.to_dict()
        print("Form Data:", data)
        
        analysis_result = {}
        face_detected = False
        
        # Handle file data
        if 'profilePic' in request.files:
            profile_pic = request.files['profilePic']
            print("Profile Pic Filename:", profile_pic.filename)
            
            # Save the profile picture to the same directory as server.py
            save_path = os.path.join(os.path.dirname(__file__), profile_pic.filename)
            profile_pic.save(save_path)
            
            # Load the image using OpenCV
            img = cv2.imread(save_path)
            if img is None:
                print("Error loading image with OpenCV.")
                return jsonify({'success': False, 'message': 'Error loading image.'})
            
            # Convert image to grayscale for face detection
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Detect faces in the image
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
            
            if len(faces) > 0:
                face_detected = True
                
                # DeepFake detection using EfficientNetV2
                img_array = cv2.resize(img, (224, 224))  # Adjust size if necessary
                img_array = img_array.astype('float32') / 255.0
                img_array = np.expand_dims(img_array, axis=0)
                deepfake_prediction = deepfake_model.predict(img_array)
                
                # Extract the scalar value from the prediction array
                is_real = deepfake_prediction[0] < 0.5  # Adjust threshold if necessary
                is_real = bool(np.any(is_real))  # Convert to a boolean value
                
                analysis_result['is_real'] = is_real
                
                # Print the analysis result
                print("Analysis Result:", analysis_result)
            else:
                print("No face detected in the image.")
                analysis_result['is_real'] = None

            # Delete the image after analysis
            try:
                os.remove(save_path)
                print("Profile Pic removed successfully.")
            except Exception as e:
                print(f"Error deleting profile pic: {e}")
        
        # Prepare the response
        response = {
            'success': face_detected and analysis_result['is_real'],
            'message': 'Data analysis successful' if face_detected and analysis_result['is_real'] else ('No face detected in the image' if not face_detected else 'Face is fake'),
            'analysis_result': analysis_result
        }
        return jsonify(response)
    
    except Exception as e:
        print(f"Error during analyze_worker_data: {e}")
        return jsonify({'success': False, 'message': 'Internal server error.'}), 500
    
@app.route('/runInference', methods=['POST'])
def run_inference_endpoint():
    try:
        data = request.json
        input_text = data.get('input_text', '')
        
        # Initialize the GPT-2 tokenizer
        tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
        vocab_size = tokenizer.vocab_size
        n_embd = 512
        n_layer = 8
        n_head = 16

        model_path = "./models/lorenz_model.pth"
        model = load_model(model_path, vocab_size, n_embd, n_layer, n_head)

        if model:
            decoded_output = run_inference(model, input_text)
            return jsonify({'success': True, 'output': decoded_output})
        else:
            return jsonify({'success': False, 'message': 'Model file not found.'}), 500
    except Exception as e:
        print(f"Error during inference: {e}")
        return jsonify({'success': False, 'message': 'Internal server error.'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)
