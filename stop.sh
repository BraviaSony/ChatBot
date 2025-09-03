#!/bin/bash

echo "🛑 Stopping AI Chat Application..."

# Find and kill the process running on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Find and kill Ollama processes
pkill -f "ollama serve" 2>/dev/null || true

echo "✅ All services stopped"