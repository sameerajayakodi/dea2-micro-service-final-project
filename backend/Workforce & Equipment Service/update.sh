#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Default command is 'update' if no argument is provided
COMMAND=${1:-update}

echo "Running: mvn liquibase:$COMMAND"

mvn liquibase:$COMMAND \
  -Dliquibase.url=$DB_URL \
  -Dliquibase.username=$DB_USERNAME \
  -Dliquibase.password=$DB_PASSWORD
