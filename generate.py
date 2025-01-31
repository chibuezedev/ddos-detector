import csv
from faker import Faker
import random
from datetime import datetime, timedelta
import numpy as np
import hashlib

fake = Faker()
random.seed(42)
np.random.seed(42)

# Configuration
DATASET_SIZE = 1000000  # 1M samples
BALANCE_RATIO = 0.5
NORMAL_IP_POOL_SIZE = 20000
ATTACK_IP_POOL_SIZE = 1000
TIMEWINDOW_MINUTES = 1

# feature ranges
ENHANCED_RANGES = {
    'normal': {
        'req_per_min': (1, 30),
        'content_length': (0, 2000),
        'num_headers': (5, 20),
        'duration': (0.05, 2.0),
        'ua_per_ip': (1, 3),
        'entropy': (0.3, 0.7),
        'tls_versions': ['1.2', '1.3', None],
        'geo_weights': {'US': 0.4, 'EU': 0.3, 'ASIA': 0.2, 'OTHER': 0.1},
        'device_weights': ['server', 'desktop', 'mobile']
    },
    'attack': {
        'types': ['volumetric', 'protocol', 'application'],
        'volumetric': {
            'req_per_min': (5000, 20000),
            'duration': (0.1, 5),
            'source_ips': 50
        },
        'protocol': {
            'req_per_min': (100, 1000),
            'duration': (10, 60),
            'malformed_pct': 0.3
        },
        'application': {
            'req_per_min': (500, 5000),
            'duration': (5, 30),
            'ssl_ratio': 0.8
        },
        'content_length': (0, 10000),
        'num_headers': (1, 25),
        'ua_per_ip': (1, 20),
        'entropy': (0.7, 1.0),
        'tls_versions': [None, '1.0', '1.1'],
        'geo_weights': {'ASIA': 0.5, 'EU': 0.3, 'US': 0.1, 'OTHER': 0.1},
        'device_weights': ['server', 'iot']
    }
}

def generate_ip(network_type):
    """Generate IP addresses with realistic distributions"""
    if network_type == 'normal':
        return fake.ipv4(network=True)
    return fake.ipv4() if random.random() > 0.8 else fake.ipv6()

def generate_ua(attack=False):
    """Generate user agents with attack patterns"""
    if attack:
        if random.random() > 0.6:
            return fake.user_agent()
        return random.choice([
            '',  # Empty UA
            'XATTACK-' + fake.md5()[:8],
            'python-requests/2.9.1',
            'curl/7.35.0',
            'Mozilla/5.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)'
        ])
    return fake.user_agent()

def generate_attack_ip_pool(size):
    """Generate diverse attack IP pool"""
    return list(set([
        fake.ipv4() if random.random() > 0.3 else fake.ipv6()
        for _ in range(size)
    ]))

def generate_temporal_features(base_time, is_attack):
    """Generate complex temporal patterns"""
    if is_attack:
        burstiness = np.random.pareto(2.5)
        intervals = np.random.exponential(0.001 * burstiness)
    else:
        intervals = np.random.weibull(1.2)
    return base_time + timedelta(seconds=int(intervals))

def inject_noise(features, is_attack):
    """Add realistic network noise"""
    # Measurement errors
    if random.random() < 0.05:
        features['content_length'] *= np.random.uniform(0.9, 1.1)
    
    # Missing data
    if random.random() < 0.03:
        features['user_agent'] = None
    
    # Transient issues
    if not is_attack and random.random() < 0.01:
        features['request_duration'] *= np.random.uniform(2, 10)
    
    # Benign outliers
    if not is_attack and random.random() < 0.005:
        features['req_rate_1min'] *= np.random.uniform(5, 20)
    
    return features

