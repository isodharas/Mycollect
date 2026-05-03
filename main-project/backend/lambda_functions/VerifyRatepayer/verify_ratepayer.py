"""
MyCollect - VerifyRatepayer Lambda Function
Student: Dinithi Wijesinghe (10952811)
Supervisor: Miss. Dharani Rajasinghe

PURPOSE: Verify if a registration number exists in the municipal ratepayer registry
- GET  /verify?registration_number=REG001
- POST /verify with body { "registration_number": "REG001" }

FIX: registration_number normalised (strip + upper) once at the top
     to avoid calling .upper() in multiple places
"""

import json
import boto3

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-2')


def lambda_handler(event, context):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    }

    try:
        # Handle preflight
        if event.get('httpMethod') == 'OPTIONS':
            return {'statusCode': 200, 'headers': headers, 'body': ''}

        # Get registration number from query params or body
        params = event.get('queryStringParameters') or {}
        reg_number = params.get('registration_number', '')

        if not reg_number:
            body = json.loads(event.get('body') or '{}')
            reg_number = body.get('registration_number', '')

        if not reg_number:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'verified': False, 'message': 'Registration number required'})
            }

        # FIX: normalise once here — strip whitespace and uppercase
        reg_number = reg_number.strip().upper()

        # Check DynamoDB
        table = dynamodb.Table('RatepayerRegistry')
        response = table.get_item(Key={'registration_number': reg_number})

        if 'Item' in response:
            item = response['Item']
            if item.get('active', False):
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'verified': True,
                        'name': item.get('name', ''),
                        'address': item.get('address', ''),
                        'street': item.get('street', ''),
                        'registration_number': reg_number,
                        'message': 'Verified ratepayer'
                    })
                }

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'verified': False,
                'message': 'Registration number not found in municipal records'
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'verified': False, 'message': str(e)})
        }