#!/bin/bash

# Load environment variables from .env file
set -a
source ../.env
set +a

# Create database if it doesn't exist
psql -h $DB_HOST -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE $DB_NAME"

echo "Database '$DB_NAME' is ready" 