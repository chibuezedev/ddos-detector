from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from asgiref.wsgi import WsgiToAsgi

app = Flask(__name__)


model_data = joblib.load('model/ddos_detector_brf.pkl')
model = model_data['model']
preprocessor = model_data['preprocessor']
feature_columns = model_data['feature_columns']
threshold = model_data.get('threshold', 0.5)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        request_data = request.json
        df = pd.DataFrame([request_data])
        
        for col in feature_columns:
            if col not in df.columns:
                df[col] = 0

        processed_data = preprocessor.transform(df)
        
        proba = model.predict_proba(processed_data)[0][1]
        is_ddos = proba >= threshold
        
        return jsonify({
            'is_ddos': bool(is_ddos),
            'confidence': float(proba),
            'risk_level': _calculate_risk_level(proba)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def _calculate_risk_level(proba):
    if proba > 0.8: return 'Critical'
    if proba > 0.6: return 'High'
    if proba > 0.4: return 'Medium'
    return 'Low'

asgi_app = WsgiToAsgi(app)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)