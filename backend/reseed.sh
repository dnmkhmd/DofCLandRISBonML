#!/bin/bash

# Reseed the database with new prices and local image paths
# Must be run from the backend directory or the project root

echo "=== Starting Reseed Process ==="

# 1. Kill any running backend processes (optional but recommended for SQLite)
# pkill -f "python main.py" || true

# 2. Run the seeding script
echo "Running seed_cars.py..."
cd backend
source venv/bin/activate
python3 seed_cars.py
deactivate

echo "=== Reseed Process Completed ==="
