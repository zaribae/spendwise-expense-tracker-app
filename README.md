# SpendWise: AI-Powered Expense Tracker

SpendWise is a modern, serverless web application designed to help you track your expenses and income effortlessly. Leveraging the power of AI, you can add transactions using natural language. The application provides insightful daily and monthly financial overviews, with all data securely stored in the cloud.

## Features

* **AI-Powered Transactions:** Add expenses and income by typing in plain English or Bahasa Indonesia (e.g., "beli kopi 15k" or "monthly salary 5jt").
* **Secure User Authentication:** Each user has their own private account, powered by Amazon Cognito.
* **Monthly & Daily Statistics:** Visualize your financial health with charts for monthly income vs. expenses and daily spending breakdowns.
* **Daily Transaction View:** Browse your transaction history day by day with easy navigation.
* **Full CRUD Functionality:** Manually add, edit, or delete any transaction to ensure your records are always accurate.
* **Localized for IDR:** All currency is displayed in Indonesian Rupiah (Rp).

## Tech Stack

* **Frontend:** React.js, Tailwind CSS (via CDN), Recharts
* **Backend (Serverless on AWS):**
    * **Authentication:** Amazon Cognito
    * **Database:** Amazon DynamoDB
    * **API:** Amazon API Gateway
    * **Compute:** AWS Lambda (Python)
    * **AI/NLP:** Amazon Bedrock (Anthropic Claude models)

## Project Structure (Frontend)

```
/expense-tracker-app
├── /public
│   └── index.html      <-- Tailwind CSS CDN script is added here
├── /src
│   ├── /components
│   │   ├── AddTransactionForm.js
│   │   ├── Auth.js
│   │   ├── Charts.js
│   │   ├── Dashboard.js
│   │   ├── Footer.js
│   │   ├── Header.js
│   │   ├── Logo.js
│   │   ├── MonthlySummary.js
│   │   ├── TransactionList.js
│   │   └── TransactionModal.js
│   ├── App.js
│   ├── config.js       <-- AWS credentials for local development
│   └── index.css
├── package.json
└── README.md
```

---

## Setup and Installation

### 1. Backend (AWS)

Before running the frontend, the AWS backend must be set up. This involves configuring several services that work together.

**Required Services:**

1.  **Amazon Cognito:** Create a User Pool to manage users.
2.  **Amazon DynamoDB:** Create a `Transactions` table to store data.
3.  **IAM:** Create a Role with permissions for Lambda to access DynamoDB and Bedrock.
4.  **Amazon Bedrock:** Enable model access for the Anthropic Claude models.
5.  **AWS Lambda:** Create and deploy the Python code for the six functions:
    * `processTransactionTextFunction`
    * `getTransactionsFunction`
    * `getStatsFunction`
    * `addTransactionFunction`
    * `updateTransactionFunction`
    * `deleteTransactionFunction`
6.  **Amazon API Gateway:** Create a REST API with the necessary resources and methods, link them to the Lambda functions, and secure them with the Cognito authorizer.


### 2. Frontend (Local Development)

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd expense-tracker-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure AWS Credentials:**
    * Create a file named `config.js` inside the `src` folder.
    * Paste the following code into it, replacing the placeholder values with the actual credentials from your AWS backend setup.

    ```javascript
    // src/config.js
    const awsConfig = {
        Auth: {
            Cognito: {
                userPoolId: 'YOUR_USER_POOL_ID',
                userPoolClientId: 'YOUR_USER_POOL_APP_CLIENT_ID',
            }
        },
        API: {
            REST: {
                ExpenseTrackerAPI: {
                    endpoint: "YOUR_API_GATEWAY_INVOKE_URL",
                    region: 'YOUR_AWS_REGION' // e.g., 'ap-southeast-1'
                }
            }
        }
    };
    export default awsConfig;
    ```

4.  **Run the application:**
    ```bash
    npm start
    ```
    The app will open at `http://localhost:3000`.
