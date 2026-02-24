# DompetHub: AI-Powered Expense Tracker

DompetHub is a modern, serverless web application designed to help you track your expenses and income effortlessly. Leveraging the power of AI, you can add transactions using natural language via the Web Dashboard or our Telegram Bot. The application provides insightful daily and monthly financial overviews, with all data securely stored in the cloud.

You can try the app here: `https://dompethub.app`

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

[![](https://mermaid.ink/img/pako:eNp9VYtu2jAU_RXL0qpOgwIDCkXTpEC2jilbq5Ku0pKqcokLGYmd2c4Ka_rvu7ZJCY8uEomde-7r-NzwhKc8oniAZ4Jkc-S7IUNwyfzevriWVEj7Tl_Xdzf0PoCfMdxWDT5NaKBv4JhWzZRFIdsJ-1lwpoyhDHBFyVQF5n7yS6LJpYNcIuf3nIgoDNkXLhWNEGfoO1VJ_LBqTNr_ie_cTNAo4XmEJlT8oSKhstLFiM9YrHjgpOQvRFxvIYuTqzk6Ql9v_EprzuX4_KbEwgadE0UfyQrwV58mvnl1hICTOecLeVvWslePR9L7iKDPOZuqmLNKPfry7kZX127gEkXQRUYFsZiQ-YIwSaxLDTlSUgXPYR7NYHG7G8QZB84YXQo-hY65AP9rFj_EQN0Vz1XMZnse2-e2bkNzwVRclxm8OzrgWyF9u1FLk7tiJOXucDuZO7zzl8FxtaO3t3sQRwbHtk3I_CWWiovVAdgwCo7XLBywegvIUzblxWyhqXyM4Xh933u728hrMvq0VFQwkhgVxUDpxu9c8N-Bvpnzb6AhjYB0TZznkW9OvY0871slT1nMhmrw21fwmzcgR8aoZQfV9YFYixk9VK9_LMYwOgL4k4WdGms3S_RBAzw-i1nD5wvKihd1V0Aao6uekiSR6J3We2Fl_moZZdVlLXpvk43mRKGGVESoGmrMaZLVkKJLVez4vPStnS4vYHDWWttPXRmyUnrWZoAmwA-SxBFAJDrU5gbXUFvj0yBGWMV63PbQmR2cum1Aj9N-wHUf9ceyfDtDlfrXk644KifApjOE2SkAaRup2-cwKmEbXn9QAZ85ZOgdu4UV9RZMB9uUqFfWEw450senm4D4E_KHIn9ZvJb4QNn7MeGLkmY62tfJxXeQkcyAT1qYMdgtqpiAoAGTJauqCHAN_mTiCA-UyGkNp1SkRG_xkw4QYjWnKQ3xAJYREYsQh-wZfDLCfnKelm6C57M5HjyQRMIuz7QI3JjoFC8QSE_FiOdM4UGre9o1QfDgCS_xoNM76fa7zXa302qfdTrdfg2vAPW-f9I863d6_Va32ep1OqfPNfzXpG2enAGwd3rWbzZ77Wav1X3-B8QnNx4?type=png)](https://mermaid.live/edit#pako:eNp9VYtu2jAU_RXL0qpOgwIDCkXTpEC2jilbq5Ku0pKqcokLGYmd2c4Ka_rvu7ZJCY8uEomde-7r-NzwhKc8oniAZ4Jkc-S7IUNwyfzevriWVEj7Tl_Xdzf0PoCfMdxWDT5NaKBv4JhWzZRFIdsJ-1lwpoyhDHBFyVQF5n7yS6LJpYNcIuf3nIgoDNkXLhWNEGfoO1VJ_LBqTNr_ie_cTNAo4XmEJlT8oSKhstLFiM9YrHjgpOQvRFxvIYuTqzk6Ql9v_EprzuX4_KbEwgadE0UfyQrwV58mvnl1hICTOecLeVvWslePR9L7iKDPOZuqmLNKPfry7kZX127gEkXQRUYFsZiQ-YIwSaxLDTlSUgXPYR7NYHG7G8QZB84YXQo-hY65AP9rFj_EQN0Vz1XMZnse2-e2bkNzwVRclxm8OzrgWyF9u1FLk7tiJOXucDuZO7zzl8FxtaO3t3sQRwbHtk3I_CWWiovVAdgwCo7XLBywegvIUzblxWyhqXyM4Xh933u728hrMvq0VFQwkhgVxUDpxu9c8N-Bvpnzb6AhjYB0TZznkW9OvY0871slT1nMhmrw21fwmzcgR8aoZQfV9YFYixk9VK9_LMYwOgL4k4WdGms3S_RBAzw-i1nD5wvKihd1V0Aao6uekiSR6J3We2Fl_moZZdVlLXpvk43mRKGGVESoGmrMaZLVkKJLVez4vPStnS4vYHDWWttPXRmyUnrWZoAmwA-SxBFAJDrU5gbXUFvj0yBGWMV63PbQmR2cum1Aj9N-wHUf9ceyfDtDlfrXk644KifApjOE2SkAaRup2-cwKmEbXn9QAZ85ZOgdu4UV9RZMB9uUqFfWEw450senm4D4E_KHIn9ZvJb4QNn7MeGLkmY62tfJxXeQkcyAT1qYMdgtqpiAoAGTJauqCHAN_mTiCA-UyGkNp1SkRG_xkw4QYjWnKQ3xAJYREYsQh-wZfDLCfnKelm6C57M5HjyQRMIuz7QI3JjoFC8QSE_FiOdM4UGre9o1QfDgCS_xoNM76fa7zXa302qfdTrdfg2vAPW-f9I863d6_Va32ep1OqfPNfzXpG2enAGwd3rWbzZ77Wav1X3-B8QnNx4)

### 1. Web Application Flow
1. Pengguna login di **React Frontend**.
2. **Amazon Cognito** memverifikasi identitas dan mengembalikan *JWT Token*.
3. Frontend memanggil API (*request data, tambah transaksi*) ke **API Gateway** dengan menyematkan JWT.
4. **Cognito Authorizer** di API Gateway memvalidasi token.
5. Jika valid, permintaan diteruskan ke **AWS Lambda** (Python).
6. Lambda membaca/menulis data spesifik milik pengguna tersebut (`userId` partition key) di **DynamoDB** dan merespons ke *Frontend*.

### 2. Telegram Bot Integration & AI Flow
1. Pengguna mengirim pesan ke bot Telegram.
2. Telegram mengirimkan *payload* POST ke **API Gateway Webhook Endpoint**.
3. Memanggil **Telegram Webhook (AWS Lambda)**.
4. **Anti-Spam & Auth Check**: Lambda mengecek apakah pesan sudah usang (via *timestamp*) dan mengecek tabel `TelegramLinks` di DynamoDB untuk mencocokkan `chat_id` Telegram dengan `userId` Cognito.
5. **Unified AI Routing**: Pesan pengguna dan konteks data keuangan mereka (Aset, Budget, Transaksi Siklus Ini) dikirim ke **Groq API / Bedrock**.
6. Model **LLaMA-3 / Claude** menganalisis apakah pesan adalah **Transaksi Baru** atau **Pertanyaan Advisor**.
7. Jika Transaksi: Lambda menyimpan data ke tabel `Transactions`, memotong saldo di `Assets`.
8. Jika Pertanyaan: Lambda mengirim kembali balasan teks analitik yang sudah diformat ke Telegram.


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