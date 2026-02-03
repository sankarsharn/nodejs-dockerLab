# Library Management System - MERN Stack

A comprehensive Library Management System built with MongoDB, Express.js, React, and Node.js (MERN stack).

## Features

- **Authentication** - JWT-based login/register for Admin and Librarian roles
- **Dashboard** - Real-time statistics, recent activity, and category insights
- **Book Management** - Full CRUD with search, filter by category
- **Member Management** - Registration with auto-generated membership ID
- **Issue/Return** - Book lending with due date tracking
- **Fine System** - Automatic calculation for overdue books (₹5/day)
- **Overdue Tracking** - Dedicated page for overdue book alerts

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT, bcryptjs |
| Styling | Custom CSS (Dark Theme) |

## Project Structure

```
ProfessionalLab/
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   └── server.js         # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/   # Reusable components
    │   ├── context/      # Auth context
    │   ├── pages/        # Page components
    │   └── services/     # API service
    └── index.html
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### 1. Clone Repository
```bash
cd ProfessionalLab
git checkout sujal
```

### 2. Backend Setup
```bash
cd backend

# Copy environment file
cp example.env .env

# Update .env with your MongoDB URI
# MONGODB_URI=mongodb://localhost:27017/library_db

# Install dependencies
npm install

# Start server
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/library_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
FINE_PER_DAY=5
DEFAULT_ISSUE_DAYS=14
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user

### Books
- `GET /api/books` - Get all books (with search/filter)
- `POST /api/books` - Add new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Members
- `GET /api/members` - Get all members
- `POST /api/members` - Add new member
- `GET /api/members/:id/history` - Get member's transaction history

### Transactions
- `POST /api/transactions/issue` - Issue book to member
- `POST /api/transactions/return/:id` - Return book
- `GET /api/transactions/overdue` - Get overdue books

### Dashboard
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/recent` - Get recent activity

## Default Users

After setup, register your first admin account through the UI.

## Screenshots

The application features a modern dark theme with:
- Gradient accents
- Card-based layouts
- Responsive design
- Smooth animations

## License

ISC