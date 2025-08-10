#!/bin/bash

echo "🚀 Online Judge Platform - Railway Deployment Helper"
echo "=================================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    exit 1
fi

# Check if all required files exist
echo "📋 Checking project files..."
if [ ! -f "backend/package.json" ]; then
    echo "❌ Backend package.json not found"
    exit 1
fi

if [ ! -f "compiler/package.json" ]; then
    echo "❌ Compiler package.json not found"
    exit 1
fi

if [ ! -f "frontend/package.json" ]; then
    echo "❌ Frontend package.json not found"
    exit 1
fi

echo "✅ All required files found"
echo ""

# Check if environment files exist
echo "🔧 Checking environment files..."
if [ ! -f "backend/env.production" ]; then
    echo "⚠️  Backend production env file not found. Creating from template..."
    cp backend/env.example backend/env.production 2>/dev/null || echo "   Please create backend/env.production manually"
fi

if [ ! -f "compiler/env.production" ]; then
    echo "⚠️  Compiler production env file not found. Creating from template..."
    cp compiler/env.example compiler/env.production 2>/dev/null || echo "   Please create compiler/env.production manually"
fi

if [ ! -f "frontend/env.production" ]; then
    echo "⚠️  Frontend production env file not found. Creating from template..."
    echo "   Please create frontend/env.production manually"
fi

echo "✅ Environment files checked"
echo ""

# Check if Railway configs exist
echo "🚂 Checking Railway configurations..."
if [ ! -f "railway.json" ]; then
    echo "⚠️  Root railway.json not found"
fi

if [ ! -f "backend/railway.json" ]; then
    echo "⚠️  Backend railway.json not found"
fi

if [ ! -f "compiler/railway.json" ]; then
    echo "⚠️  Compiler railway.json not found"
fi

echo "✅ Railway configurations checked"
echo ""

echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "1. 📚 Read DEPLOYMENT.md for detailed instructions"
echo "2. 🗄️  Setup MongoDB Atlas database"
echo "3. 🚂 Deploy to Railway:"
echo "   - Backend service (from backend folder)"
echo "   - Compiler service (from compiler folder)"
echo "   - Frontend service (from frontend folder)"
echo "4. 🔐 Set environment variables in Railway"
echo "5. 🧪 Test your deployment"
echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT.md"
echo "🌐 Railway Dashboard: https://railway.app"
echo "🗄️  MongoDB Atlas: https://www.mongodb.com/atlas"
echo ""
echo "Good luck with your deployment! 🚀"
