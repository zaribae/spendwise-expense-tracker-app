import json
import boto3
import uuid
from decimal import Decimal
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Assets')

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal): return float(o)
        return super(DecimalEncoder, self).default(o)

def create_response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
        },
        'body': json.dumps(body, cls=DecimalEncoder)
    }

def lambda_handler(event, context):
    try:
        user_id = event['requestContext']['authorizer']['claims']['sub']
        body = json.loads(event['body'])
        
        item = {
            'userId': user_id,
            'assetId': str(uuid.uuid4()),
            'name': body['name'],
            'amount': Decimal(str(body['amount'])),
            'category': body['category'], # e.g., Cash, Bank, Investment, Property
            'description': body.get('description', ''),
            'updatedAt': datetime.utcnow().isoformat()
        }
        
        table.put_item(Item=item)
        return create_response(201, item)
    except Exception as e:
        print(f"Error adding asset: {e}")
        return create_response(500, {'error': str(e)})