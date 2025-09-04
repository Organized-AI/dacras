#!/bin/bash

# Start Dacras Backend and Frontend

echo "🚀 Starting Dacras Application..."
echo "================================"

# Navigate to project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to check if a port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
}

# Kill existing processes on required ports
echo "🧹 Cleaning up existing processes..."
if check_port 3002; then
    echo "Port 3002 is in use, killing process..."
    lsof -ti :3002 | xargs kill -9 2>/dev/null
fi
if check_port 3001; then
    echo "Port 3001 is in use, killing process..."
    lsof -ti :3001 | xargs kill -9 2>/dev/null
fi

# Start backend server
echo ""
echo "📡 Starting backend server on port 3002..."
cd backend
npm start &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a bit for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 3

# Check if backend is running
if ! check_port 3002; then
    echo "❌ Backend failed to start on port 3002"
    exit 1
fi

# Test backend health
echo "🏥 Testing backend health..."
curl -s http://localhost:3002/health | jq . 2>/dev/null || echo "Backend health check response received"

# Start frontend server
echo ""
echo "🎨 Starting frontend server on port 3001..."
cd ../frontend
npm run dev -- --port 3001 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
echo "⏳ Waiting for frontend to initialize..."
sleep 5

# Check if both are running
echo ""
echo "✅ Application Status:"
echo "====================="
if check_port 3002; then
    echo "✓ Backend running at: http://localhost:3002"
    echo "  - API Info: http://localhost:3002/api/info"
    echo "  - Health: http://localhost:3002/health"
else
    echo "✗ Backend is not running"
fi

if check_port 3001; then
    echo "✓ Frontend running at: http://localhost:3001"
else
    echo "✗ Frontend is not running"
fi

# Save PIDs for cleanup
echo ""
echo "📝 Saving process information..."
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

echo ""
echo "🎉 Dacras is ready!"
echo "===================="
echo "Frontend: http://localhost:3001"
echo "Backend API: http://localhost:3002/api/info"
echo ""
echo "To stop the application, run: ./stop-dacras.sh"
echo "Or press Ctrl+C to stop both servers"

# Keep script running
wait