import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Transactions')

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
        'body': json.dumps(body)
    }

def lambda_handler(event, context):
    """
    Handles DELETE requests to /transactions/{transactionId} to delete a transaction.
    """
    try:
        user_id = get_user_id(event)
        transaction_id = event['pathParameters']['transactionId']

        # This ensures a user can only delete their own transactions
        table.delete_item(
            Key={'userId': user_id, 'transactionId': transaction_id},
            ConditionExpression="attribute_exists(userId)"
        )
        return create_response(200, {'message': 'Transaction deleted successfully'})

    except Exception as e:
        print(f"Error: {e}")
        return create_response(500, {'error': str(e)})
