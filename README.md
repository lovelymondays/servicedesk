# SupportDesk Application

A task management system for support teams with user authentication and category-based content organization.

## Local Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js (v18 or later)
- Go (v1.19 or later)

### Database Setup

1. Start the PostgreSQL database using Docker Compose:

   ```bash
   docker-compose up -d
   ````

2. The database will be initialized with the schema from `backend/scripts/init_db.sql`

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install Go dependencies:

   ```bash
   go mod download
   ```

3. Start the backend server:

   ```bash
   go run main.go
   ```

The backend will run on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## Default Users

The system comes with these default users:

- Admin: <admin@supportdesk.com> (password: admin123)
- User: <john.doe@company.com> (password: user123)

## Database Management

To connect to the database for management:

```bash
docker exec -it skipsi-aldo-postgres-1 psql -U postgres -d supportdesk
```

Useful PostgreSQL commands:

- `\dt` - List all tables
- `\d+ table_name` - Show table structure
- `\q` - Quit psql
