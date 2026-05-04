#!/bin/bash
set -e

# Run this script to execute migrations and seed the database on Railway
echo "Running Alembic migrations on Railway..."
railway run --service api python -m alembic upgrade head

echo "Running seed script on Railway..."
railway run --service api python seed.py

echo "Done!"
