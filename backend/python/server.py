from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/analyzeWorkerData', methods=['POST'])
def analyze_worker_data():
    data = request.form.to_dict()
    print(data)
    # Do your analysis here
    # For simplicity, let's assume analysis always succeeds
    response = {'success': True, 'message': 'Data analysis successful'}
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)
