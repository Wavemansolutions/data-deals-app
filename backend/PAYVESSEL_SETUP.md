# Payvessel Integration Guide

## Overview
This backend uses **Payvessel** as the payment gateway for processing data plan purchases. Users select a plan, provide their MAC address and email, and are redirected to Payvessel for payment.

## Getting Started with Payvessel

### 1. Create a Payvessel Account
- Visit [Payvessel Dashboard](https://dashboard.payvessel.com)
- Sign up for a new account
- Complete business verification

### 2. Get Your API Keys
1. Log in to your Payvessel dashboard
2. Navigate to **Settings** → **API Keys**
3. Copy the following:
   - **Secret Key** (sk_test_xxx or sk_live_xxx)
   - **Public Key** (pk_test_xxx or pk_live_xxx)

### 3. Configure Environment Variables
Create a `.env` file in the backend directory:

```env
# Payvessel Configuration
PAYVESSEL_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYVESSEL_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Other configurations
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
CALLBACK_URL=http://localhost:3000/payment-callback
```

## Payment Flow

### Step 1: User Initiates Payment
```bash
POST /api/orders/checkout
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

{
  "planId": "uuid",
  "macAddress": "00:1A:2B:3C:4D:5E",
  "email": "user@example.com"
}
```

### Step 2: Backend Creates Transaction
- Validates plan details
- Creates a Payvessel transaction
- Stores pending order in database
- Returns payment URL to frontend

### Step 3: User Redirected to Payvessel
- Frontend redirects user to payment URL
- Payvessel handles payment securely
- After payment, user is redirected to callback URL

### Step 4: Verify Payment
```bash
POST /api/orders/verify-payment
Content-Type: application/json

{
  "reference": "payvessel_reference"
}
```

- Backend verifies payment status
- Updates order to "completed"
- Registers MAC address in `device_registrations` table

### Step 5: MAC Address Stored
The device MAC address is now linked to the user and plan:
```sql
SELECT * FROM device_registrations 
WHERE user_id = 'user_id' AND mac_address = '00:1A:2B:3C:4D:5E'
```

## API Endpoints

### Initialize Payment
**Endpoint:** `POST /api/orders/checkout`
**Auth:** Required (Bearer Token)
**Body:**
```json
{
  "planId": "uuid",
  "macAddress": "00:1A:2B:3C:4D:5E",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://checkout.payvessel.com/...",
  "reference": "ref_xxxxxxxxxxxxx"
}
```

### Verify Payment
**Endpoint:** `POST /api/orders/verify-payment`
**Body:**
```json
{
  "reference": "ref_xxxxxxxxxxxxx"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "reference": "ref_xxxxxxxxxxxxx",
  "macAddress": "00:1A:2B:3C:4D:5E"
}
```

### Get User Orders
**Endpoint:** `GET /api/orders/my-orders`
**Auth:** Required

### Get User Devices
**Endpoint:** `GET /api/orders/devices`
**Auth:** Required
**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "mac_address": "00:1A:2B:3C:4D:5E",
    "plan_id": "uuid",
    "order_id": "ref_xxxxx",
    "activated_at": "2024-01-20T10:30:00Z",
    "status": "active",
    "plan": {
      "label": "10GB",
      "category": "monthly",
      "duration": "30 Days"
    }
  }
]
```

### Webhook
**Endpoint:** `POST /api/orders/webhook`
**Headers:** `x-payvessel-signature`

Payvessel sends webhook notifications for payment events:
```json
{
  "event": "transaction.completed",
  "data": {
    "reference": "ref_xxxxxxxxxxxxx",
    "status": "completed",
    "amount": 5000,
    "metadata": {
      "userId": "uuid",
      "planId": "uuid",
      "macAddress": "00:1A:2B:3C:4D:5E"
    }
  }
}
```

## Testing

### Test Credentials
Use these test card numbers in development:

| Card Type | Number | CVV | Expiry |
|-----------|--------|-----|--------|
| Visa | 4111 1111 1111 1111 | 123 | 12/25 |
| Mastercard | 5555 5555 5555 4444 | 123 | 12/25 |

### Test Flow
1. Start the backend: `npm start`
2. Open frontend and select a plan
3. Enter test MAC address: `00:1A:2B:3C:4D:5E`
4. Enter test email: `test@example.com`
5. Click "Pay"
6. Use test card credentials
7. Return to app - payment should be verified

## Transitioning to Production

### 1. Update API Keys
Replace test keys with live keys from Payvessel:
```env
PAYVESSEL_SECRET_KEY=sk_live_xxxxxxxxxxxxx
PAYVESSEL_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
```

### 2. Update URLs
```env
FRONTEND_URL=https://yourdomain.com
CALLBACK_URL=https://yourdomain.com/payment-callback
```

### 3. Enable Webhooks in Payvessel Dashboard
- Go to **Settings** → **Webhooks**
- Add your webhook URL: `https://yourdomain.com/api/orders/webhook`
- Select events: `transaction.completed`
- Save and test webhook

### 4. Test Live Environment
Create a small test transaction to verify everything works.

## Troubleshooting

### Payment URL Returns Error
- Check PAYVESSEL_SECRET_KEY is correct
- Verify plan exists in database
- Check user authentication

### Verification Fails
- Ensure reference is valid
- Check if payment was successful in Payvessel dashboard
- Verify SUPABASE keys are correct

### MAC Address Not Stored
- Check device_registrations table exists
- Verify user ID is correct
- Check database permissions

### Webhook Not Triggered
- Verify webhook URL is publicly accessible
- Check webhook signature validation
- Ensure event type matches

## Security Notes

1. **Always use HTTPS** in production
2. **Never expose SECRET_KEY** in frontend code
3. **Validate webhook signatures** to prevent spoofing
4. **Use environment variables** for sensitive data
5. **Implement rate limiting** on payment endpoints
6. **Log payment transactions** for audit trails

## Support

For Payvessel issues:
- [Payvessel Documentation](https://docs.payvessel.com)
- [Payvessel Support](https://support.payvessel.com)
- Email: support@payvessel.com

For application issues:
- Check error logs: `npm start` shows real-time errors
- Review database: Supabase dashboard for data verification
- Test endpoints: Use Postman or curl
