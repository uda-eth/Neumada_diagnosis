#!/bin/bash

# Seed Mexico City Events Script
# This script adds 15 events across the next month in Mexico City

echo "Starting to seed 15 Mexico City events..."
echo "Events will have dates between May 8 and June 8, 2025"

# Run the seed script
npx tsx db/seed-events-mexico-city.ts

echo "Mexico City events seeding operation complete!"