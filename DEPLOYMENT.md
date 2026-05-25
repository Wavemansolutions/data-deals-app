# Deployment Guide

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your configuration

3. Run the server:
```bash
npm start
```

The server will run on `http://localhost:3001`

---

## Deploy to Vercel

### Prerequisites
- Vercel account
- GitHub repository

### Steps

1. **Push to GitHub**
```bash
git add .
git commit -m "Add backend code"
git push origin main
```

2. **Create Vercel Project**
- Go to https://vercel.com
- Click "Add New" → "Project"
- Import your GitHub repository
- Select the `/backend` directory as the root

3. **Add Environment Variables**
In Vercel Settings → Environment Variables, add:
```
PORT=3001
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
FRONTEND_URL=https://your-frontend-domain.com
```

4. **Deploy**
- Click "Deploy"
- Your backend will be available at `https://your-project.vercel.app`

---

## Deploy to Heroku

### Prerequisites
- Heroku account
- Heroku CLI installed

### Steps

1. **Login to Heroku**
```bash
heroku login
```

2. **Create Heroku App**
```bash
heroku create waveman-data-deals-api
```

3. **Add Environment Variables**
```bash
heroku config:set PORT=3001
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=your_supabase_url
heroku config:set SUPABASE_KEY=your_supabase_anon_key
heroku config:set SUPABASE_SERVICE_KEY=your_supabase_service_key
heroku config:set JWT_SECRET=your_jwt_secret_key
heroku config:set STRIPE_SECRET_KEY=your_stripe_secret_key
heroku config:set STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
heroku config:set STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
heroku config:set FRONTEND_URL=https://your-frontend-domain.com
```

4. **Create Procfile** (in backend directory)
```
web: node server.js
```

5. **Deploy**
```bash
git push heroku main
```

---

## Deploy to AWS EC2

### Prerequisites
- AWS EC2 instance running Ubuntu
- SSH access to instance
- Node.js installed on instance

### Steps

1. **Connect to EC2 Instance**
```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Clone Repository**
```bash
git clone https://github.com/your-repo/waveman-backend.git
cd waveman-backend
npm install
```

4. **Setup Environment**
```bash
nano .env
# Add your environment variables
```

5. **Use PM2 for Process Management**
```bash
npm install -g pm2
pm2 start server.js --name "waveman-backend"
pm2 startup
pm2 save
```

6. **Setup Nginx Reverse Proxy**
```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **SSL Certificate with Let's Encrypt**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Deploy to DigitalOcean App Platform

1. Push code to GitHub
2. Go to DigitalOcean Control Panel
3. Click "Create" → "App"
4. Select your GitHub repository
5. Configure settings:
   - Build command: `npm install`
   - Run command: `node server.js`
6. Add environment variables
7. Click "Deploy"

---

## Stripe Webhook Setup

After deployment, update Stripe webhook endpoint:

1. Go to Stripe Dashboard → Webhooks
2. Click "Add endpoint"
3. Enter your production URL: `https://your-domain.com/api/orders/webhook`
4. Select events: `checkout.session.completed`
5. Copy webhook signing secret to your `.env` as `STRIPE_WEBHOOK_SECRET`

---

## Database Backup

Regular backups are important. Supabase automatically backs up your data, but you can also manually export:

1. Go to Supabase Dashboard
2. Click "Database" → "Backups"
3. Click "Save backup" to manually backup

---

## Monitoring

### Vercel
- View logs in Vercel Dashboard
- Set up error tracking with Sentry

### Heroku
```bash
heroku logs --tail
```

### AWS/DigitalOcean
- Monitor with CloudWatch (AWS) or DigitalOcean Monitoring
- Check PM2 status: `pm2 status`

---

## Troubleshooting

### Port Already in Use
```bash
lsof -i :3001
kill -9 <PID>
```

### Database Connection Issues
- Verify `SUPABASE_URL` and `SUPABASE_KEY`
- Check Supabase project is active
- Ensure Row Level Security policies allow your app

### Stripe Webhook Failures
- Verify webhook signing secret
- Check endpoint URL is publicly accessible
- Monitor webhook delivery in Stripe Dashboard

---

## Production Checklist

- [ ] Update `FRONTEND_URL` environment variable
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET`
- [ ] Enable HTTPS/SSL certificate
- [ ] Set up database backups
- [ ] Configure Stripe webhook
- [ ] Monitor error logs
- [ ] Set up email notifications for errors
- [ ] Test all API endpoints
- [ ] Verify authentication flows
