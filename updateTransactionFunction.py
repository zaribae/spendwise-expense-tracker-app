import json
import boto3
from decimal import Decimal

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
    Handles PUT requests to /transactions/{transactionId} to update an existing transaction.
    """
    try:
        user_id = get_user_id(event)
        transaction_id = event['pathParameters']['transactionId']
        body = json.loads(event['body'])

        if not all(k in body for k in ['amount', 'type', 'date', 'category', 'description']):
            return create_response(400, {'error': 'Missing required fields'})

        # This ensures a user can only update their own transactions
        table.update_item(
            Key={'userId': user_id, 'transactionId': transaction_id},
            UpdateExpression="SET amount = :a, #tp = :t, #dt = :d, category = :c, description = :desc",
            ExpressionAttributeNames={
                '#tp': 'type',
                '#dt': 'date'
            },
            ExpressionAttributeValues={
                ':a': Decimal(str(body['amount'])),
                ':t': body['type'],
                ':d': body['date'],
                ':c': body['category'],
                ':desc': body['description']
            },
            ConditionExpression="attribute_exists(userId)"
        )
        return create_response(200, {'message': 'Transaction updated successfully'})

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, {'error': str(e)})
