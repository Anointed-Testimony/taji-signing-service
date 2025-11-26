# Taji Signing Service

A Node.js microservice for signing BSC (Binance Smart Chain) ERC20 token transactions. This service is designed to be deployed on Render or similar platforms.

## Features

- Signs ERC20 token transactions using ethers.js
- RESTful API endpoint for transaction signing
- Health check endpoint for monitoring
- CORS enabled for cross-origin requests
- Comprehensive error handling and logging

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn

## Installation

1. Clone or download this repository
2. Install dependencies:
```bash
npm install
```

## Environment Variables

The service uses minimal environment variables. The private key should be passed in each request body from the Laravel backend for security.

- `PORT` (optional): Server port (default: 3000)

## API Endpoints

### Health Check
```
GET /health
```

Returns service status.

**Response:**
```json
{
  "status": "ok",
  "service": "taji-signing-service",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Sign Transaction
```
POST /sign-transaction
```

Signs a BSC transaction and returns the signed raw transaction hex.

**Request Body:**
```json
{
  "transaction": {
    "nonce": "0x1",
    "gasPrice": "0x3b9aca00",
    "gas": "0x5208",
    "to": "0xF1b6059dbC8B44Ca90C5D2bE77e0cBea3b1965fe",
    "value": "0x0",
    "data": "0xa9059cbb...",
    "chainId": 56
  },
  "privateKey": "0x..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "signedTransaction": "0x...",
  "message": "Transaction signed successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Deployment on Render

1. **Create a new Web Service on Render:**
   - Go to your Render dashboard
   - Click "New +" → "Web Service"
   - Connect your Git repository or use manual deploy

2. **Configure the service:**
   - **Name:** taji-signing-service (or your preferred name)
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free tier is fine for testing

3. **Environment Variables (optional):**
   - `PORT`: Leave empty (Render will assign automatically)

4. **Deploy:**
   - Render will automatically build and deploy your service
   - Note the service URL (e.g., `https://taji-signing-service.onrender.com`)

5. **Update Laravel Backend:**
   - Add the service URL to your Laravel `.env`:
   ```
   TAJI_SIGNING_SERVICE_URL=https://taji-signing-service.onrender.com
   ```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

3. Test the health endpoint:
```bash
curl http://localhost:3000/health
```

## Security Considerations

- **Private Key Handling:** The private key is sent in the request body for each transaction. This is acceptable for a private service, but consider:
  - Using HTTPS only (Render provides this automatically)
  - Implementing API key authentication
  - Rate limiting to prevent abuse
  - IP whitelisting if possible

## Integration with Laravel

Update your `WalletController.php` to call this service instead of BlockCypher:

```php
$signingServiceUrl = env('TAJI_SIGNING_SERVICE_URL', 'http://localhost:3000');

$signResponse = Http::timeout(30)->post($signingServiceUrl . '/sign-transaction', [
    'transaction' => $transaction,
    'privateKey' => $privateKey
]);

if ($signResponse->successful()) {
    $responseData = $signResponse->json();
    $signedTxRaw = $responseData['signedTransaction'];
    // Continue with broadcasting...
}
```

## Error Handling

The service includes comprehensive error handling:
- Missing required fields
- Invalid private key format
- Transaction signing failures
- Internal server errors

All errors are logged to the console for debugging.

## License

ISC

