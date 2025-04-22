#!/bin/bash

# Seed Mexico City Profiles Script
# This script adds 20 realistic Mexico City user profiles to the database

echo "Starting to seed 20 Mexico City user profiles..."
echo "This will add realistic profile data with images..."

# Run the seed script
tsx db/seed-mexico-city.js

echo "Mexico City seeding operation complete!"