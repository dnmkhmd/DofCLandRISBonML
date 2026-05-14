#!/bin/bash

# Function to stop all background processes
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID
    exit
}

# Trap Ctrl+C (SIGINT) and call cleanup
trap cleanup SIGINT

echo "--- Starting Application ---"

# Start Backend
echo "Starting Backend..."
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
deactivate
cd ..

# Start Frontend
echo "Starting Frontend..."
cd frontend
npm run dev -- --port 3000 &
FRONTEND_PID=$!
cd ..

echo "--- Application is running ---"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop."

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID
