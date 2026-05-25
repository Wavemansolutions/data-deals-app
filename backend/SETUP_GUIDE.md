# Waveman Data Deals Backend - Setup & Download Guide

## Quick Start

### 1. Download the Backend Files

Since you're working with v0, follow these steps to download and set up your backend:

#### Option A: Using Git (Recommended)
```bash
git clone https://github.com/yourusername/waveman-backend.git
cd waveman-backend
npm install
```

#### Option B: Manual Download
1. Go to your project directory: `/vercel/share/v0-project/backend`
2. Copy all files to your local machine
3. Run: `npm install`

### 2. Set Up Environment Variables

Create a `.env` file in the backend directory with:

```env
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRY=7d

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx  # Get from Paystack dashboard
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx  # Get from Paystack dashboard

# CORS Configuration
FRONTEND_URL=http://localhost:3000
CALLBACK_URL=http://localhost:3000/payment-callback
```

### 3. Set Up Supabase Database

1. Go to [Supabase](https://supabase.com) and create a free account
2. Create a new project
3. Go to SQL Editor and run the entire contents of `DATABASE_SCHEMA.sql`
4. Enable Row Level Security (RLS) for all tables

### 4. Get Paystack API Keys

1. Sign up at [Paystack](https://dashboard.paystack.com)
2. Go to Settings → API Keys
3. Copy your **Secret Key** and **Public Key**
4. Add them to your `.env` file

### 5. Start the Backend

```bash
npm start           # Production mode
npm run dev         # Development mode with auto-reload
```

The backend will run on `http://localhost:3001`

---

## Backend API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Data Plans
- `GET /api/plans` - Get all plans
- `GET /api/plans/:id` - Get specific plan
- `POST /api/plans` - Create plan (admin only)
- `PUT /api/plans/:id` - Update plan (admin only)
- `DELETE /api/plans/:id` - Delete plan (admin only)

### Payment & Orders
- `POST /api/orders/checkout` - Initialize Paystack payment
- `POST /api/orders/verify-payment` - Verify payment after redirect
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/devices` - Get user's registered devices (MAC addresses)
- `GET /api/orders/all` - Get all orders (admin only)
- `POST /api/orders/webhook` - Paystack webhook handler

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contacts (admin only)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user role
- `GET /api/admin/reports` - Get sales reports

---

## Integration with Frontend

### Environment Variables for Frontend

Add to your `.env.local` in the Next.js app:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### Payment Flow

1. User clicks on a data plan card
2. Payment modal opens requesting email and MAC address
3. User submits → Redirects to Paystack payment page
4. After payment → Redirects to `/payment-callback`
5. Backend verifies payment and registers MAC address
6. User sees success page with MAC address

---

## Deployment

See `DEPLOYMENT.md` for guides on deploying to:
- Vercel
- Heroku
- AWS
- DigitalOcean
- Railway

---

## Paystack Webhook Setup

For production, set up Paystack webhook:

1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/orders/webhook`
3. Select events: `charge.success`

---

## Database Schema Overview

### Tables

- **users** - User accounts and authentication
- **plans** - Data packages (daily, weekly, monthly)
- **orders** - Payment records and order tracking
- **device_registrations** - MAC address tracking for activated devices
- **contact_submissions** - Contact form submissions

### Key Fields

- `mac_address` - Device MAC address (format: 00:1A:2B:3C:4D:5E)
- `paystack_reference` - Paystack payment reference ID
- `device_registrations.expires_at` - Plan expiration date

---

## Troubleshooting

### "Connection refused" error
- Ensure backend is running on port 3001
- Check `FRONTEND_URL` is correct in `.env`

### Paystack payment fails
- Verify `PAYSTACK_SECRET_KEY` is correct
- Ensure webhook is set up (for production)
- Check payment amount is in kobo (₦1 = 100 kobo)

### MAC address not registering
- Check database schema is fully deployed
- Ensure `device_registrations` table exists
- Verify RLS policies are enabled

### JWT token errors
- Update `JWT_SECRET` to a strong random string
- Ensure token is sent in `Authorization: Bearer {token}` header

---

## Support

For issues or questions, contact: support@waveman.com.ng
