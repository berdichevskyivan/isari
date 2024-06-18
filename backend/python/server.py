from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from worker_endpoints import analyze_worker_data
# from inference_endpoints import run_inference_endpoint

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
socketio = SocketIO(app, cors_allowed_origins="https://isari.ai")  # Initialize SocketIO with CORS allowed origins

@socketio.on('connect')
def handle_connection():
    print("User connected.")

@app.route('/analyzeWorkerData', methods=['POST'])
def analyze_worker_data_route():
    return analyze_worker_data()

# @app.route('/runInferenceWithPhi3Mini', methods=['POST'])
# def run_inference_with_phi3_mini_route():
#     return run_inference_endpoint()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=3001, debug=True)
