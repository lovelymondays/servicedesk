# Support Desk Backend

## Database Setup

The application uses PostgreSQL as its database. Follow these steps to set up the database:

1. Make sure you have PostgreSQL installed and running
2. Copy `.env.example` to `.env` and update the values if needed:

   ```bash
   cp .env.example .env
   ```

3. Run the database initialization script:

   ```bash
   cd scripts
   ./init_db.sh
   ```

4. The application will automatically run migrations and seed the database when started

## Database Structure

The database consists of two main tables:

### Users Table

- `id`: Primary key
- `email`: Unique email address
- `w`: Hashed password
- `role`: User role (admin/user)
- Standard timestamps (created_at, updated_at, deleted_at)

### Tasks Table

- `id`: Primary key
- `title`: Task title
- `description`: Short description
- `content`: Full content
- `type`: Task type (Q&A/Issue)
- `category`: Task category (indexed)
- `status`: Task status (pending/approved/rejected)
- `rating`: Task rating (0-5)
- `keywords`: Array of keywords
- `user_id`: Foreign key to users table
- Standard timestamps (created_at, updated_at, deleted_at)

## Development

The database migrations are managed using GORM's auto-migration feature. New migrations should be added to the `migrations` package.

To add a new migration:

1. Create a new file in `migrations/` with a sequential number prefix
2. Implement the migration function
3. Add the migration to the list in `migrations/manager.go`

## Environment Variables

Database configuration can be customized through environment variables:

- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 5432)
- `DB_USER`: Database user (default: postgres)
- `DB_PASSWORD`: Database password (default: postgres)
- `DB_NAME`: Database name (default: supportdesk)
- `DB_SSLMODE`: SSL mode (default: disable)
