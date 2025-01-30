import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from xgboost import XGBClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.metrics import (classification_report, confusion_matrix, 
                             roc_curve, auc, precision_recall_curve,
                             average_precision_score, fbeta_score)
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import warnings
import ipaddress
from sklearn.calibration import CalibratedClassifierCV
from imblearn.ensemble import BalancedRandomForestClassifier

warnings.filterwarnings('ignore')

class EnhancedDDoSDetector:
    def __init__(self, model_type='xgb'):
        self.feature_columns = [
            'source_ip', 'http_method', 'url_path', 'user_agent',
            'content_length', 'num_headers', 'headers_length',
            'is_proxy', 'cookie_present', 'request_duration',
            'req_rate_1min', 'ua_variance', 'tls_version',
            'geo_location', 'device_type', 'hour_of_day', 'day_of_week'
        ]
        optimal_threshold = 0.5
        self.model_type = model_type
        self.optimal_threshold = optimal_threshold

    def preprocess_data(self, df):
        """Enhanced preprocessing with type validation"""
        # Convert numerical fields
        num_cols = ['content_length', 'num_headers', 'headers_length',
                   'request_duration', 'req_rate_1min', 'ua_variance',
                   'hour_of_day', 'day_of_week', 'source_ip']
        
        for col in num_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(float)
        
        # Convert IP addresses
        df['source_ip'] = df['source_ip'].apply(
            lambda x: int(ipaddress.ip_address(x)) if isinstance(x, str) else 0
        )
        
        # Handle categorical features
        categorical = ['http_method', 'tls_version', 'geo_location', 'device_type']
        df[categorical] = df[categorical].astype('category')
        
        # Create preprocessor
        numerical = ['source_ip', 'content_length', 'num_headers', 
                    'headers_length', 'request_duration', 'req_rate_1min', 
                    'ua_variance', 'hour_of_day', 'day_of_week']
        
        self.preprocessor = ColumnTransformer([
            ('num', StandardScaler(), numerical),
            ('cat', OneHotEncoder(max_categories=20, handle_unknown='infrequent_if_exist'), categorical)
        ], sparse_threshold=0.8)
        
        return self.preprocessor.fit_transform(df), df
    
    def train(self, data_path):
        """Optimized training"""
        # Load data with type specification
        dtypes = {
            'user_agent': 'category',
            'url_path': 'category',
            'tls_version': 'category',
            'geo_location': 'category',
            'device_type': 'category'
        }
        df = pd.read_csv(data_path, dtype=dtypes)
        
        # Split data before preprocessing
        train_df, test_df = train_test_split(
            df, test_size=0.2, random_state=42, stratify=df['label']
        )
        
        # Process in chunks
        chunk_size = 100000
        X_train = []
        
        for i in range(0, len(train_df), chunk_size):
            chunk = train_df.iloc[i:i+chunk_size]
            X_chunk = self.preprocessor.transform(chunk)
            X_train.append(X_chunk)
            
        X_train = np.vstack(X_train)
        y_train = train_df['label']
        
        # Train with incremental learning
        self.model = XGBClassifier(
            tree_method='hist',
            grow_policy='lossguide',
            max_bin=256,
            n_estimators=1000,
            learning_rate=0.05,
            eval_metric='logloss',
            early_stopping_rounds=20
        )
        
        self.model.fit(X_train, y_train,
                      eval_set=[(self.preprocessor.transform(test_df), test_df['label'])])

    def plot_feature_importance(self):
        """Enhanced feature importance visualization"""
        if not self.model:
            raise ValueError("Model not trained yet")
            
        if self.model_type == 'xgb':
            importances = self.model.feature_importances_
        else:
            importances = self.model.feature_importances_
            
        feature_names = self.preprocessor.get_feature_names_out()
        sorted_idx = np.argsort(importances)[::-1]
        
        plt.figure(figsize=(14, 8))
        plt.title("Feature Importances")
        plt.barh(range(len(sorted_idx)), importances[sorted_idx], align='center')
        plt.yticks(range(len(sorted_idx)), [feature_names[i] for i in sorted_idx])
        plt.gca().invert_yaxis()
        plt.xlabel("Relative Importance")
        plt.tight_layout()
        plt.show()

    def plot_attack_types(self, df):
        """Visualize attack type distribution"""
        plt.figure(figsize=(10, 6))
        df['attack_type'].value_counts().plot(kind='bar')
        plt.title('Distribution of Attack Types')
        plt.xlabel('Attack Type')
        plt.ylabel('Count')
        plt.xticks(rotation=45)
        plt.show()

    def find_optimal_threshold(self, y_true, y_proba):
        """Find optimal classification threshold using precision-recall tradeoff"""
        precision, recall, thresholds = precision_recall_curve(y_true, y_proba)
        f2_scores = [(2 * precision[i] * recall[i]) / (precision[i] + recall[i] + 1e-9) 
                    for i in range(len(precision)-1)]
        optimal_idx = np.argmax(f2_scores)
        self.optimal_threshold = thresholds[optimal_idx]
        return self.optimal_threshold

    def evaluate_model(self, X_test, y_test):
        """Enhanced model evaluation with threshold tuning"""
        y_proba = self.model.predict_proba(X_test)[:, 1]
        y_pred = (y_proba >= self.optimal_threshold).astype(int)
        
        # Classification report
        print("Classification Report (Optimized Threshold):")
        print(classification_report(y_test, y_pred))
        
        print(f"\nF2 Score: {fbeta_score(y_test, y_pred, beta=2):.4f}")
        
        # Confusion matrix
        plt.figure(figsize=(8, 6))
        sns.heatmap(confusion_matrix(y_test, y_pred), annot=True, fmt='d', 
                   cmap='Blues', cbar=False)
        plt.title("Confusion Matrix")
        plt.show()
        
        # ROC and PR curves
        self.plot_curves(y_test, y_proba)

    def plot_curves(self, y_test, y_proba):
        """Plot combined ROC and PR curves"""
        plt.figure(figsize=(14, 6))
        
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
        """Enhanced training pipeline"""
        # Load and preprocess data
        X, df = self.preprocess_data(pd.read_csv(data_path))
        y = df['label'].values
        
        # Split dataset
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Model selection
        if self.model_type == 'xgb':
            base_model = XGBClassifier(
                n_estimators=300,
                max_depth=7,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                scale_pos_weight=np.sqrt(np.sum(y == 0)/np.sum(y == 1)),
                eval_metric='logloss',
                use_label_encoder=False,
                random_state=42
            )
            self.model = CalibratedClassifierCV(base_model, method='isotonic', cv=3)
        else:
            self.model = BalancedRandomForestClassifier(
                n_estimators=200,
                max_depth=25,
                min_samples_split=8,
                min_samples_leaf=2,
                max_features='sqrt',
                sampling_strategy='auto',
                n_jobs=-1,
                random_state=42
            )
        
        # Train model
        self.model.fit(X_train, y_train)
        
        # Find optimal threshold
        y_proba = self.model.predict_proba(X_train)[:, 1]
        self.find_optimal_threshold(y_train, y_proba)
        
        # Evaluate performance
        self.evaluate_model(X_test, y_test)
        self.plot_feature_importance()
        self.plot_attack_types(df[df['label'] == 1])

    def predict_request(self, request_data):
        """Enhanced real-time prediction"""
        required_features = set(self.feature_columns)
        provided_features = set(request_data.keys())
        if missing := required_features - provided_features:
            raise ValueError(f"Missing features: {missing}")
            
        try:
            df = pd.DataFrame([request_data])
            df['source_ip'] = df['source_ip'].apply(
                lambda x: int(ipaddress.ip_address(x)) if isinstance(x, str) else 0
            )
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df['hour_of_day'] = df['timestamp'].dt.hour
            df['day_of_week'] = df['timestamp'].dt.dayofweek
        except Exception as e:
            raise ValueError(f"Feature processing error: {e}")
            
        if not self.model or not self.preprocessor:
            raise ValueError("Model not loaded")
            
        processed = self.preprocessor.transform(df)
        proba = self.model.predict_proba(processed)[0][1]
        
        return {
            'is_ddos': proba >= self.optimal_threshold,
            'confidence': proba,
            'risk_level': self._calculate_risk_level(proba)
        }

    def _calculate_risk_level(self, proba):
        """Dynamic risk level calculation"""
        if proba > 0.8: return 'Critical'
        if proba > 0.6: return 'High'
        if proba > 0.4: return 'Medium'
        return 'Low'

    def save_model(self, path='ddos_detector.pkl'):
        """Save complete model package"""
        joblib.dump({
            'model': self.model,
            'preprocessor': self.preprocessor,
            'feature_columns': self.feature_columns,
            'threshold': self.optimal_threshold
        }, path)

    def load_model(self, path='ddos_detector.pkl'):
        """Load complete model package"""
        components = joblib.load(path)
        self.model = components['model']
        self.preprocessor = components['preprocessor']
        self.feature_columns = components['feature_columns']
        self.optimal_threshold = components.get('threshold', 0.5)

if __name__ == "__main__":
    # Initialize and train detector
    detector = EnhancedDDoSDetector(model_type='xgb')
    detector.train('enhanced_ddos_dataset.csv')
    detector.save_model()
    
    # Example prediction
    sample_request = {
        'source_ip': '192.168.1.100',
        'http_method': 'GET',
        'url_path': '/api/v1/login',
        'user_agent': 'XATTACK-a1b2c3d4',
        'content_length': 0,
        'http_version': 'HTTP/1.0',
        'num_headers': 5,
        'headers_length': 256,
        'is_proxy': 1,
        'cookie_present': 0,
        'request_duration': 0.05,
        'req_rate_1min': 1500,
        'ua_variance': 8,
        'tls_version': None,
        'geo_location': 'ASIA',
        'device_type': 'server',
        'entropy_rate': 0.85,
        'packet_size_var': 1.2,
        'timestamp': pd.Timestamp.now().isoformat()
    }
    
    prediction = detector.predict_request(sample_request)
    print(f"\nDDoS Detection Result:")
    print(f"Prediction: {'Attack' if prediction['is_ddos'] else 'Normal'}")
    print(f"Confidence: {prediction['confidence']:.2%}")
    print(f"Risk Level: {prediction['risk_level']}")