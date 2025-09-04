#!/bin/bash

# Stop Dacras Backend and Frontend

echo "🛑 Stopping Dacras Application..."
echo "================================"

# Navigate to project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Stop backend
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    echo "Stopping backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
    rm .backend.pid
else
    echo "No backend PID file found, checking port 3002..."
    lsof -ti :3002 | xargs kill -9 2>/dev/null
fi

# Stop frontend
if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo "Stopping frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null
    rm .frontend.pid
else
    echo "No frontend PID file found, checking port 3001..."
    lsof -ti :3001 | xargs kill -9 2>/dev/null
fi

# Additional cleanup
echo "Cleaning up any remaining processes..."
pkill -f "npm.*start" 2>/dev/null
pkill -f "next dev" 2>/dev/null

echo ""
echo "✅ Dacras application stopped!"