from flask import Flask, request, jsonify
from asgiref.wsgi import WsgiToAsgi
import joblib
import numpy as np

app = Flask(__name__)

model = joblib.load('model/random_forest.joblib')

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Hello World"}), 200

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        feature_names = [
            'Packets', 'Bytes', 'Tx Packets', 'Tx Bytes',
            'Rx Packets', 'Rx Bytes', 'tcp.srcport', 'tcp.dstport',
            'ip.proto', 'frame.len'
        ]
        
        features = [float(data[feature]) for feature in feature_names]
        features = np.array(features).reshape(1, -1)
        
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        
        print("prediction: ", prediction)
        print("probabilities: ", probabilities)
        

        return jsonify({
            'prediction': 'Benign' if prediction == 0 else 'DDoS',
            'confidence': float(max(probabilities)),
            'raw_probabilities': probabilities.tolist()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

asgi_app = WsgiToAsgi(app)

if __name__ == '__main__':
    app.run(port=5000)
