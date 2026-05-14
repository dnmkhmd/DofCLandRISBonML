#!/bin/bash

# Exit on error
set -e

echo "--- Installing Backend Dependencies ---"
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is not installed."
    exit 1
fi

cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment and installing requirements..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
cd ..

echo "--- Installing Frontend Dependencies ---"
if ! command -v node &> /dev/null; then
    echo "Error: node is not installed."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed."
    exit 1
fi

cd frontend
echo "Installing npm packages..."
npm install
cd ..

echo "--- Installation Complete ---"
echo "You can now run the application using ./start.sh"
