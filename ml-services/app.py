from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/health')
def health():
    return jsonify({'status': 'ok'})

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json or {}
    # Dummy prediction
    result = {'prediction': 'positive', 'confidence': 0.87, 'input': data}
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
