# Online Judge Platform

A full-stack coding platform with real-time code execution, AI assistance, and competitive programming features.

## 🏗️ Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Compiler Service**: Node.js microservice for code execution
- **AI Integration**: Google Gemini AI for code assistance

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Git

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Development
   ```

2. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

3. **Environment Setup**:
   - Backend: Configure `backend/.env`
   - Frontend: Configure `frontend/.env`
   - Compiler: No additional config needed

4. **Populate Database** (optional):
   ```bash
   npm run populate-db
   ```

5. **Start Development Servers**:
   ```bash
   npm run dev
   ```

This will start all three services simultaneously:
- **Backend API**: http://localhost:5000
- **Compiler Service**: http://localhost:5001  
- **Frontend**: http://localhost:5173
3. **Compiler** (Port 3001) - Code execution service

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Python 3.x (for Python code execution)
- GCC/G++ (for C/C++ code execution)

### Installation & Setup

1. **Clone and Install Dependencies**
```bash
# Install all dependencies
npm run install:all

# Or install individually
npm run install:backend
npm run install:frontend  
npm run install:compiler
```

2. **Environment Configuration**
   - Backend: `backend/.env` (already configured)
   - Frontend: `frontend/.env.local` (already configured)
   - Compiler: `compiler/.env` (already configured)

3. **Database Setup**
```bash
# Seed database with sample problems and admin user
npm run seed:database
```

4. **Start All Services**
```bash
# Development mode (all services with hot reload)
npm run dev

# Production mode
npm run start
```

### Individual Service Commands

```bash
# Backend only
cd backend && npm run dev

# Frontend only  
cd frontend && npm run dev

# Compiler only
cd compiler && npm run dev
```

## 🔧 Service Integration

### Backend ↔ Database
- MongoDB connection via Mongoose
- Models: Problem, TestCase, User, Submission, Discussion
- Authentication via Google OAuth + JWT

### Backend ↔ Compiler
- HTTP requests to compiler service for code execution
- Backend sends code + test cases to compiler
- Compiler returns execution results

### Frontend ↔ Backend
- REST API calls for all data operations
- Authentication flow with Google OAuth
- Real-time updates for submissions

### Frontend ↔ Compiler
- Direct API calls for code testing (Run button)
- Submission flow goes through backend

## 📊 Database Schema

### Problems
- Basic info: title, description, difficulty, tags
- Test cases: input/output pairs with visibility
- Statistics: submission counts, acceptance rates
- Constraints: time/memory limits

### Users
- Google OAuth integration
- Progress tracking
- Admin capabilities

### Submissions
- User code + language
- Execution results
- Test case results
- Performance metrics

## 🔌 API Endpoints

### Backend API (Port 5000)
```
Authentication:
POST /auth/google - Google OAuth
GET /auth/profile - User profile

Problems:
GET /api/problems - List problems
GET /api/problems/:slug - Get problem details
GET /api/problems/:slug/testcases - Get visible test cases

Submissions:
POST /api/submissions - Create submission
GET /api/submissions - Get user submissions
GET /api/submissions/:id - Get submission details

Discussions:
GET /api/discussions - List discussions
POST /api/discussions - Create discussion

Leaderboard:
GET /api/leaderboard - Get leaderboard
```

### Compiler API (Port 3001)
```
Code Execution:
POST /api/execute/run - Run code with custom input
POST /api/execute/submit - Submit code against test cases
GET /api/execute/languages - Get supported languages
GET /api/execute/limits - Get execution limits
```

## 🌐 Frontend Pages

- `/` - Home page
- `/problems` - Problem list with filtering
- `/problems/[slug]` - Individual problem page with code editor
- `/dashboard` - User dashboard
- `/submissions` - Submission history
- `/leaderboard` - Global leaderboard
- `/discussions` - Community discussions
- `/admin` - Admin panel

## 🔥 Features

### Code Editor
- Syntax highlighting for multiple languages
- Language templates
- Run code with custom input
- Submit code against test cases

### Problem Management
- Rich text descriptions with examples
- Sample and hidden test cases
- Difficulty levels and tags
- Statistics tracking

### User System
- Google OAuth authentication
- Progress tracking
- Submission history
- Points and ranking system

### Admin Features
- Problem creation and management
- User management
- System monitoring

## 🛠️ Development

### Adding New Problems
1. Use admin panel or directly add to database
2. Include sample and hidden test cases
3. Set appropriate difficulty and tags

### Adding New Languages
1. Update compiler service language configuration
2. Add compilation/execution commands
3. Update frontend language options

### Database Operations
```bash
# Seed admin user
npm run seed:admin

# Seed sample problems
npm run seed:problems

# Seed everything
npm run seed:all
```

## 🚀 Deployment

### Environment Variables
Ensure all `.env` files are properly configured for production:
- Database URLs
- OAuth credentials  
- Service URLs
- JWT secrets

### Build Process
```bash
# Build frontend
npm run build:frontend

# Start production services
npm run start
```

## 🧪 Testing

### Test Code Execution
1. Go to `/problems/hello-world`
2. Write a simple program
3. Test with "Run" button
4. Submit with "Submit" button

### Test Integration
1. Create account via Google OAuth
2. Browse problems
3. Submit solutions
4. Check leaderboard
5. Participate in discussions

## 🔍 Troubleshooting

### Common Issues
1. **Port conflicts** - Ensure ports 3000, 5000, 3001 are available
2. **Database connection** - Check MongoDB is running
3. **Code execution** - Ensure Python/GCC are installed
4. **OAuth errors** - Verify Google OAuth credentials

## 📝 Notes

- The system is designed to handle concurrent users
- Code execution is sandboxed for security
- All services include proper error handling
- Database relationships are properly indexed
- Frontend includes responsive design