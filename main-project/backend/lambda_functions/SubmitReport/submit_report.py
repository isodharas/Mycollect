"""
MyCollect - SubmitReport Lambda Function
Student: Dinithi Wijesinghe (10952811)
Supervisor: Miss. Dharani Rajasinghe

PURPOSE: Handle citizen issue reports
- POST /report - Submit a new report
- GET /report  - Retrieve all reports (admin)
"""

import json
import boto3
import uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-2')
table = dynamodb.Table('CitizenReports')


def lambda_handler(event, context):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        body = json.loads(event.get('body') or '{}')

        if event.get('httpMethod') == 'POST':
            report_id = str(uuid.uuid4())
            item = {
                'report_id': report_id,
                'phone': body.get('phone', 'Unknown'),
                'name': body.get('name', 'Unknown'),
                'bin_id': body.get('bin_id', 'General'),
                'report_type': body.get('report_type', 'General Issue'),
                'description': body.get('description', ''),
                'area': body.get('area', 'Homagama'),
                'status': 'pending',
                'timestamp': datetime.utcnow().isoformat(),
            }
            table.put_item(Item=item)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'report_id': report_id,
                    'message': 'Report submitted successfully'
                })
            }

        elif event.get('httpMethod') == 'GET':
            result = table.scan()
            items = sorted(
                result.get('Items', []),
                key=lambda x: x.get('timestamp', ''),
                reverse=True
            )
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'reports': items})
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