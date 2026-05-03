"""
MyCollect - GetBinData Lambda Function (PHASE 3)
Student: Dinithi Wijesinghe (10952811)
Supervisor: Miss. Dharani Rajasinghe

PURPOSE: Handle all GET requests for bin data
- Get all bins with latest status
- Get specific bin by ID
- Get bin history for charts
- Get dashboard statistics
- Filter bins by priority level
"""

import json
import boto3
from decimal import Decimal
from boto3.dynamodb.conditions import Key, Attr

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
sensor_table = dynamodb.Table('BinSensorData')
status_table = dynamodb.Table('BinLatestStatus')


def decimal_to_float(obj):
    """Convert Decimal to float for JSON serialization"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


def get_all_bins():
    """
    Get all bins with their latest status
    Endpoint: GET /bin
    """
    try:
        response = status_table.scan()
        bins = response.get('Items', [])
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Bins retrieved successfully',
                'count': len(bins),
                'bins': bins
            }, default=decimal_to_float)
        }
    except Exception as e:
        print(f"Error getting all bins: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Error retrieving bins',
                'error': str(e)
            })
        }


def get_bin_by_id(bin_id):
    """
    Get specific bin's latest status
    Endpoint: GET /bin/{bin_id}
    """
    try:
        response = status_table.get_item(Key={'bin_id': bin_id})
        
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': f'Bin {bin_id} not found'
                })
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Bin retrieved successfully',
                'bin': response['Item']
            }, default=decimal_to_float)
        }
    except Exception as e:
        print(f"Error getting bin {bin_id}: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': f'Error retrieving bin {bin_id}',
                'error': str(e)
            })
        }


def get_bin_history(bin_id, limit=100):
    """
    Get historical data for a specific bin
    Endpoint: GET /bin/{bin_id}/history?limit=100
    """
    try:
        response = sensor_table.query(
            KeyConditionExpression=Key('bin_id').eq(bin_id),
            ScanIndexForward=False,  # Sort descending (newest first)
            Limit=limit
        )
        
        history = response.get('Items', [])
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'History retrieved successfully',
                'bin_id': bin_id,
                'count': len(history),
                'limit': limit,
                'history': history
            }, default=decimal_to_float)
        }
    except Exception as e:
        print(f"Error getting history for {bin_id}: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': f'Error retrieving history for {bin_id}',
                'error': str(e)
            })
        }


def get_bins_by_priority(priority_level):
    """
    Get all bins filtered by priority level
    Endpoint: GET /bin/priority/{level}
    """
    try:
        # Validate priority level
        valid_priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        priority_upper = priority_level.upper()
        
        if priority_upper not in valid_priorities:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': 'Invalid priority level',
                    'valid_priorities': valid_priorities
                })
            }
        
        # Scan with filter
        response = status_table.scan(
            FilterExpression=Attr('priority_label').eq(priority_upper)
        )
        
        bins = response.get('Items', [])
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': f'{priority_upper} priority bins retrieved',
                'priority': priority_upper,
                'count': len(bins),
                'bins': bins
            }, default=decimal_to_float)
        }
    except Exception as e:
        print(f"Error filtering by priority {priority_level}: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': f'Error filtering bins by priority',
                'error': str(e)
            })
        }


def get_dashboard_stats():
    """
    Get summary statistics for dashboard
    Endpoint: GET /dashboard/stats
    """
    try:
        # Get all bins
        response = status_table.scan()
        bins = response.get('Items', [])
        
        if not bins:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': 'No bins found',
                    'stats': {
                        'total_bins': 0,
                        'by_priority': {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0, 'CRITICAL': 0},
                        'average_health_risk': 0,
                        'average_fill_level': 0
                    }
                })
            }
        
        # Calculate statistics
        total_bins = len(bins)
        priority_counts = {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0, 'CRITICAL': 0}
        total_health_risk = 0
        total_fill_level = 0
        
        critical_bins = []
        high_bins = []
        
        for bin_item in bins:
            # Count by priority
            priority = bin_item.get('priority_label', 'UNKNOWN')
            if priority in priority_counts:
                priority_counts[priority] += 1
            
            # Sum for averages
            total_health_risk += float(bin_item.get('health_risk', 0))
            total_fill_level += float(bin_item.get('fill_level', 0))
            
            # Collect critical and high priority bins
            if priority == 'CRITICAL':
                critical_bins.append({
                    'bin_id': bin_item['bin_id'],
                    'fill_level': float(bin_item.get('fill_level', 0)),
                    'gas_ppm': float(bin_item.get('gas_ppm', 0)),
                    'health_risk': float(bin_item.get('health_risk', 0))
                })
            elif priority == 'HIGH':
                high_bins.append({
                    'bin_id': bin_item['bin_id'],
                    'fill_level': float(bin_item.get('fill_level', 0)),
                    'gas_ppm': float(bin_item.get('gas_ppm', 0)),
                    'health_risk': float(bin_item.get('health_risk', 0))
                })
        
        # Calculate averages
        avg_health_risk = round(total_health_risk / total_bins, 2)
        avg_fill_level = round(total_fill_level / total_bins, 2)
        
        stats = {
            'total_bins': total_bins,
            'by_priority': priority_counts,
            'average_health_risk': avg_health_risk,
            'average_fill_level': avg_fill_level,
            'needs_immediate_attention': len(critical_bins),
            'needs_attention_soon': len(high_bins),
            'critical_bins': critical_bins,
            'high_priority_bins': high_bins
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Dashboard statistics retrieved',
                'stats': stats
            }, default=decimal_to_float)
        }
    except Exception as e:
        print(f"Error getting dashboard stats: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Error retrieving dashboard statistics',
                'error': str(e)
            })
        }


def lambda_handler(event, context):
    """
    Main handler - routes requests based on path and method
    """
    try:
        print("=== INCOMING GET REQUEST ===")
        print(json.dumps(event, default=str))
        
        # Get HTTP method and path
        http_method = event.get('httpMethod', event.get('requestContext', {}).get('http', {}).get('method', 'GET'))
        path = event.get('path', '/')
        path_parameters = event.get('pathParameters') or {}
        query_parameters = event.get('queryStringParameters') or {}
        
        print(f"Method: {http_method}, Path: {path}")
        print(f"Path params: {path_parameters}")
        print(f"Query params: {query_parameters}")
        
        # Route based on path
        
        # GET /bin - Get all bins
        if path == '/bin' or path == '/bin-data':
            return get_all_bins()
        
        # GET /dashboard/stats - Get dashboard statistics
        elif '/dashboard/stats' in path:
            return get_dashboard_stats()
        
        # GET /bins/priority/{level} - Filter by priority
        elif '/priority/' in path:
            priority_level = path_parameters.get('level') or path.split('/priority/')[-1]
            return get_bins_by_priority(priority_level)
        
        # GET /bins/{bin_id}/history - Get bin history
        elif '/history' in path:
            bin_id = path_parameters.get('bin_id') or path.split('/')[2]
            limit = int(query_parameters.get('limit', 100))
            return get_bin_history(bin_id, limit)
        
        # GET /bins/{bin_id} - Get specific bin
        elif path_parameters.get('bin_id'):
            bin_id = path_parameters.get('bin_id')
            return get_bin_by_id(bin_id)
        
        # Unknown path
        else:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': 'Endpoint not found',
                    'available_endpoints': [
                        'GET /bin - Get all bins',
                        'GET /bin/{bin_id} - Get specific bin',
                        'GET /bin/{bin_id}/history - Get bin history',
                        'GET /bin/priority/{level} - Filter by priority',
                        'GET /dashboard/stats - Get dashboard statistics'
                    ]
                })
            }
    
    except Exception as e:
        print("=== EXCEPTION IN HANDLER ===")
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
                'message': 'Internal server error',
                'error': str(e)
            })
        }