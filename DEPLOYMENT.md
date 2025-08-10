# 🚀 Railway Deployment Guide

This guide will walk you through deploying your Online Judge Platform to Railway.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **MongoDB Atlas Account** - For cloud database (free tier available)

## 🗄️ Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Create a database user with read/write permissions
4. Get your connection string
5. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)

## 🚂 Step 2: Deploy Backend Service

1. **Go to Railway Dashboard**
   - Visit [railway.app](https://railway.app)
   - Click "New Project"
   - Choose "Deploy from GitHub repo"

2. **Select Repository**
   - Choose your repository
   - Select the `backend` folder as the source

3. **Configure Service**
   - Service Name: `online-judge-backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Set Environment Variables**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/online-judge
   DB_NAME=online-judge
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
   GEMINI_API_KEY=your-gemini-api-key
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-frontend-domain.railway.app
   COMPILER_SERVICE_URL=https://your-compiler-service.railway.app
   RATE_LIMIT_WINDOW=900000
   RATE_LIMIT_MAX=100
   BCRYPT_ROUNDS=12
   ```

5. **Deploy**
   - Click "Deploy Now"
   - Wait for deployment to complete
   - Copy the generated domain (e.g., `https://online-judge-backend-production-1234.up.railway.app`)

## 🔧 Step 3: Deploy Compiler Service

1. **Create New Service**
   - In the same project, click "New Service"
   - Choose "Deploy from GitHub repo"
   - Select the `compiler` folder

2. **Configure Service**
   - Service Name: `online-judge-compiler`
   - Build Command: `docker build -t compiler .`
   - Start Command: `npm start`

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=5001
   RATE_LIMIT_WINDOW=900000
   RATE_LIMIT_MAX=100
   ```

4. **Deploy**
   - Click "Deploy Now"
   - Wait for deployment to complete
   - Copy the generated domain

## 🌐 Step 4: Deploy Frontend Service

1. **Create New Service**
   - In the same project, click "New Service"
   - Choose "Deploy from GitHub repo"
   - Select the `frontend` folder

2. **Configure Service**
   - Service Name: `online-judge-frontend`
   - Build Command: `npm run build`
   - Start Command: `npm run preview`

3. **Set Environment Variables**
   ```
   VITE_API_URL=https://your-backend-domain.railway.app
   VITE_COMPILER_URL=https://your-compiler-service.railway.app
   ```

4. **Deploy**
   - Click "Deploy Now"
   - Wait for deployment to complete
   - Copy the generated domain

## 🔄 Step 5: Update Environment Variables

After all services are deployed, update the environment variables with the actual domains:

### Backend Service
```
FRONTEND_URL=https://your-actual-frontend-domain.railway.app
COMPILER_SERVICE_URL=https://your-actual-compiler-domain.railway.app
```

### Frontend Service
```
VITE_API_URL=https://your-actual-backend-domain.railway.app
VITE_COMPILER_URL=https://your-actual-compiler-domain.railway.app
```

## 🧪 Step 6: Test Your Deployment

1. **Test Backend Health**
   - Visit: `https://your-backend-domain.railway.app/health`
   - Should return: `{"success":true,"message":"Server is running"}`

2. **Test Compiler Health**
   - Visit: `https://your-compiler-domain.railway.app/health`
   - Should return: `{"status":"OK","service":"compiler-service"}`

3. **Test Frontend**
   - Visit your frontend domain
   - Try to register/login
   - Test code submission

## 🔐 Step 7: Security Setup

1. **Generate Strong JWT Secrets**
   ```bash
   # Use a strong random string generator
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Update JWT Secrets**
   - Go to your backend service in Railway
   - Update `JWT_SECRET` and `JWT_REFRESH_SECRET` with the generated values

3. **Get Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key
   - Add it to your backend environment variables

## 📊 Step 8: Monitor Your Services

1. **Railway Dashboard**
   - Monitor service health
   - Check logs for errors
   - Monitor resource usage

2. **MongoDB Atlas**
   - Monitor database performance
   - Check connection status
   - Monitor storage usage

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check build logs in Railway
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Environment Variables**
   - Double-check all environment variables are set
   - Ensure no typos in variable names
   - Verify MongoDB connection string format

3. **CORS Issues**
   - Check FRONTEND_URL in backend environment
   - Ensure frontend domain is correct
   - Verify CORS configuration in backend

4. **Database Connection**
   - Check MongoDB Atlas network access
   - Verify connection string format
   - Ensure database user has correct permissions

### Useful Commands:

```bash
# Check service logs in Railway
railway logs

# Restart a service
railway service restart

# Check service status
railway status
```

## 🎉 Congratulations!

Your Online Judge Platform is now deployed and accessible online! 

- **Frontend**: https://your-frontend-domain.railway.app
- **Backend API**: https://your-backend-domain.railway.app
- **Compiler Service**: https://your-compiler-domain.railway.app

## 🔄 Continuous Deployment

Railway automatically redeploys when you push to your GitHub repository. To update your application:

1. Make changes to your code
2. Commit and push to GitHub
3. Railway automatically detects changes and redeploys

## 💰 Cost Management

- **Free Tier**: 500 hours/month, 512MB RAM, 1GB storage
- **Pro Plan**: $5/month for additional resources
- **Usage**: Monitor your usage in Railway dashboard

## 📞 Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
