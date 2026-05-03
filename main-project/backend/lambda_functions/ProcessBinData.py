import json
import boto3
import pickle
import numpy as np
from datetime import datetime, timezone
from decimal import Decimal

MODEL_PATH = '/var/task/model.pkl'

with open(MODEL_PATH, 'rb') as f:
    model = pickle.load(f)

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-2')
sensor_table = dynamodb.Table('BinSensorData')
status_table = dynamodb.Table('BinLatestStatus')

def lambda_handler(event, context):
    try:
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        elif isinstance(event, dict) and 'bin_id' in event:
            body = event
        else:
            body = event.get('body', event)

        bin_id = body.get('bin_id', 'UNKNOWN')
        fill_level = float(body.get('fill_level', 0))
        gas_ppm = float(body.get('gas_ppm', 0))
        temperature = float(body.get('temperature', 30))
        humidity = float(body.get('humidity', 75))
        timestamp = int(body.get('timestamp', datetime.now(timezone.utc).timestamp()))

        gas_score = (gas_ppm / 1000) * 100
        weighted_score = round(min((gas_score * 0.70) + (fill_level * 0.30), 100), 2)
        features = np.array([[fill_level, gas_ppm, temperature, humidity, weighted_score]])
        prediction = model.predict(features)[0]
        priority_map = {'LOW': 0, 'MEDIUM': 1, 'HIGH': 2, 'CRITICAL': 3}
        priority_num = priority_map.get(prediction, 0)
        now_str = datetime.now(timezone.utc).isoformat()

        sensor_table.put_item(Item={
            'bin_id': bin_id,
            'timestamp': str(timestamp),
            'fill_level': Decimal(str(round(fill_level, 2))),
            'gas_ppm': Decimal(str(round(gas_ppm, 2))),
            'temperature': Decimal(str(temperature)),
            'humidity': Decimal(str(humidity)),
            'health_risk': Decimal(str(weighted_score)),
            'priority': priority_num,
            'priority_label': prediction,
            'classified_by': 'RandomForest_ML'
        })

        status_table.put_item(Item={
            'bin_id': bin_id,
            'fill_level': Decimal(str(round(fill_level, 2))),
            'gas_ppm': Decimal(str(round(gas_ppm, 2))),
            'temperature': Decimal(str(temperature)),
            'humidity': Decimal(str(humidity)),
            'health_risk': Decimal(str(weighted_score)),
            'priority': priority_num,
            'priority_label': prediction,
            'last_updated': now_str,
            'timestamp': str(timestamp),
            'classified_by': 'RandomForest_ML'
        })

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'Classified by Random Forest ML',
                'bin_id': bin_id,
                'priority': prediction,
                'health_risk': weighted_score,
                'classified_by': 'RandomForest_ML'
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
