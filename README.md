DB_NAME=library_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=5432(docker port)
JWT_SECRET="supersecretkey123"
JWT_EXPIRES_IN=7d
FINE_PER_DAY=5
DEFAULT_ISSUE_DAYS=14
FRONTEND_PORT=5000

## docker command to download and config potgres
1.docker pull postgres
2.docker run --name library   -e POSTGRES_PASSWORD=postgres   -p 5432:5432   -d postgres
3.docker -it library psql -U postgres
4.CREATE DATABSE libray_db



# What the app does
It is designed to manage a library with typical operations:

User authentication and role-based access
Book catalog management
Member registration and management
Issuing books to members
Returning books and calculating overdue fines
Viewing overdue loans
Viewing user-specific borrowed books
Dashboard statistics and recent activity

# Docker
Exposes:
frontend at http://localhost:5173
backend at http://localhost:5000
Postgres at localhost:5432