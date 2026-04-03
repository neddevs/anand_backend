# Database Setup Instructions

## 1. Install Dependencies

```bash
cd backend
npm install
```

## 2. Environment Configuration

Create a `.env` file in the backend directory with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/bhakti-bhoomi

# JWT Configuration
JWT_SECRET=bhakti-bhoomi-super-secret-jwt-key-2024
JWT_EXPIRE=7d

# Server Configuration
PORT=5002
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

## 3. Install MongoDB

### Option A: Local MongoDB Installation
- Download and install MongoDB Community Server from https://www.mongodb.com/try/download/community
- Start MongoDB service

### Option B: MongoDB Atlas (Cloud)
- Create a free account at https://www.mongodb.com/atlas
- Create a new cluster
- Get your connection string and update MONGODB_URI in .env

## 4. Start the Backend Server

```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

## 5. Test the API

The server will be running at http://localhost:5000

### Health Check
```bash
curl http://localhost:5002/api/health
```

### Register a User
```bash
curl -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

## 6. Database Validation

### Using MongoDB Compass (GUI)
1. Download MongoDB Compass from https://www.mongodb.com/products/compass
2. Connect to your MongoDB instance
3. Navigate to the `bhakti-bhoomi` database
4. Check the `users` collection to see registered users

### Using MongoDB Shell
```bash
# Connect to MongoDB
mongosh

# Switch to the database
use bhakti-bhoomi

# View all users
db.users.find().pretty()

# View user count
db.users.countDocuments()

# View specific user
db.users.findOne({email: "john@example.com"})
```

## 7. Frontend Integration

Update your frontend to use the backend API by setting the environment variable:

Create `.env` in the root directory:
```env
REACT_APP_API_URL=http://localhost:5002/api
```

Then restart your React development server:
```bash
npm start
```









