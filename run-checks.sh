#!/bin/bash
LOG_FILE="health-check.log"
echo "--------------------------------" >> $LOG_FILE
echo "Starting health check at $(date)" >> $LOG_FILE

# Start the application in the background
sh start-dacras.sh &
START_PID=$!

# Wait for services to start
echo "Waiting for services to initialize..."
sleep 15

# Check backend health
echo "Checking backend health..."
if curl -s http://localhost:3002/health | grep -q '"status":"ok"'; then
  echo "✅ Backend health check PASSED at $(date)" >> $LOG_FILE
else
  echo "❌ Backend health check FAILED at $(date)" >> $LOG_FILE
fi

# Check frontend health by checking if the port is open
echo "Checking frontend..."
if lsof -i :3001 > /dev/null 2>&1; then
    echo "✅ Frontend is running on port 3001 at $(date)" >> $LOG_FILE
else
    echo "❌ Frontend is NOT running on port 3001 at $(date)" >> $LOG_FILE
fi

# Stop the application
echo "Stopping application..."
sh stop-dacras.sh

echo "Health check finished at $(date)" >> $LOG_FILE
