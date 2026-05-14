"""
MyCollect - CollectionSchedule Lambda Function
Student: Dinithi Wijesinghe (10952811)
Supervisor: Miss. Dharani Rajasinghe

PURPOSE: Manage waste collection schedules per area
- GET /schedule?area=Homagama  - Get schedule for an area
- PUT /schedule                 - Update schedule for an area

FIX: area is now read from query parameters instead of being hardcoded
     so the function works for any area, not just Homagama
"""

import json
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-2')
table = dynamodb.Table('CollectionSchedule')


def lambda_handler(event, context):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS'
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    method = event.get('httpMethod')

    try:
        if method == 'GET':
            # FIX: read area from query params, default to Homagama
            params = event.get('queryStringParameters') or {}
            area = params.get('area', 'Homagama')

            result = table.get_item(Key={'area': area})
            schedule = result.get('Item', {})
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'schedule': schedule})
            }

        elif method == 'PUT':
            body = json.loads(event.get('body') or '{}')
            area = body.get('area', 'Homagama')

            table.put_item(Item={
                'area': area,
                'monday_date': body.get('monday_date', ''),
                'monday_time': body.get('monday_time', '8:00 AM - 10:00 AM'),
                'monday_note': body.get('monday_note', ''),
                'thursday_date': body.get('thursday_date', ''),
                'thursday_time': body.get('thursday_time', '8:00 AM - 10:00 AM'),
                'thursday_note': body.get('thursday_note', ''),
                'updated_at': datetime.utcnow().isoformat(),
                'updated_by': body.get('updated_by', 'admin')
            })
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'message': 'Schedule updated'})
            }

        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'success': False, 'message': 'Method not allowed'})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'success': False, 'message': str(e)})
        }