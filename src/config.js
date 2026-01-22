// src/config.js

const awsConfig = {
    Auth: {
        Cognito: {
            userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID, // Found in Cognito User Pool settings
            userPoolClientId: process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID, // Found in Cognito App Client settings
        }
    },
    API: {
        REST: {
            ExpenseTrackerAPI: {
                endpoint: process.env.REACT_APP_API_GATEWAY_ENDPOINT, // Found in API Gateway -> Stages
                region: process.env.REACT_APP_AWS_REGION, // e.g., 'us-east-1', make sure this matches your backend region
                apiKey: process.env.REACT_APP_API_GATEWAY_USAGE_API_KEY
            }
        }
    }
};


export default awsConfig;