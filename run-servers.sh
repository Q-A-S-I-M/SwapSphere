#!/bin/bash

echo "Starting SwapSphere Backend and Chat Server..."
echo ""

# Start SwapSphere backend on port 8080
echo "[1/2] Starting SwapSphere Backend (port 8080)..."
cd SwapSphere
./mvnw spring-boot:run &
SWAPSPHERE_PID=$!
cd ..

# Wait a bit before starting the second server
sleep 3

# Start Chat server on port 8081
echo "[2/2] Starting Chat Server (port 8081)..."
cd Chat-App-Spring-Boot
if [ -f "./mvnw" ]; then
    ./mvnw spring-boot:run &
else
    mvn spring-boot:run &
fi
CHAT_PID=$!
cd ..

echo ""
echo "Both servers are starting..."
echo "- SwapSphere Backend: http://localhost:8080 (PID: $SWAPSPHERE_PID)"
echo "- Chat Server: http://localhost:8081 (PID: $CHAT_PID)"
echo ""
echo "Press Ctrl+C to stop both servers..."

# Wait for user interrupt
trap "echo 'Stopping servers...'; kill $SWAPSPHERE_PID $CHAT_PID 2>/dev/null; exit" INT
wait

