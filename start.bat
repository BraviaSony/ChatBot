@echo off
echo 🚀 Starting AI Chat Application...

REM Check if Ollama is running and start it if needed
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔧 Starting Ollama service...
    start /b ollama serve
    timeout /t 5 /nobreak >nul
)

REM Start the application
echo 🌐 Starting web application...
npm run dev