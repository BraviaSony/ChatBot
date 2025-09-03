#!/bin/bash

echo "🚀 Starting AI Chat Application..."

# Check if Ollama is running and start it if needed
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "🔧 Starting Ollama service..."
    ollama serve &
    sleep 5
fi

# Start the application
echo "🌐 Starting web application..."
npm run dev