# Workforce & Equipment Service

### Using the Helper Script

A `update.sh` script is provided that automatically loads credentials from `.env`:

```bash
# Apply all pending migrations
./update.sh

# Check migration status
./update.sh status

# Rollback last changeset
./update.sh rollback -Dliquibase.rollbackCount=1

# Validate changelog syntax
./update.sh validate

# Preview SQL without applying
./update.sh updateSQL
```

### Adding New Migrations

We've provided a helper script to automate creating new migrations:

```bash
./migration.sh "add email to worker"
```

This script will automatically:
1. Determine the next sequence number (e.g., `002-add-email-to-worker.yaml`)
2. Create a boilerplate migration file in `src/main/resources/db/changelog/changes/`
3. Append the new file reference to the master changelog (`src/main/resources/db/changelog/db.changelog-master.yaml`)

After running the script, open the newly created YAML file, add your schema changes, and then apply them:

```bash
./update.sh
```
