@echo off
setlocal enabledelayedexpansion

REM ================================================================
REM AI Chat Application - Windows Deployment Script
REM For Non-Technical Users
REM ================================================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║    🤖 AI Chat Application - Windows Deployment              ║
echo ║                                                              ║
echo ║    Deploy your personal AI chatbot with offline support      ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Function to check if command exists
where node >nul 2>nul
set NODE_FOUND=%errorlevel%

where npm >nul 2>nul
set NPM_FOUND=%errorlevel%

where git >nul 2>nul
set GIT_FOUND=%errorlevel%

where ollama >nul 2>nul
set OLLAMA_FOUND=%errorlevel%

REM Check Node.js
echo [i] Checking Node.js...
if %NODE_FOUND% equ 0 (
    for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
    echo [✓] Node.js found: !NODE_VERSION!
) else (
    echo [✗] Node.js is not installed
    echo [i] Please install Node.js from https://nodejs.org/
    echo [i] Download the LTS version (recommended for stability)
    pause
    exit /b 1
)

REM Check npm
echo [i] Checking npm...
if %NPM_FOUND% equ 0 (
    for /f "tokens=*" %%a in ('npm --version') do set NPM_VERSION=%%a
    echo [✓] npm found: !NPM_VERSION!
) else (
    echo [✗] npm is not installed
    pause
    exit /b 1
)

REM Check git
echo [i] Checking Git...
if %GIT_FOUND% equ 0 (
    for /f "tokens=*" %%a in ('git --version') do set GIT_VERSION=%%a
    echo [✓] Git found: !GIT_VERSION!
) else (
    echo [!] Git is not installed ^(optional but recommended^)
)

REM Check Ollama
echo [i] Checking Ollama...
if %OLLAMA_FOUND% equ 0 (
    for /f "tokens=*" %%a in ('ollama --version') do set OLLAMA_VERSION=%%a
    echo [✓] Ollama found: !OLLAMA_VERSION!
    
    REM Check if Ollama is running
    curl -s http://localhost:11434/api/tags >nul 2>&1
    if !errorlevel! equ 0 (
        echo [✓] Ollama service is running
    ) else (
        echo [!] Ollama is installed but not running
        echo [i] To start Ollama: ollama serve
    )
) else (
    echo [!] Ollama is not installed
    echo [i] Ollama is optional but required for offline mode
)

echo.
echo [i] Installing application dependencies...
npm install
if !errorlevel! neq 0 (
    echo [✗] Failed to install dependencies
    pause
    exit /b 1
)
echo [✓] Dependencies installed successfully

echo.
echo [i] Setting up database...
npx prisma db push
if !errorlevel! neq 0 (
    echo [✗] Failed to setup database
    pause
    exit /b 1
)
echo [✓] Database setup completed

echo.
echo [i] Creating startup scripts...

REM Create start script
echo @echo off > start.bat
echo echo 🚀 Starting AI Chat Application... >> start.bat
echo. >> start.bat
echo REM Check if Ollama is running and start it if needed >> start.bat
echo curl -s http://localhost:11434/api/tags >nul 2^>^&1 >> start.bat
echo if !errorlevel! neq 0 ( >> start.bat
echo     echo 🔧 Starting Ollama service... >> start.bat
echo     start /b ollama serve >> start.bat
echo     timeout /t 5 /nobreak >nul >> start.bat
echo ) >> start.bat
echo. >> start.bat
echo REM Start the application >> start.bat
echo echo 🌐 Starting web application... >> start.bat
echo npm run dev >> start.bat

REM Create stop script
echo @echo off > stop.bat
echo echo 🛑 Stopping AI Chat Application... >> stop.bat
echo. >> stop.bat
echo REM Find and kill the process running on port 3000 >> stop.bat
echo for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do ( >> stop.bat
echo     taskkill /f /pid %%a 2^>nul >> stop.bat
echo ) >> stop.bat
echo. >> stop.bat
echo REM Find and kill Ollama processes >> stop.bat
echo taskkill /f /im ollama.exe 2^>nul >> stop.bat
echo. >> stop.bat
echo echo ✅ All services stopped >> stop.bat

echo [✓] Startup scripts created
echo [i] Use 'start.bat' to start the application
echo [i] Use 'stop.bat' to stop the application

echo.
echo [i] Creating desktop shortcut...
set SCRIPT_PATH=%~dp0
set SHORTCUT_NAME=AI Chat Application

REM Create VBScript to create shortcut
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = "%USERPROFILE%\Desktop\%SHORTCUT_NAME%.lnk" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%SCRIPT_PATH%start.bat" >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "%SCRIPT_PATH%" >> CreateShortcut.vbs
echo oLink.Description = "Your personal AI chatbot with offline support" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs

cscript CreateShortcut.vbs
del CreateShortcut.vbs

echo [✓] Desktop shortcut created on your Desktop

echo.
echo [i] Running final checks...

REM Check if all required files exist
set MISSING_FILES=0
if not exist "package.json" (
    echo [✗] Required file missing: package.json
    set MISSING_FILES=1
)
if not exist "src\app\page.tsx" (
    echo [✗] Required file missing: src\app\page.tsx
    set MISSING_FILES=1
)
if not exist "prisma\schema.prisma" (
    echo [✗] Required file missing: prisma\schema.prisma
    set MISSING_FILES=1
)

if !MISSING_FILES! equ 0 (
    echo [✓] All required files are present
) else (
    echo [✗] Some required files are missing
    pause
    exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║                    🎉 DEPLOYMENT COMPLETE!                   ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo [✓] Your AI Chat Application has been successfully deployed!
echo.
echo 🚀 TO START THE APPLICATION:
echo    start.bat
echo.
echo 🛑 TO STOP THE APPLICATION:
echo    stop.bat
echo.
echo 🌐 ACCESS THE APPLICATION:
echo    Open your web browser and go to: http://localhost:3000
echo.
echo 📱 FEATURES:
echo    • Online AI chat with ZAI SDK
echo    • Offline AI chat with Ollama ^(if installed^)
echo    • Conversation history and management
echo    • Voice input support
echo    • Responsive design for desktop and mobile
echo.
echo 🔧 TROUBLESHOOTING:
echo    • If the application doesn't start, check if port 3000 is available
echo    • For offline mode, make sure Ollama is running: ollama serve
echo    • Check the command prompt for any error messages
echo.
echo 📞 SUPPORT:
echo    If you encounter any issues, please check the SETUP-GUIDE.md file
echo    or review the installation steps in this script.
echo.

pause