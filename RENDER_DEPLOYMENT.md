# Render Deployment Configuration

## Backend Service (ai-sdr-k9ml.onrender.com)

### Environment Variables
```
XAI_API_KEY=your_xai_api_key_here
DATABASE_URL=sqlite:///./data/app.db
ENVIRONMENT=production
DEBUG=false
```

### Build Command
```bash
pip install -r requirements.txt
```

### Start Command
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Health Check Path
```
/health
```

---

## Frontend Service (ai-sdr-frontend-acds.onrender.com)

### Environment Variables
```
VITE_API_BASE_URL=https://ai-sdr-k9ml.onrender.com
```

### Build Command
```bash
npm ci && npm run build
```

### Start Command
```bash
npx serve -s dist -l $PORT
```

### Health Check Path
```
/
```

---

## Deployment Steps

1. **Backend Deployment:**
   - Connect your GitHub repository
   - Set root directory to `backend/`
   - Add environment variables
   - Deploy

2. **Frontend Deployment:**
   - Create a new service
   - Connect same GitHub repository
   - Set root directory to `frontend/`
   - Add environment variables
   - Deploy

3. **Update CORS (if needed):**
   - After both services are deployed, update CORS origins in backend
   - Redeploy backend service

## Troubleshooting

### Frontend not loading:
- Check if `VITE_API_BASE_URL` is set correctly
- Verify backend is accessible
- Check browser console for CORS errors

### API calls failing:
- Verify CORS configuration includes frontend URL
- Check backend logs for errors
- Ensure XAI_API_KEY is set

### Build failures:
- Check build logs for specific errors
- Verify all dependencies are in requirements.txt/package.json
- Ensure proper root directory is set
