# Backend & Frontend Connection Guide

This guide shows you how to connect your local or remote backend to the frontend application.

## Quick Start (Local Development)

### Prerequisites
- Backend running on `http://localhost:3001`
- Frontend running on `http://localhost:3000`
- Supabase project set up with database schema
- Payvessel account configured

### 1. Frontend Setup

The frontend `.env.local` file is already created with:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_CALLBACK_URL=http://localhost:3000/payment-callback
```

If your backend is on a different port, update `.env.local`:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:YOUR_PORT
```

### 2. Start the Frontend

```bash
cd /path/to/frontend
pnpm dev
# Frontend will be on http://localhost:3000
```

### 3. Start the Backend (in separate terminal)

```bash
cd backend
npm start
# Backend will be on http://localhost:3001
```

### 4. Test the Connection

1. Go to `http://localhost:3000`
2. Click on any data plan card
3. The payment modal should appear with auto-detected MAC address
4. Payment should redirect to Payvessel

## Environment Variables Explained

### Frontend (.env.local)

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | API endpoint for all backend calls | `http://localhost:3001` |
| `NEXT_PUBLIC_CALLBACK_URL` | Payvessel redirect URL after payment | `http://localhost:3000/payment-callback` |

### Backend (.env)

| Variable | Purpose |
|----------|---------|
| `PORT` | Backend server port (default 3001) |
| `NODE_ENV` | development or production |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Supabase public API key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `JWT_SECRET` | Secret key for JWT tokens |
| `PAYVESSEL_SECRET_KEY` | Your Payvessel secret key |
| `PAYVESSEL_PUBLIC_KEY` | Your Payvessel public key |
| `FRONTEND_URL` | Frontend base URL (for CORS) |
| `CALLBACK_URL` | Payment callback redirect |

## API Endpoints Used by Frontend

All requests are prefixed with `NEXT_PUBLIC_BACKEND_URL`:

### Payment
- `POST /api/orders/checkout` - Initialize payment
- `POST /api/orders/verify-payment` - Verify payment after completion
- `GET /api/orders/devices` - Get user's registered devices

### Device Detection
- `POST /api/device/detect-mac` - Detect device MAC via ARP lookup
- `GET /api/device/local-macs` - Get local network MACs

### Data Plans
- `GET /api/plans` - Get all available plans
- `GET /api/plans/:id` - Get specific plan

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Troubleshooting

### "Backend not reachable"
- Check backend is running: `curl http://localhost:3001/api/plans`
- Verify `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
- Check CORS settings in backend `server.js`

### "CORS error"
- Ensure backend has correct `FRONTEND_URL` in `.env`
- Check backend CORS middleware includes your frontend URL

### "Payment fails with 401"
- Verify Payvessel keys in backend `.env`
- Check JWT token is being sent correctly

### "MAC address not detecting"
- Open browser console to see errors
- Manually enter MAC address format: `00:1A:2B:3C:4D:5E`

## Production Deployment

### Update .env.local
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
NEXT_PUBLIC_CALLBACK_URL=https://your-frontend-domain.com/payment-callback
```

### Update backend .env
```bash
FRONTEND_URL=https://your-frontend-domain.com
CALLBACK_URL=https://your-frontend-domain.com/payment-callback
PAYVESSEL_SECRET_KEY=sk_live_xxx  # Use live keys
PAYVESSEL_PUBLIC_KEY=pk_live_xxx
```

## API Response Examples

### Checkout Response
```json
{
  "success": true,
  "paymentUrl": "https://checkout.payvessel.com/...",
  "reference": "REF_12345678"
}
```

### Verify Payment Response
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "reference": "REF_12345678",
  "macAddress": "00:1A:2B:3C:4D:5E"
}
```

## Next Steps

1. ✓ Frontend environment configured
2. ✓ Backend environment configured
3. Run `pnpm dev` in frontend directory
4. Run `npm start` in backend directory
5. Test payment flow with test cards from Payvessel
6. Deploy to Vercel (frontend) and Heroku/Railway/AWS (backend)
