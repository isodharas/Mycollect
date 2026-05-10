import boto3
from decimal import Decimal
import time

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-2')
table = dynamodb.Table('BinLatestStatus')

def spike():
    """Run this during demo to show gas priority overriding fill level"""
    print("DEMO: Spiking BIN_003 gas levels...")
    table.put_item(Item={
        'bin_id': 'BIN_003',
        'gas_ppm': Decimal('680'),
        'fill_level': Decimal('45'),
        'health_risk': Decimal('62.1'),
        'priority_label': 'CRITICAL',
        'classified_by': 'RandomForest',
        'timestamp': '2026-04-05T08:30:00Z',
        'location': 'Pitipana Town'
    })
    print("✓ BIN_003 spiked to CRITICAL! (gas=680PPM overrides low fill=45%)")
    print("  Refresh the app/dashboard to see priority change!")

def reset():
    """Reset back to normal after demo"""
    print("Resetting BIN_003 back to normal...")
    table.put_item(Item={
        'bin_id': 'BIN_003',
        'gas_ppm': Decimal('180'),
        'fill_level': Decimal('45'),
        'health_risk': Decimal('26.1'),
        'priority_label': 'MEDIUM',
        'classified_by': 'RandomForest',
        'timestamp': '2026-04-05T08:00:00Z',
        'location': 'Pitipana Town'
    })
    print("✓ BIN_003 reset to MEDIUM")

import sys
if len(sys.argv) > 1 and sys.argv[1] == 'reset':
    reset()
else:
    spike()
