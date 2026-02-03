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