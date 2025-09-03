@echo off
echo 🛑 Stopping AI Chat Application...

REM Find and kill the process running on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a 2>nul
)

REM Find and kill Ollama processes
taskkill /f /im ollama.exe 2>nul

echo ✅ All services stopped