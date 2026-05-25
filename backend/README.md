# Waveman Data Deals Backend

A Node.js/Express backend for the Waveman data deals application with Supabase integration, Stripe payments, and admin dashboard.

## Features

- **User Authentication**: Registration and login with JWT tokens
- **Data Plans Management**: Create, read, update, delete data plans
- **Order Management**: Process orders and track purchases
- **Payment Processing**: Stripe integration for secure payments
- **Contact Form**: Handle user inquiries
- **Admin Panel APIs**: Manage users, view analytics, and monitor submissions

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- Stripe account

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with your configuration:
```
PORT=3001
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
FRONTEND_URL=http://localhost:3000
```

## Setup Database

1. Go to your Supabase project SQL editor
2. Copy the entire contents of `DATABASE_SCHEMA.sql`
3. Paste and run in the SQL editor
4. This will create all tables and seed sample data

## Running the Server

```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Plans
- `GET /api/plans` - Get all plans
- `GET /api/plans/category/:category` - Get plans by category
- `POST /api/plans` - Create plan (Admin only)
- `PUT /api/plans/:id` - Update plan (Admin only)
- `DELETE /api/plans/:id` - Delete plan (Admin only)

### Orders
- `POST /api/orders/checkout` - Create Stripe checkout session
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/all` - Get all orders (Admin only)
- `POST /api/orders/webhook` - Stripe webhook handler

### Contact
- `POST /api/contact/submit` - Submit contact form
- `GET /api/contact/submissions` - Get submissions (Admin only)

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/contact-submissions` - Get contact submissions
- `PUT /api/admin/contact-submissions/:id` - Update submission status

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRY` - JWT expiry time (default: 7d)
- `STRIPE_SECRET_KEY` - Stripe secret API key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `FRONTEND_URL` - Frontend application URL

## Deployment

### To Vercel:
1. Push your backend code to GitHub
2. Create a new project on Vercel
3. Connect your GitHub repository
4. Add environment variables in Settings
5. Deploy

### To Heroku:
1. Create Procfile with: `web: node server.js`
2. Push to Heroku: `git push heroku main`
3. Set environment variables: `heroku config:set KEY=VALUE`

## Error Handling

All endpoints return JSON responses with appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error

## Security Notes

- Always use HTTPS in production
- Keep JWT_SECRET secure and change in production
- Validate all user inputs
- Use Row Level Security (RLS) policies in Supabase
- Store sensitive data in environment variables

## Support

For issues or questions, contact: info@waveman.com.ng
