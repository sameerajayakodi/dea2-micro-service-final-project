#!/bin/bash

# Configuration
CHANGES_DIR="src/main/resources/db/changelog/changes"
MASTER_FILE="src/main/resources/db/changelog/db.changelog-master.yaml"

# Check if name is provided
if [ -z "$1" ]; then
  echo "Usage: ./add_migration.sh <migration-name>"
  echo "Example: ./add_migration.sh add-email-to-worker"
  exit 1
fi

# Convert spaces or underscores to dashes, convert to lowercase
MIGRATION_NAME=$(echo "$1" | tr ' _' '-' | tr '[:upper:]' '[:lower:]')

# Ensure directory exists
mkdir -p "$CHANGES_DIR"

# Find the highest prefix number
LATEST_PREFIX=$(ls $CHANGES_DIR | grep -Eo '^[0-9]+' | sort -n | tail -1)

if [ -z "$LATEST_PREFIX" ]; then
  NEXT_PREFIX="001"
else
  # Increment and pad with zeros (10# forces base 10 to avoid octal issues)
  NEXT_PREFIX=$(printf "%03d" $((10#$LATEST_PREFIX + 1)))
fi

NEW_FILE="${NEXT_PREFIX}-${MIGRATION_NAME}.yaml"
NEW_FILE_PATH="${CHANGES_DIR}/${NEW_FILE}"
INCLUDE_PATH="db/changelog/changes/${NEW_FILE}"

# Create the new changelog template
cat <<EOF > "$NEW_FILE_PATH"
databaseChangeLog:
  - changeSet:
      id: $((10#$NEXT_PREFIX))-${MIGRATION_NAME}
      author: $(whoami)
      changes:
        # Add your database changes here
        # Example:
        # - addColumn:
        #     tableName: worker
        #     columns:
        #       - column:
        #           name: email
        #           type: VARCHAR(255)
EOF

echo "✅ Created new migration file: $NEW_FILE_PATH"

# Check if the master file ends with a newline, if not add one before appending
[ -n "$(tail -c1 "$MASTER_FILE")" ] && echo >> "$MASTER_FILE"

# Append to master changelog
echo "  - include:" >> "$MASTER_FILE"
echo "      file: $INCLUDE_PATH" >> "$MASTER_FILE"

echo "✅ Added reference to $MASTER_FILE"
echo "Done! You can now edit $NEW_FILE_PATH and then run ./liquibase.sh update"
