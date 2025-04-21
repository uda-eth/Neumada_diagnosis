#!/bin/bash

# Reset Database Script
# This script truncates all tables while preserving database structure

echo "Starting database reset operation..."
echo "WARNING: This will delete ALL data in ALL tables!"
echo "Press Ctrl+C now to cancel, or wait 5 seconds to continue..."

# Wait for 5 seconds to allow cancellation
sleep 5

# Run the reset script
echo "Running database reset..."
tsx reset-db.js

echo "Reset operation complete!"