#!/bin/bash

# Reset All Tables Script
# This script deletes all data from all tables while preserving database structure

echo "Starting database reset operation..."
echo "WARNING: This will delete ALL data in ALL tables!"
echo "Press Ctrl+C now to cancel, or wait 5 seconds to continue..."

# Run the direct reset script
tsx reset-db-tables.js

echo "Reset operation complete!"