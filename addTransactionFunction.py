import json
import boto3
import uuid
from decimal import Decimal
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Transactions')

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

def get_user_id(event):
    return event['requestContext']['authorizer']['claims']['sub']

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
    """
    Handles POST requests to /transactions to add a new transaction manually.
    """
    try:
        user_id = get_user_id(event)
        body = json.loads(event['body'])

        if not all(k in body for k in ['amount', 'type', 'date', 'category', 'description']):
            return create_response(400, {'error': 'Missing required fields'})

        item = {
            'userId': user_id,
            'transactionId': str(uuid.uuid4()),
            'amount': Decimal(str(body['amount'])),
            'type': body['type'],
            'category': body['category'],
            'description': body.get('description', ''),
            'date': body['date'],
            'createdAt': datetime.utcnow().isoformat()
        }

        table.put_item(Item=item)
        return create_response(201, item)

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, {'error': str(e)})
