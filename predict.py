import sys
import json
from model import DDoSDetector

def predict_request():
    request_data = json.loads(sys.argv[1])
    
    detector = DDoSDetector()
    detector.load_model()
    
    result = detector.predict_request(request_data)
    
    print(json.dumps(result))

if __name__ == "__main__":
    predict_request()