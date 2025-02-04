import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import (classification_report, confusion_matrix, 
                             roc_curve, auc, precision_recall_curve,
                             average_precision_score)
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (Conv1D, MaxPooling1D, Flatten, Dense, 
                                   LSTM, Dropout, Bidirectional)
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
import ipaddress
import joblib
import warnings

warnings.filterwarnings('ignore')

class DDoSDetector:
    def __init__(self, model_type='cnn'):
        self.feature_columns = [
            'source_ip', 'http_method', 'url_path', 'user_agent',
            'content_length', 'num_headers', 'headers_length',
            'is_proxy', 'cookie_present', 'request_duration',
            'req_rate_1min', 'ua_variance', 'tls_version',
            'geo_location', 'device_type', 'hour_of_day', 'day_of_week'
        ]
        self.optimal_threshold = 0.5
        self.model_type = model_type
        self.preprocessor = None
        self.model = None

    def preprocess_data(self, df):
        """Data preprocessing pipeline"""
        # Remove potential leakage columns
        df = df.drop(columns=['attack_type', 'entropy_rate', 'packet_size_var'], errors='ignore')
        
        num_cols = ['content_length', 'num_headers', 'headers_length',
                   'request_duration', 'req_rate_1min', 'hour_of_day', 'day_of_week']
        
        categorical = ['http_method', 'tls_version', 'geo_location', 'device_type']
        
        df['source_ip'] = df['source_ip'].apply(
            lambda x: int(ipaddress.ip_address(x)) if isinstance(x, str) else 0
        )
        
        self.preprocessor = ColumnTransformer([
            ('num', StandardScaler(), num_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical)
        ])
        
        X = self.preprocessor.fit_transform(df)
        y = df['label'].values
        
        return X, y

    def build_model(self, input_shape):
        """Build CNN or RNN model"""
        if self.model_type == 'cnn':
            model = Sequential([
                Conv1D(128, 3, activation='relu', input_shape=input_shape),
                MaxPooling1D(2),
                Conv1D(64, 3, activation='relu'),
                MaxPooling1D(2),
                Flatten(),
                Dense(128, activation='relu'),
                Dropout(0.5),
                Dense(1, activation='sigmoid')
            ])
            model.compile(optimizer=Adam(0.001),
                        loss='binary_crossentropy',
                        metrics=['accuracy'])
        
        elif self.model_type == 'rnn':
            model = Sequential([
                Bidirectional(LSTM(64, return_sequences=True), input_shape=input_shape),
                Dropout(0.5),
                Bidirectional(LSTM(32)),
                Dense(64, activation='relu'),
                Dropout(0.3),
                Dense(1, activation='sigmoid')
            ])
            model.compile(optimizer=Adam(0.001),
                        loss='binary_crossentropy',
                        metrics=['accuracy'])
        else:
            raise ValueError("Invalid model type. Choose 'cnn' or 'rnn'.")
        
        return model

    def find_optimal_threshold(self, y_true, y_proba):
        """Find optimal threshold using precision-recall tradeoff"""
        precision, recall, thresholds = precision_recall_curve(y_true, y_proba)
        f2_scores = [(2 * p * r) / (p + r + 1e-9) for p, r in zip(precision, recall)]
        optimal_idx = np.argmax(f2_scores[:-1])
        self.optimal_threshold = thresholds[optimal_idx]

    def evaluate_model(self, X_test, y_test):
        """Evaluate model performance with metrics"""
        if self.model_type == 'cnn':
            X_test_reshaped = np.expand_dims(X_test, axis=2)
        elif self.model_type == 'rnn':
            X_test_reshaped = np.expand_dims(X_test, axis=1)
        
        y_proba = self.model.predict(X_test_reshaped).flatten()
        y_pred = (y_proba >= self.optimal_threshold).astype(int)
        
        # Classification report
        print("Classification Report:")
        print(classification_report(y_test, y_pred))
        
        # Confusion matrix
        plt.figure(figsize=(8, 6))
        sns.heatmap(confusion_matrix(y_test, y_pred), 
                   annot=True, fmt='d', cmap='Blues')
        plt.title('Confusion Matrix')
        plt.show()
        
        # ROC and PR curves
        self.plot_curves(y_test, y_proba)

    def plot_curves(self, y_test, y_proba):
        """Plot performance curves"""
        plt.figure(figsize=(12, 5))
        
        # ROC Curve
        plt.subplot(1, 2, 1)
        fpr, tpr, _ = roc_curve(y_test, y_proba)
        roc_auc = auc(fpr, tpr)
        plt.plot(fpr, tpr, label=f'ROC (AUC = {roc_auc:.2f})')
        plt.plot([0, 1], [0, 1], 'k--')
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('ROC Curve')
        plt.legend()
        
        # PR Curve
        plt.subplot(1, 2, 2)
        precision, recall, _ = precision_recall_curve(y_test, y_proba)
        avg_precision = average_precision_score(y_test, y_proba)
        plt.plot(recall, precision, label=f'PR (AP = {avg_precision:.2f})')
        plt.xlabel('Recall')
        plt.ylabel('Precision')
        plt.title('Precision-Recall Curve')
        plt.legend()
        
        plt.tight_layout()
        plt.show()

    def train(self, data_path):
        """Complete training pipeline"""
        df = pd.read_csv(data_path)
        X, y = self.preprocess_data(df)
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        if self.model_type == 'cnn':
            X_train_reshaped = np.expand_dims(X_train, axis=2)
            input_shape = (X_train.shape[1], 1)
        elif self.model_type == 'rnn':
            X_train_reshaped = np.expand_dims(X_train, axis=1)
            input_shape = (1, X_train.shape[1])
        
        self.model = self.build_model(input_shape)
        
        early_stop = EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)
        
        history = self.model.fit(
            X_train_reshaped, y_train,
            validation_split=0.2,
            epochs=15,
            batch_size=1024,
            callbacks=[early_stop],
            verbose=1
        )
        
        y_proba = self.model.predict(X_train_reshaped).flatten()
        self.find_optimal_threshold(y_train, y_proba)
        
        self.evaluate_model(X_test, y_test)
        
    def predict_request(self, request_data):
     """Real-time prediction handler for neural networks"""
     required_features = set(self.feature_columns)
     provided_features = set(request_data.keys())
     if missing := required_features - provided_features:
         raise ValueError(f"Missing features: {missing}")

     try:
         df = pd.DataFrame([request_data])
        
         if 'timestamp' in df.columns:
             df['timestamp'] = pd.to_datetime(df['timestamp'])
             df['hour_of_day'] = df['timestamp'].dt.hour
             df['day_of_week'] = df['timestamp'].dt.dayofweek
         else:
             raise ValueError("Missing timestamp in request data")
        
         df['source_ip'] = df['source_ip'].apply(
             lambda x: int(ipaddress.ip_address(x)) if isinstance(x, str) else 0
        )
        
         processed = self.preprocessor.transform(df)
        
         if self.model_type == 'cnn':
             processed = np.expand_dims(processed, axis=2)
         elif self.model_type == 'rnn':
             processed = np.expand_dims(processed, axis=1)
        
     except Exception as e:
         raise ValueError(f"Feature processing error: {str(e)}")

     if not self.model or not self.preprocessor:
         raise ValueError("Model not loaded")

     proba = self.model.predict(processed, verbose=0)[0][0]
    
     return {
        'is_ddos': proba >= self.optimal_threshold,
        'confidence': float(proba),
        'risk_level': self._calculate_risk_level(proba)
    }

    def _calculate_risk_level(self, proba):
     """Dynamic risk level calculation"""
     if proba > 0.9: return 'Critical'
     if proba > 0.7: return 'High'
     if proba > 0.4: return 'Medium'
     return 'Low'

    def save_model(self, path='ddos_detector.h5'):
        """Save trained model"""
        self.model.save(path)
        joblib.dump(self.preprocessor, 'preprocessor.pkl')

    def load_model(self, model_path='ddos_detector.h5', preprocessor_path='preprocessor.pkl'):
        """Load trained model"""
        self.model = tf.keras.models.load_model(model_path)
        self.preprocessor = joblib.load(preprocessor_path)

if __name__ == "__main__":
    detector = DDoSDetector(model_type='cnn')  # cnn or rnn
    detector.train('enhanced_ddos_dataset.csv')
    detector.save_model()
    detector.load_model()
    
    sample_request = {
    'source_ip': '192.168.1.100',
    'http_method': 'GET',
    'url_path': '/api/v1/login',
    'user_agent': 'Mozilla/5.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)',
    'content_length': 0,
    'http_version': 'HTTP/1.0',
    'num_headers': 5,
    'headers_length': 256,
    'is_proxy': 1,
    'cookie_present': 0,
    'request_duration': 0.05,
    'req_rate_1min': 5,
    'ua_variance': 8,
    'tls_version': None,
    'geo_location': 'ASIA',
    'device_type': 'server',
    'timestamp': pd.Timestamp.now().isoformat(),
    'hour_of_day': 12,
    'day_of_week': 2
}
    
    prediction = detector.predict_request(sample_request)
    print(f"\nDDoS Detection Result:")
    print(f"Prediction: {'Attack' if prediction['is_ddos'] else 'Normal'}")
    print(f"Confidence: {prediction['confidence']:.2%}")
    print(f"Risk Level: {prediction['risk_level']}")