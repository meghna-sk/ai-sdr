# Render Deployment Configuration

## Free Deployment on Render

### 1. Prepare Your Repository
Make sure your GitHub repo has:
- `docker-compose.yml` (already created)
- `backend/Dockerfile` (already created)
- `frontend/Dockerfile` (already created)
- `env.example` (already created)

### 2. Deploy on Render

#### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. No credit card required!

#### Step 2: Deploy Backend
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ai-sdr-backend`
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Port**: `8000`
4. Add Environment Variable:
   - **Key**: `XAI_API_KEY`
   - **Value**: `your_actual_api_key`
5. Click "Create Web Service"

#### Step 3: Deploy Frontend
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ai-sdr-frontend`
   - **Root Directory**: `frontend`
   - **Dockerfile Path**: `frontend/Dockerfile`
   - **Port**: `3000`
4. Add Environment Variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-url.onrender.com`
5. Click "Create Web Service"

### 3. Access Your App
- **Frontend**: `https://ai-sdr-frontend.onrender.com`
- **Backend**: `https://ai-sdr-backend.onrender.com`

### 4. Free Tier Limitations
- **Sleep Time**: Apps sleep after 15 minutes of inactivity
- **Wake Time**: Takes 30 seconds to wake up
- **Hours**: 750 hours/month (enough for personal use)

## Alternative: Vercel + Railway

### Frontend on Vercel (Free)
1. Go to [vercel.com](https://vercel.com)
2. Connect GitHub repo
3. Deploy frontend folder
4. Add environment variable: `VITE_API_BASE_URL`

### Backend on Railway (Free Trial)
1. Go to [railway.app](https://railway.app)
2. Use $5 free credit
3. Deploy backend
4. Connect to Vercel frontend

## Cost Comparison

| Platform | Frontend | Backend | Total Cost |
|----------|----------|---------|------------|
| **Render** | Free | Free | **$0** |
| **Vercel + Railway** | Free | Free trial | **$0** (initially) |
| **Netlify + Railway** | Free | Free trial | **$0** (initially) |

## My Recommendation: Render

**Why Render is best for free deployment:**
- ✅ **Completely free** (no credit card needed)
- ✅ **Easy setup** (just connect GitHub)
- ✅ **Docker support** (works with your current setup)
- ✅ **Automatic HTTPS** (secure by default)
- ✅ **No complex configuration** (just add environment variables)

**The only downside:**
- Apps sleep after 15 minutes (but wake up in 30 seconds)

This is perfect for:
- Personal projects
- Demos
- Testing
- Portfolio projects

Would you like me to walk you through the Render deployment process step by step?
