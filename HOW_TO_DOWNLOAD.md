# How to Download Your Backend Files

## Method 1: Download via v0 (Recommended)

1. **In v0 Dashboard:**
   - Click the three dots (⋯) in the top right
   - Select "Download ZIP"
   - This downloads your entire project including the backend folder

2. **Extract and Navigate:**
   ```bash
   unzip v0-project.zip
   cd v0-project/backend
   npm install
   ```

## Method 2: Clone from Git

If you've connected your project to GitHub:

```bash
git clone https://github.com/yourusername/waveman-backend.git
cd waveman-backend
npm install
```

## Method 3: Manual File Copy

The backend is located at `/vercel/share/v0-project/backend/` with the following structure:

```
backend/
├── config/
│   ├── supabase.js
│   └── paystack.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── plans.js
│   ├── orders.js
│   ├── contact.js
│   └── admin.js
├── .env
├── .env.example
├── .gitignore
├── server.js
├── package.json
├── DATABASE_SCHEMA.sql
├── SETUP_GUIDE.md
├── DEPLOYMENT.md
├── HOW_TO_DOWNLOAD.md
└── README.md
```

## Files to Copy

Essential files:
- ✅ `server.js` - Main entry point
- ✅ `package.json` - Dependencies
- ✅ `.env` - Configuration (DO NOT commit to git)
- ✅ `config/` - Database and payment configs
- ✅ `middleware/` - Authentication middleware
- ✅ `routes/` - API routes

Documentation:
- 📄 `DATABASE_SCHEMA.sql` - Supabase setup
- 📄 `SETUP_GUIDE.md` - Detailed setup instructions
- 📄 `DEPLOYMENT.md` - Deployment guides
- 📄 `README.md` - API documentation

## After Downloading

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create/edit `.env` with your credentials:
```bash
cp .env.example .env
# Edit .env with your Supabase and Paystack keys
```

### 3. Set Up Database
1. Go to Supabase SQL Editor
2. Copy entire contents of `DATABASE_SCHEMA.sql`
3. Paste and execute in Supabase

### 4. Start Backend
```bash
npm start          # Production
npm run dev        # Development (with hot reload)
```

Server runs on `http://localhost:3001`

### 5. Update Frontend

In your Next.js `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

## Deployment Preparation

Before deploying to production:

1. **Security Checklist:**
   - [ ] Change `JWT_SECRET` to a strong random string
   - [ ] Use Paystack live keys (not test keys)
   - [ ] Set `NODE_ENV=production`
   - [ ] Enable HTTPS for frontend URL
   - [ ] Set up Paystack webhook

2. **Database:**
   - [ ] Run all migrations from `DATABASE_SCHEMA.sql`
   - [ ] Enable Row Level Security (RLS)
   - [ ] Set up backups

3. **Environment Variables:**
   - [ ] Update all URLs to production domains
   - [ ] Use environment variables from deployment platform

## Deployment Platforms

See `DEPLOYMENT.md` for step-by-step guides:
- Vercel (Recommended for Next.js)
- Heroku
- AWS
- DigitalOcean
- Railway

## Verification

After setup, verify everything works:

```bash
# Check backend is running
curl http://localhost:3001/api/health
# Should return: {"status":"Backend is running"}

# Check database connection
# Try to fetch plans
curl http://localhost:3001/api/plans
```

## Troubleshooting Download

**Files not downloaded?**
- Use v0's download feature (three dots → Download ZIP)
- Or manually copy from `/vercel/share/v0-project/backend/`

**npm install fails?**
- Ensure Node.js 14+ is installed: `node --version`
- Delete `node_modules` and try again
- Clear npm cache: `npm cache clean --force`

**Port 3001 already in use?**
- Change PORT in `.env`: `PORT=3002`
- Or kill the process using the port

**Can't connect to Supabase?**
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Check Supabase project is active
- Test connection from Supabase dashboard

**Paystack integration not working?**
- Verify API keys in Paystack dashboard
- Make sure to use LIVE keys in production
- Check webhook is configured in Paystack settings

## Next Steps

1. ✅ Download backend files
2. ✅ Configure `.env`
3. ✅ Set up Supabase database
4. ✅ Get Paystack API keys
5. ✅ Install dependencies
6. ✅ Start backend
7. ✅ Test API endpoints
8. ✅ Deploy to production

Happy coding! 🚀
