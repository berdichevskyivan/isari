from flask import Flask, request
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from worker_endpoints import analyze_worker_data
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
socketio = SocketIO(app, cors_allowed_origins="https://isari.ai")  # Initialize SocketIO with CORS allowed origins

# Configure rate limiting
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["100 per 15 minutes"]
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.before_request
def log_request_info():
    logger.info(f"Request: {request.method} {request.url} from {request.remote_addr}")

@socketio.on('connect')
def handle_connection():
    print("User connected.")

@app.route('/analyzeWorkerData', methods=['POST'])
@limiter.limit("100 per 15 minutes")  # Apply rate limit to this endpoint
def analyze_worker_data_route():
    logger.info(f"Handling analyzeWorkerData request from {request.remote_addr}")
    return analyze_worker_data()

# @app.route('/runInferenceWithPhi3Mini', methods=['POST'])
# def run_inference_with_phi3_mini_route():
#     return run_inference_endpoint()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=3001, debug=True)
