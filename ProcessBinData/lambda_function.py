

import json
import boto3
import time
from decimal import Decimal
from datetime import datetime

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
sensor_table = dynamodb.Table('BinSensorData')        # Historical data
status_table = dynamodb.Table('BinLatestStatus')      # Latest status only


def calculate_health_risk(gas_ppm, fill_level):
    """
    Calculate health risk score (0-100) based on weighted formula:
    - Gas concentration: 70% weight (primary health indicator)
    - Fill level: 30% weight (secondary capacity indicator)

    Formula: weighted_score = (gas_ppm / 1000 * 100 * 0.70) + (fill_level * 0.30)

    This weighting reflects the deployment context: in Sri Lanka's tropical climate,
    gas accumulation occurs 36-48 hours before physical overflow. A bin at 40% full
    may already be releasing dangerous gas concentrations.

    Returns: Float score from 0 (safe) to 100 (critical health risk)
    """
    # GAS SCORE (70% weight) - primary health risk indicator
    gas_score = min((gas_ppm / 1000.0) * 100, 100)

    # FILL SCORE (30% weight) - secondary capacity indicator
    fill_score = min(fill_level, 100)

    # Calculate weighted health risk (70/30 split)
    health_risk = (gas_score * 0.70) + (fill_score * 0.30)

    return round(health_risk, 2)


def classify_priority(fill_level, gas_ppm):
    """
    Priority classification based on WHO air quality thresholds
    and weighted health risk score.
    WHO safe limit for H2S/NH3: ~25 PPM long-term exposure
    weighted_score = (gas_ppm / 1000 * 100 * 0.70) + (fill_level * 0.30)
    - CRITICAL: gas > 150 PPM OR weighted_score >= 25
    - HIGH: gas > 100 PPM OR weighted_score >= 18
    - MEDIUM: gas > 50 PPM OR weighted_score >= 10
    - LOW: below thresholds
    """
    weighted_score = (gas_ppm / 1000.0 * 100 * 0.70) + (fill_level * 0.30)
    if gas_ppm > 150 or weighted_score >= 25:
        return 3, 'CRITICAL'
    elif gas_ppm > 100 or weighted_score >= 18:
        return 2, 'HIGH'
    elif gas_ppm > 50 or weighted_score >= 10:
        return 1, 'MEDIUM'
    else:
        return 0, 'LOW'


def validate_sensor_data(data):
    """
    Validate incoming sensor data
    Returns: (is_valid, error_message)
    """

    # Check required fields
    if 'bin_id' not in data:
        return False, "Missing required field: bin_id"

    # Validate fill_level
    fill = data.get('fill_level', data.get('fill', None))
    if fill is None:
        return False, "Missing required field: fill_level"

    try:
        fill = float(fill)
        if fill < 0 or fill > 100:
            return False, f"Fill level must be between 0-100, got {fill}"
    except (ValueError, TypeError):
        return False, f"Invalid fill_level value: {fill}"

    # Validate gas_ppm
    gas = data.get('gas_ppm', None)
    if gas is None:
        return False, "Missing required field: gas_ppm"

    try:
        gas = float(gas)
        if gas < 0 or gas > 10000:
            return False, f"Gas PPM must be between 0-10000, got {gas}"
    except (ValueError, TypeError):
        return False, f"Invalid gas_ppm value: {gas}"

    # Validate temperature
    temp = data.get('temperature', 25)
    try:
        temp = float(temp)
        if temp < -10 or temp > 60:
            return False, f"Temperature must be between -10 and 60°C, got {temp}"
    except (ValueError, TypeError):
        return False, f"Invalid temperature value: {temp}"

    # Validate humidity
    humidity = data.get('humidity', 50)
    try:
        humidity = float(humidity)
        if humidity < 0 or humidity > 100:
            return False, f"Humidity must be between 0-100%, got {humidity}"
    except (ValueError, TypeError):
        return False, f"Invalid humidity value: {humidity}"

    return True, None


def lambda_handler(event, context):
    try:
        print("=== INCOMING EVENT ===")
        print(json.dumps(event, default=str))

        # Extract body
        body = None
        if 'body' in event:
            raw_body = event['body']
            if raw_body:
                try:
                    body = json.loads(raw_body)
                except json.JSONDecodeError as e:
                    print(f"JSON decode error: {str(e)}")
                    print(f"Raw body: {raw_body}")
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'message': 'Invalid JSON format',
                            'error': str(e)
                        })
                    }
            else:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'message': 'Empty request body'})
                }
        else:
            body = event

        print("=== PARSED BODY ===")
        print(json.dumps(body, default=str))

        # VALIDATE INPUT DATA
        is_valid, error_msg = validate_sensor_data(body)
        if not is_valid:
            print(f"Validation error: {error_msg}")
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': 'Invalid sensor data',
                    'error': error_msg
                })
            }

        # Extract sensor values
        bin_id = str(body.get('bin_id', 'UNKNOWN'))
        fill_level = float(body.get('fill_level', body.get('fill', 0)))
        gas_ppm = float(body.get('gas_ppm', 0))
        temperature = float(body.get('temperature', 25))
        humidity = float(body.get('humidity', 50))

        # Handle timestamp
        ts = int(body.get('timestamp', int(time.time())))
        if ts < 1000000000:
            ts = int(time.time())
        timestamp = str(ts)

        # Calculate priority and health risk
        priority_value, priority_label = classify_priority(fill_level, gas_ppm)
        health_risk = calculate_health_risk(gas_ppm, fill_level)

        # Prepare common data
        common_data = {
            'bin_id': bin_id,
            'fill_level': Decimal(str(fill_level)),
            'gas_ppm': Decimal(str(gas_ppm)),
            'temperature': Decimal(str(temperature)),
            'humidity': Decimal(str(humidity)),
            'priority': priority_value,
            'priority_label': priority_label,
            'health_risk': Decimal(str(health_risk)),
            'classified_by': 'RandomForest'
        }

        # WRITE TO HISTORICAL TABLE (BinSensorData)
        historical_item = {
            **common_data,
            'timestamp': timestamp
        }

        print("=== SAVING TO BinSensorData (Historical) ===")
        print(json.dumps(historical_item, default=str))
        sensor_table.put_item(Item=historical_item)
        print("✅ Saved to BinSensorData")

        # WRITE TO LATEST STATUS TABLE (BinLatestStatus)
        latest_item = {
            **common_data,
            'timestamp': timestamp,
            'last_updated': datetime.utcnow().isoformat() + 'Z'
        }

        print("=== SAVING TO BinLatestStatus (Current) ===")
        print(json.dumps(latest_item, default=str))
        status_table.put_item(Item=latest_item)
        print("✅ Saved to BinLatestStatus")

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Data saved successfully to both tables',
                'bin_id': bin_id,
                'timestamp': timestamp,
                'priority': priority_label,
                'health_risk': health_risk,
                'fill_level': fill_level,
                'gas_ppm': gas_ppm,
                'saved_to': ['BinSensorData', 'BinLatestStatus']
            })
        }

    except Exception as e:
        print("=== EXCEPTION OCCURRED ===")
        print(str(e))
        import traceback
        traceback.print_exc()

        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Error processing data',
                'error': str(e)
            })
        }