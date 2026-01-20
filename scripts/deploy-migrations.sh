#!/bin/sh
set -e

# Configuration
MIGRATION_NAME="20251225143229_init_better_auth"
CONFIG_FILE="prisma.main.config.ts"

echo "Attempting to deploy migrations..."

# Try to deploy migrations
if npx prisma migrate deploy --config "$CONFIG_FILE"; then
    echo "Migrations deployed successfully."
    exit 0
else
    EXIT_CODE=$?
    echo "Migration deployment failed with exit code $EXIT_CODE"
    
    # Check if failure is due to relation already existing
    # We allow the script to fail so we can check the output (but here we need to capture it if we want to parse it automatically, 
    # but prisma migrate deploy sends to stderr. 
    # A simpler approach is to blindly try to resolve if deploy fails, or ask user to verify.
    # However, to be safe, we can try to resolve the specific known conflicting migration if it's not applied.
    
    echo "Attempting to resolve known conflict for migration: $MIGRATION_NAME"
    
    # Try to resolve the specific migration
    if npx prisma migrate resolve --applied "$MIGRATION_NAME" --config "$CONFIG_FILE"; then
        echo "Successfully resolved migration $MIGRATION_NAME"
        
        echo "Retrying migration deployment..."
        npx prisma migrate deploy --config "$CONFIG_FILE"
    else
        echo "Failed to resolve migration or original error was different."
        exit $EXIT_CODE
    fi
fi
