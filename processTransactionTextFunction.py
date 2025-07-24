# Copy this function to other 2 functions, getTransactionsFunction.py and getStatsFunction.py

import json
import boto3
import uuid
from decimal import Decimal
from datetime import datetime, timedelta
from collections import defaultdict
import os

# --- Clients (Initialized outside handlers for performance) ---
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Transactions') 
bedrock_runtime = boto3.client(service_name='bedrock-runtime', region_name='ap-southeast-1')

# --- Helper Classes & Functions ---
class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert a DynamoDB item to JSON."""
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

def get_user_id(event):
    """Extracts user ID from the Cognito authorizer context."""
    return event['requestContext']['authorizer']['claims']['sub']

def create_response(status_code, body):
    """Creates a standard API Gateway proxy response with CORS headers."""
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps(body, cls=DecimalEncoder)
    }

# --- Main Handler Router ---
def lambda_handler(event, context):
    """
    Main router. It checks the API path and calls the appropriate function.
    """
    print("Received event:", json.dumps(event))
    resource_path = event.get('path') or event.get('resource')

    if resource_path == '/process-text':
        return process_transaction_text(event, context)
    elif resource_path == '/transactions':
        return get_transactions(event, context)
    elif resource_path == '/stats':
        return get_stats(event, context)
    else:
        return create_response(404, {'error': 'Not Found', 'path_checked': resource_path})


# --- Specific Logic Functions ---

def process_transaction_text(event, context):
    try:
        user_id = get_user_id(event)
        body = json.loads(event['body'])
        user_text = body.get('text')
        if not user_text:
            return create_response(400, {'error': 'Input text is required.'})
        expense_categories = ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Education', 'Other']
        
        # FIX: Updated prompt and API call to use the modern "Messages API" for Claude 3
        prompt = f"""You are an expert financial assistant specializing in Indonesian Rupiah (IDR). Analyze the following user text and extract the transaction details into a valid JSON object.

            User text: "{user_text}"

            Follow these rules strictly:
            1.  The currency is always Indonesian Rupiah (IDR).
            2.  Determine if the transaction is an 'income' or 'expense'.
            3.  Extract the numerical 'amount'. If the text contains 'k' or 'ribu' after a number, interpret it as thousands (e.g., 10k = 10000). If the text contains 'jt' or 'juta', interpret it as millions (e.g., 2jt = 2000000).
            4.  If it is an 'expense', classify it into one of the following categories: {expense_categories}. If it is 'income', the category must be "Income".
            5.  Create a brief, descriptive 'description' from the text.
            6.  If the text implies a date (e.g., "kemarin", "selasa lalu"), determine the correct date in 'YYYY-MM-DD' format. If no date is mentioned, use today's date: {datetime.now().strftime('%Y-%m-%d')}.
            7.  Your final output must be ONLY the JSON object, with no other text or explanations.

            Example 1: User input "Beli Kopi 15 ribu"
            {{
              "amount": 15000,
              "type": "expense",
              "category": "Food",
              "description": "Beli Kopi",
              "date": "{datetime.now().strftime('%Y-%m-%d')}"
            }}

            Example 2: User input "Gaji 5jt"
            {{
              "amount": 5000000,
              "type": "income",
              "category": "Income",
              "description": "Gaji",
              "date": "{datetime.now().strftime('%Y-%m-%d')}"
            }}"""
        
        # FIX: Using the new Messages API format
        bedrock_body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        })
        
        # FIX: Using the Claude 3 Haiku model ID
        model_id = 'anthropic.claude-3-haiku-20240307-v1:0'
        
        response = bedrock_runtime.invoke_model(body=bedrock_body, modelId=model_id, accept='application/json', contentType='application/json')
        response_body = json.loads(response.get('body').read())
        
        # FIX: Parsing the response from the new Messages API format
        json_string = response_body['content'][0]['text']

        if json_string.strip().startswith('```json'):
            json_string = json_string.strip()[7:-3].strip()
            
        transaction_data = json.loads(json_string)
        item = {'userId': user_id, 'transactionId': str(uuid.uuid4()), 'amount': Decimal(str(transaction_data['amount'])), 'type': transaction_data['type'], 'category': transaction_data['category'], 'description': transaction_data.get('description', ''), 'date': transaction_data['date'], 'createdAt': datetime.utcnow().isoformat()}
        table.put_item(Item=item)
        return create_response(201, {'message': 'Transaction processed successfully', 'data': item})
    except Exception as e:
        print(f"Error in process_transaction_text: {e}")
        return create_response(500, {'error': 'Could not process transaction text.', 'details': str(e)})

def get_transactions(event, context):
    try:
        user_id = get_user_id(event)
        response = table.query(KeyConditionExpression=boto3.dynamodb.conditions.Key('userId').eq(user_id))
        return create_response(200, response.get('Items', []))
    except Exception as e:
        print(f"Error in get_transactions: {e}")
        return create_response(500, {'error': 'Could not retrieve transactions.', 'details': str(e)})

def get_stats(event, context):
    try:
        user_id = get_user_id(event)
        response = table.query(KeyConditionExpression=boto3.dynamodb.conditions.Key('userId').eq(user_id))
        transactions = response.get('Items', [])
        if not transactions:
            return create_response(200, {'monthlySummary': [], 'dailySummary': [], 'categorySummary': []})
        now = datetime.now()
        monthly_summary_data = defaultdict(lambda: {'income': 0, 'expenses': 0})
        for i in range(6):
            month_key = (now - timedelta(days=i*30)).strftime('%Y-%m')
            monthly_summary_data[month_key]
        for t in transactions:
            month_key = t['date'][:7]
            if month_key in monthly_summary_data:
                amount = float(t['amount'])
                if t['type'] == 'income': monthly_summary_data[month_key]['income'] += amount
                else: monthly_summary_data[month_key]['expenses'] += amount
        monthly_summary = [{'month': datetime.strptime(k, '%Y-%m').strftime('%b %Y'), **v} for k, v in sorted(monthly_summary_data.items())]
        daily_summary_data = defaultdict(lambda: {'expenses': 0})
        current_month_str = now.strftime('%Y-%m')
        days_in_month = (datetime(now.year, now.month, 1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        for day in range(1, days_in_month.day + 1): daily_summary_data[day]
        for t in transactions:
            if t['date'].startswith(current_month_str) and t['type'] == 'expense':
                daily_summary_data[int(t['date'][8:])]['expenses'] += float(t['amount'])
        daily_summary = [{'day': k, **v} for k,v in sorted(daily_summary_data.items())]
        category_summary_data = defaultdict(float)
        for t in transactions:
            if t['date'].startswith(current_month_str) and t['type'] == 'expense':
                category_summary_data[t['category']] += float(t['amount'])
        category_summary = [{'category': k, 'total': v} for k, v in category_summary_data.items()]
        return create_response(200, {'monthlySummary': monthly_summary, 'dailySummary': daily_summary, 'categorySummary': category_summary})
    except Exception as e:
        print(f"Error in get_stats: {e}")
        return create_response(500, {'error': 'Could not calculate stats.', 'details': str(e)})