# Generate enhanced dataset
with open('enhanced_ddos_dataset.csv', 'w', newline='') as csvfile:
    fieldnames = [
    'timestamp', 'hour_of_day', 'day_of_week', 'source_ip', 'http_method', 'url_path', 'user_agent',
    'content_length', 'http_version',  'num_headers', 'headers_length', 'is_proxy',
    'cookie_present', 'request_duration', 'req_rate_1min', 'ua_variance',
    'tls_version', 'geo_location', 'device_type', 'entropy_rate', 'packet_size_var', 'attack_type',
    'label'
]
    
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    
    # Generate IP pools
    attack_ips = generate_attack_ip_pool(ATTACK_IP_POOL_SIZE)
    normal_ips = [fake.ipv4() for _ in range(NORMAL_IP_POOL_SIZE)]
    
    # Track behavioral patterns
    ip_behavior = {}
    
    for i in range(DATASET_SIZE):
        if i % 10000 == 0:
            print(f"Generated {i}/{DATASET_SIZE} records...")
        
        is_attack = i >= DATASET_SIZE * BALANCE_RATIO
        record_type = 'attack' if is_attack else 'normal'
        attack_type = random.choice(ENHANCED_RANGES['attack']['types']) if is_attack else None
        
        # Generate base features with temporal patterns
        timestamp = generate_temporal_features(
            datetime.now() - timedelta(days=30),
            is_attack
        )
        
        # IP behavior simulation
        if is_attack:
            source_ip = random.choice(attack_ips)
            req_rate = np.random.randint(
                *ENHANCED_RANGES['attack'][attack_type]['req_per_min']
            )
            ua_variance = np.random.randint(
                *ENHANCED_RANGES['attack']['ua_per_ip'],
                size=1
            )[0]
        else:
            source_ip = random.choice(normal_ips)
            req_rate = np.random.randint(*ENHANCED_RANGES['normal']['req_per_min'])
            ua_variance = np.random.randint(
                *ENHANCED_RANGES['normal']['ua_per_ip'],
                size=1
            )[0]
            
        
        # Generate enhanced features
        record = {
            'timestamp': timestamp.isoformat(),
            'hour_of_day': timestamp.hour,  # Add this
            'day_of_week': timestamp.weekday(),  # Add this
            'source_ip': source_ip,
            'http_method': random.choices(
                ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
                weights=[85, 10, 2, 1, 2],
                k=1
            )[0],
            'url_path': random.choices(
                ['/', '/api', '/login', '/static/image.jpg', '/download'],
                weights=[40, 30, 15, 10, 5],
                k=1
            )[0],
            'user_agent': generate_ua(is_attack),
            'content_length': int(np.random.randint(
             *ENHANCED_RANGES[record_type]['content_length']
             )),
            'http_version': random.choices(
                ['HTTP/1.0', 'HTTP/1.1', 'HTTP/2'],
                weights=[5, 85, 10] if not is_attack else [20, 70, 10],
                k=1
            )[0],
            'num_headers': int(np.random.randint(
        *ENHANCED_RANGES[record_type]['num_headers']
    )),
            'headers_length': int(np.random.randint(100, 2000)),
            'is_proxy': 1 if random.random() > 0.95 and is_attack else 0,
            'cookie_present': 0 if is_attack else int(random.random() > 0.3),
            'request_duration': float(np.random.uniform(
        *ENHANCED_RANGES['attack'][attack_type]['duration'] if is_attack 
        else ENHANCED_RANGES['normal']['duration']
    )),
            'req_rate_1min': int(req_rate),
            'ua_variance': int(ua_variance),
            'tls_version': random.choices(
                ENHANCED_RANGES[record_type]['tls_versions'],
                weights=[0.7, 0.2, 0.1] if record_type == 'normal' else [0.1, 0.3, 0.6],
                k=1
            )[0],
            'geo_location': random.choices(
                list(ENHANCED_RANGES[record_type]['geo_weights'].keys()),
                weights=ENHANCED_RANGES[record_type]['geo_weights'].values(),
                k=1
            )[0],
            'device_type': random.choices(
                ENHANCED_RANGES[record_type]['device_weights'],
                k=1
            )[0],
            'entropy_rate': float(np.random.uniform(
        *ENHANCED_RANGES[record_type]['entropy']
    )),
            'packet_size_var': float(np.random.exponential(0.5)),
            'attack_type': attack_type,
            'label': int(is_attack)
        }
        
        if source_ip not in ip_behavior:
            ip_behavior[source_ip] = {
                'fingerprint': hashlib.md5(str(random.getrandbits(256)).encode()).hexdigest()[:16],
                'request_count': 0
            }
        ip_behavior[source_ip]['request_count'] += 1
        
        record = inject_noise(record, is_attack)
        
        writer.writerow(record)

print("Enhanced dataset generation complete!")