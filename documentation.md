# SupportDesk Project Documentation

## Prerequisites

- Go (1.16 or later)
- Node.js (14.x or later)
- PostgreSQL (13.x or later)
- npm or yarn

## Project Structure

```bash
skipsi-aldo/
├── backend/         # Go backend server
├── frontend/        # React frontend application
└── documentation.md # This documentation
```

## Setup Instructions

### 1. Database Setup

1.Start PostgreSQL service:

```bash
# For systemd-based systems (like Ubuntu)
sudo systemctl start postgresql

# For Docker
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=supportdesk \
  -p 5432:5432 \
  postgres:13
```

2.Verify PostgreSQL is running:

```bash
psql -h localhost -U postgres -d supportdesk
# Or if using Docker
docker ps | grep postgres
```

### 2. Backend Setup

1.Navigate to the backend directory:

```bash
cd backend
```

2.Copy the example environment file:

```bash
cp .env.example .env
```

3.Install Go dependencies:

```bash
go mod download
go mod tidy
```

4.Run database migrations:

```bash
# Make sure you're in the backend directory
go run main.go migrate
```

5.Seed the database with initial data:

```bash
PGPASSWORD=postgres psql -h localhost -U postgres -d supportdesk -f scripts/seed_data.sql
```

6.Start the backend server:

```bash
go run main.go
```

The backend server will start on <http://localhost:8080>

### 3. Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2.Install dependencies:

```bash
npm install
# or
yarn install
```

3.Start the development server:

```bash
npm run dev
# or
yarn dev
```

The frontend application will start on <http://localhost:5173>

## Default Credentials

```text
Email: admin@supportdesk.com
Password: admin123
```

## Common Issues and Solutions

### 1. Database Connection Issues

If you see the error:

```text
failed to connect to `host=localhost user=postgres database=supportdesk`: dial error
```

Solutions:

- Ensure PostgreSQL service is running
- Check if the database exists
- Verify the credentials in `.env` file
- Make sure port 5432 is not in use

### 2. Backend Server Issues

If the backend server fails to start:

- Check if all environment variables are set correctly in `.env`
- Ensure the database is running and accessible
- Verify that port 8080 is not in use

### 3. Frontend Issues

If you encounter frontend issues:

- Clear browser cache and local storage
- Check browser console for errors
- Ensure backend API is accessible
- Verify that all environment variables are set correctly

## API Documentation

The backend provides the following main endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/user` - Get current user
- `GET /api/dashboard/:category` - Get tasks by category
- `POST /api/dashboard/:category` - Create new task
- `PUT /api/dashboard/:category/:id` - Update task
- `DELETE /api/dashboard/:category/:id` - Delete task

## Development Workflow

1. Start PostgreSQL service
2. Start backend server
3. Start frontend development server
4. Access the application at <http://localhost:5173>

## Troubleshooting

If you encounter any issues:

1. Check if PostgreSQL is running:

```bash
sudo systemctl status postgresql
# or for Docker
docker ps | grep postgres
```

2.Verify database connection:

```bash
PGPASSWORD=postgres psql -h localhost -U postgres -d supportdesk -c "\l"
```

3.Check backend logs:

```bash
cd backend && go run main.go
```

4.Check frontend console for errors (F12 in browser)

## Support

For additional support or questions, please refer to:

- Project documentation
- Issue tracker
- Development team
