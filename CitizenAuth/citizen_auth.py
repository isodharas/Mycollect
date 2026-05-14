"""
MyCollect - CitizenAuth Lambda Function
Student: Dinithi Wijesinghe (10952811)
Supervisor: Miss. Dharani Rajasinghe

PURPOSE: Handle citizen signup and signin
- POST /citizen/signup
- POST /citizen/signin

NOTE: SHA-256 password hashing is used for prototype scope.
      Production deployment would use bcrypt with per-user salt.
"""

import json
import boto3
import hashlib
from datetime import datetime

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-2')
citizens_table = dynamodb.Table('CitizenUsers')


def hash_password(password):
    """
    SHA-256 hash for prototype use.
    NOTE: Production would use bcrypt with random salt per user.
    """
    return hashlib.sha256(password.encode()).hexdigest()


def lambda_handler(event, context):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    path = event.get('path', '')
    method = event.get('httpMethod', '')

    try:
        body = json.loads(event.get('body') or '{}')

        # SIGNUP
        if '/citizen/signup' in path and method == 'POST':
            phone = body.get('phone', '').strip()
            password = body.get('password', '').strip()
            name = body.get('name', '').strip()
            is_ratepayer = body.get('is_ratepayer', False)
            registration_number = body.get('registration_number', '')
            street = body.get('street', '')
            address = body.get('address', '')

            if not phone or not password or not name:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'message': 'Name, phone and password required'})
                }

            # Check if already exists
            existing = citizens_table.get_item(Key={'phone': phone})
            if 'Item' in existing:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'message': 'Phone number already registered'})
                }

            # Save citizen
            citizens_table.put_item(Item={
                'phone': phone,
                'name': name,
                'password_hash': hash_password(password),
                'is_ratepayer': is_ratepayer,
                'registration_number': registration_number,
                'street': street,
                'address': address,
                'created_at': datetime.utcnow().isoformat(),
                'area': 'Homagama'
            })

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'message': 'Account created successfully',
                    'user': {
                        'phone': phone,
                        'name': name,
                        'is_ratepayer': is_ratepayer,
                        'street': street,
                        'address': address,
                        'area': 'Homagama'
                    }
                })
            }

        # SIGNIN
        elif '/citizen/signin' in path and method == 'POST':
            phone = body.get('phone', '').strip()
            password = body.get('password', '').strip()

            if not phone or not password:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'message': 'Phone and password required'})
                }

            result = citizens_table.get_item(Key={'phone': phone})
            if 'Item' not in result:
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'message': 'No account found with this phone number'})
                }

            citizen = result['Item']
            if citizen['password_hash'] != hash_password(password):
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'message': 'Incorrect password. Please try again.'})
                }

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'message': 'Sign in successful',
                    'user': {
                        'phone': citizen['phone'],
                        'name': citizen['name'],
                        'is_ratepayer': citizen.get('is_ratepayer', False),
                        'street': citizen.get('street', ''),
                        'address': citizen.get('address', ''),
                        'area': citizen.get('area', 'Homagama')
                    }
                })
            }


        # UPDATE PASSWORD
        elif '/citizen/update-password' in path and method == 'POST':
            phone = body.get('phone', '').strip()
            current_password = body.get('current_password', '').strip()
            new_password = body.get('new_password', '').strip()

            if not phone or not current_password or not new_password:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'message': 'Phone, current and new password required'})
                }

            result = citizens_table.get_item(Key={'phone': phone})
            if 'Item' not in result:
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'message': 'Account not found'})
                }

            citizen = result['Item']
            if citizen['password_hash'] != hash_password(current_password):
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'message': 'Current password is incorrect'})
                }

            citizens_table.update_item(
                Key={'phone': phone},
                UpdateExpression='SET password_hash = :h',
                ExpressionAttributeValues={':h': hash_password(new_password)}
            )

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'message': 'Password updated successfully'})
            }


        # UPDATE PASSWORD
        elif '/citizen/update-password' in path and method == 'POST':
            phone = body.get('phone', '').strip()
            current_password = body.get('current_password', '').strip()
            new_password = body.get('new_password', '').strip()

            if not phone or not current_password or not new_password:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'message': 'Phone, current and new password required'})
                }

            result = citizens_table.get_item(Key={'phone': phone})
            if 'Item' not in result:
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'message': 'Account not found'})
                }

            citizen = result['Item']
            if citizen['password_hash'] != hash_password(current_password):
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'message': 'Current password is incorrect'})
                }

            citizens_table.update_item(
                Key={'phone': phone},
                UpdateExpression='SET password_hash = :h',
                ExpressionAttributeValues={':h': hash_password(new_password)}
            )

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'message': 'Password updated successfully'})
            }

        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'success': False, 'message': 'Endpoint not found'})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'success': False, 'message': str(e)})
        }