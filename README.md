# React Authentication App

A full-stack authentication application built with React frontend and PHP/MySQL backend.

## Features

- User Registration
- User Login
- JWT Token Authentication
- Protected Routes
- Modern, Responsive UI
- Secure Password Hashing

## Project Structure

```
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── context/           # React context for state management
│   └── ...
├── backend/               # PHP backend
│   ├── api/              # API endpoints
│   ├── config/           # Database and CORS configuration
│   ├── models/           # User model
│   ├── utils/            # JWT utilities
│   └── database/         # Database schema
└── public/               # Static files
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PHP (v7.4 or higher)
- MySQL (v5.7 or higher)
- Composer (optional, for PHP dependencies)

### Backend Setup

1. **Database Setup:**
   ```sql
   -- Run the SQL commands in backend/database/schema.sql
   mysql -u root -p < backend/database/schema.sql
   ```

2. **Configure Database:**
   - Update `backend/config/database.php` with your MySQL credentials
   - Default settings:
     - Host: localhost
     - Database: react_auth_app
     - Username: root
     - Password: (empty)

3. **Start PHP Server:**
   ```bash
   cd backend
   php -S localhost:8000
   ```

### Frontend Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm start
   ```

3. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## API Endpoints

### Authentication

- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `GET /api/user` - Get current user (requires JWT token)

### Example API Usage

**Register:**
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## Security Features

- Password hashing using PHP's `password_hash()`
- JWT tokens for stateless authentication
- CORS configuration for cross-origin requests
- Input validation and sanitization
- SQL injection prevention using prepared statements

## Development Notes

- The JWT secret key is set to a default value in `backend/utils/jwt.php`
- Change this to a secure random string in production
- The backend runs on port 8000 by default
- The frontend runs on port 3000 by default
- Make sure both servers are running for full functionality

## Sample User

A sample user is created with the database schema:
- Email: john@example.com
- Password: password123

## Troubleshooting

1. **CORS Issues:** Make sure the backend is running on port 8000
2. **Database Connection:** Verify MySQL is running and credentials are correct
3. **JWT Token Issues:** Check that the secret key is consistent
4. **Port Conflicts:** Ensure ports 3000 and 8000 are available

## Next Steps

- Add email verification
- Implement password reset functionality
- Add user profile management
- Implement role-based access control
- Add more comprehensive error handling





