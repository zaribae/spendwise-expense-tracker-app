# DompetHub: AI-Powered Expense Tracker

DompetHub is a modern, serverless web application designed to help you track your expenses and income effortlessly. Leveraging the power of AI, you can add transactions using natural language via the Web Dashboard or our Telegram Bot. The application provides insightful daily and monthly financial overviews, with all data securely stored in the cloud.

You can try the app here: [https://dompethub.app](https://dompethub.app)

## Features

* **AI-Powered Transactions:** Add expenses and income by typing in plain English or Bahasa Indonesia (e.g., "beli kopi 15k" or "monthly salary 5jt").
* **Omnichannel AI Bot (Telegram):** Seamlessly log transactions and ask for personalized financial advice directly from your Telegram chat.
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
  * **AI/NLP:** Amazon Bedrock (Anthropic Claude models) / Groq API (LLaMA-3)
  * **Integration:** Telegram Bot API Webhook

## System Architecture

DompetHub uses a fully serverless, event-driven architecture on AWS, integrating web and Telegram interfaces with AI processing.

[![](https://mermaid.ink/img/pako:eNp9VYtu2jAU_RXL0qpOg9ICBYqmSYFsLVO2ViVdpSVV5RIXMhI7s50V1vTfd22TEh5dJBI799zX8bnhGU94RHEfTwXJZsh3Q4bgkvmDfXEjqZD2nb5u7m_pQwA_Y7irGnya0EDfwDGtmimLQrYV9ovgTBlDGeCakokKzP3ol0TjKwe5RM4eOBFRGLILLhWNEGfoO1VJ_LhsjFv_ie_cjtEw4XmExlT8oSKhstLFkE9ZrHjgpOQvRFxtIYuTqxk6QF9v_UprztXo_LbEwgadE0WfyBLw15_Hvnl1gICTGedzeVfWslOPR9KHiKAvOZuomLNKPfry7ofXN27gEkXQZUYFsZiQ-YIwSaxLDTlSUgXPQR5NYXG3HcQZBc4IXQk-gY65AP8bFj_GQN01z1XMpjsem-e2akNzwVRclxm8O9jjWyF9s1FLk7tkJOXuYDOZO7j3F8FhtaP3dzsQRwaHtk3IfBFLxcVyD2wQBYcrFvZYvTnkKZvyYjbXVD7FcLy-773fbuQtGX1eKCoYSYyKYqB07Xcu-O9A38z5N9CARkC6Js7zyDen3kKe962SpyxmTTX47Sr43TuQI2PUsoPq-kCsxYweqtc_FSMYHQH8ycJOjbWbJfqoAR6fxqzh8zllxau6KyCN0VVPSJJI9EHrvbAyf7OMsuqyFr23yYYzolBDKiJUDTVmNMlqSNGFKrZ8XvvWTleXMDgrre2mrgxZKT1rM0AT4AdJ4gggEu1rc41rqI3xaRAjrGI1bjvozA5O3Tagx2k34KqP-lNZvp2hSv2rSVcclRNg0xnC7BSAtI3U7XMQlbA1rz-ogM8cMvSO3MKKegOmg61L1CvrCYcc6ePTTUD8MflDkb8o3kq8p-zdmPBFSTMd7ev48jvISGbAJy3MGGwXVYxB0IDJkmVVBLgGfzJxhPtK5LSGUypSorf4WQcIsZrRlIa4D8uIiHmIQ_YCPhlhPzlPSzfB8-kM9x9JImGXZ1oEbkx0ilcIpKdiyHOmcP-k2WyZILj_jBe4f9Y-avZaZ532Wee002q3ezW8xP1696jVPDk77rVPO71es3vSOn2p4b8m78nR8XGv0-k2wdztHbe7zZd_-YM3Ug?type=png)](https://mermaid.live/edit#pako:eNp9VYtu2jAU_RXL0qpOg9ICBYqmSYFsLVO2ViVdpSVV5RIXMhI7s50V1vTfd22TEh5dJBI799zX8bnhGU94RHEfTwXJZsh3Q4bgkvmDfXEjqZD2nb5u7m_pQwA_Y7irGnya0EDfwDGtmimLQrYV9ovgTBlDGeCakokKzP3ol0TjKwe5RM4eOBFRGLILLhWNEGfoO1VJ_LhsjFv_ie_cjtEw4XmExlT8oSKhstLFkE9ZrHjgpOQvRFxtIYuTqxk6QF9v_UprztXo_LbEwgadE0WfyBLw15_Hvnl1gICTGedzeVfWslOPR9KHiKAvOZuomLNKPfry7ofXN27gEkXQZUYFsZiQ-YIwSaxLDTlSUgXPQR5NYXG3HcQZBc4IXQk-gY65AP8bFj_GQN01z1XMpjsem-e2akNzwVRclxm8O9jjWyF9s1FLk7tkJOXuYDOZO7j3F8FhtaP3dzsQRwaHtk3IfBFLxcVyD2wQBYcrFvZYvTnkKZvyYjbXVD7FcLy-773fbuQtGX1eKCoYSYyKYqB07Xcu-O9A38z5N9CARkC6Js7zyDen3kKe962SpyxmTTX47Sr43TuQI2PUsoPq-kCsxYweqtc_FSMYHQH8ycJOjbWbJfqoAR6fxqzh8zllxau6KyCN0VVPSJJI9EHrvbAyf7OMsuqyFr23yYYzolBDKiJUDTVmNMlqSNGFKrZ8XvvWTleXMDgrre2mrgxZKT1rM0AT4AdJ4gggEu1rc41rqI3xaRAjrGI1bjvozA5O3Tagx2k34KqP-lNZvp2hSv2rSVcclRNg0xnC7BSAtI3U7XMQlbA1rz-ogM8cMvSO3MKKegOmg61L1CvrCYcc6ePTTUD8MflDkb8o3kq8p-zdmPBFSTMd7ev48jvISGbAJy3MGGwXVYxB0IDJkmVVBLgGfzJxhPtK5LSGUypSorf4WQcIsZrRlIa4D8uIiHmIQ_YCPhlhPzlPSzfB8-kM9x9JImGXZ1oEbkx0ilcIpKdiyHOmcP-k2WyZILj_jBe4f9Y-avZaZ532Wee002q3ezW8xP1696jVPDk77rVPO71es3vSOn2p4b8m78nR8XGv0-k2wdztHbe7zZd_-YM3Ug)

### 1. Web Application Flow
1. User logs in to the **React Frontend**.
2. **Amazon Cognito** verifies the identity and returns a *JWT Token*.
3. The frontend calls the API (*request data, add transactions*) to **API Gateway** by attaching the JWT.
4. **Cognito Authorizer** in API Gateway validates the token.
5. If valid, the request is forwarded to **AWS Lambda** (Python).
6. Lambda reads/writes specific data belonging to the user (`userId` partition key) in **DynamoDB** and responds to the *Frontend*.

### 2. Telegram Bot Integration & AI Flow
1. User sends a message to the Telegram bot.
2. Telegram sends a POST *payload* to the **API Gateway Webhook Endpoint**.
3. This triggers the **Telegram Webhook (AWS Lambda)**.
4. **Anti-Spam & Auth Check**: Lambda checks if the message is outdated (via *timestamp*) and checks the `TelegramLinks` table in DynamoDB to match the Telegram `chat_id` with the Cognito `userId`.
5. **Unified AI Routing**: The user's message and their financial data context (Assets, Budgets, Current Cycle Transactions) are sent to the **Groq API / Bedrock**.
6. The **LLaMA-3 / Claude** model analyzes whether the message is a **New Transaction** or an **Advisor Query**.
7. If Transaction: Lambda saves the data to the `Transactions` table and updates the balance in `Assets`.
8. If Query: Lambda sends back a formatted analytical text reply to Telegram.


## Setup and Installation

### 1. Backend (AWS)

Before running the frontend, the AWS backend must be set up. This involves configuring several services that work together.

**Required Services:**

1. **Amazon Cognito:** Create a User Pool to manage users.
2. **Amazon DynamoDB:** Create a `Transactions` table to store data.
3. **IAM:** Create a Role with permissions for Lambda to access DynamoDB and Bedrock.
4. **Amazon Bedrock:** Enable model access for the Anthropic Claude models.
5. **AWS Lambda:** Create and deploy the Python code for the six functions:
   * `processTransactionTextFunction`
   * `getTransactionsFunction`
   * `getStatsFunction`
   * `addTransactionFunction`
   * `updateTransactionFunction`
   * `deleteTransactionFunction`
   * `telegramWebhookFunction`
6. **Amazon API Gateway:** Create a REST API with the necessary resources and methods, link them to the Lambda functions, and secure them with the Cognito authorizer.

### 2. Frontend (Local Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zaribae/spendwise-expense-tracker-app.git
   cd spendwise-expense-tracker-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure AWS Credentials:**
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

4. **Run the application:**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`.