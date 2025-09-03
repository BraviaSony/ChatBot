@echo off
setlocal enabledelayedexpansion

REM ================================================================
REM AI Chat Application - Windows Installation Checker
REM For Non-Technical Users
REM ================================================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║    🔍 AI Chat Application - Windows Installation Checker     ║
echo ║                                                              ║
echo ║    Check if your system is ready for deployment              ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Initialize counters
set /a ISSUES=0

REM Function to check Node.js
echo [i] Checking Node.js...
where node >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
    echo [✓] Node.js !NODE_VERSION! ^(✓ Good^)
    
    REM Check Node.js version
    for /f "tokens=1,2 delims=." %%a in ("!NODE_VERSION:v=!") do (
        set NODE_MAJOR=%%a
    )
    
    if !NODE_MAJOR! geq 16 (
        echo [✓] Node.js version is sufficient ^(✓ Good^)
    ) else (
        echo [✗] Node.js version is too old ^(need 16+^)
        echo [i] Please upgrade Node.js from https://nodejs.org/
        set /a ISSUES+=1
    )
) else (
    echo [✗] Node.js not found ^(✗ Required^)
    echo [i] Please install Node.js from https://nodejs.org/
    set /a ISSUES+=1
)

REM Function to check npm
echo.
echo [i] Checking npm...
where npm >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%a in ('npm --version') do set NPM_VERSION=%%a
    echo [✓] npm !NPM_VERSION! ^(✓ Good^)
) else (
    echo [✗] npm not found ^(✗ Required^)
    set /a ISSUES+=1
)

REM Function to check git
echo.
echo [i] Checking Git...
where git >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%a in ('git --version') do set GIT_VERSION=%%a
    echo [✓] Git !GIT_VERSION! ^(✓ Good^)
) else (
    echo [!] Git not found ^(⚠ Optional but recommended^)
)

REM Function to check Ollama
echo.
echo [i] Checking Ollama...
where ollama >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%a in ('ollama --version') do set OLLAMA_VERSION=%%a
    echo [✓] Ollama !OLLAMA_VERSION! ^(✓ Installed^)
    
    REM Check if Ollama is running
    curl -s http://localhost:11434/api/tags >nul 2>&1
    if !errorlevel! equ 0 (
        echo [✓] Ollama service is running ^(✓ Good^)
        
        REM Check available models
        echo [i] Checking available models...
        curl -s http://localhost:11434/api/tags > models.json 2>nul
        if exist models.json (
            findstr "models" models.json >nul
            if !errorlevel! equ 0 (
                echo [✓] Ollama models are available
            ) else (
                echo [!] No models found. Run: ollama pull llama3.2
            )
            del models.json
        )
    ) else (
        echo [!] Ollama installed but not running
        echo [i] Start with: ollama serve
    )
) else (
    echo [!] Ollama not found ^(⚠ Optional for offline mode^)
    echo [i] Install from: https://ollama.com/
)

REM Function to check port availability
echo.
echo [i] Checking port availability...

REM Check port 3000 (application)
netstat -an | findstr :3000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [!] Port 3000 is in use ^(⚠ Might conflict^)
    echo [i] Make sure no other application is using port 3000
) else (
    echo [✓] Port 3000 is available ^(✓ Good^)
)

REM Check port 11434 (Ollama)
netstat -an | findstr :11434 | findstr LISTENING >nul
if %errorlevel! equ 0 (
    echo [✓] Port 11434 is in use ^(✓ Ollama might be running^)
) else (
    echo [i] Port 11434 is available ^(for Ollama^)
)

REM Function to check disk space
echo.
echo [i] Checking disk space...
for /f "tokens=2 delims=:" %%a in ('fsutil volume diskfree C: ^| find "free bytes"') do (
    set FREE_BYTES=%%a
)
set /a FREE_GB=!FREE_BYTES:~0,-9!/1024
if !FREE_GB! geq 1 (
    echo [✓] Disk space: !FREE_GB!GB available ^(✓ Good^)
) else (
    echo [!] Low disk space: !FREE_GB!GB available ^(⚠ Might be tight^)
)

REM Function to check memory
echo.
echo [i] Checking memory...
for /f "skip=1 tokens=4" %%a in ('wmic computersystem get TotalPhysicalMemory') do (
    set TOTAL_MEM=%%a
    goto :break
)
:break
set /a TOTAL_MEM_GB=!TOTAL_MEM!/1024/1024/1024
echo [i] Total memory: !TOTAL_MEM_GB!GB

if !TOTAL_MEM_GB! geq 4 (
    echo [✓] Memory is sufficient ^(✓ Good^)
) else (
    echo [!] Low memory ^(⚠ 4GB+ recommended^)
)

REM Function to check application files
echo.
echo [i] Checking application files...
set MISSING_FILES=0

if exist "package.json" (
    echo [✓] Found: package.json
) else (
    echo [✗] Missing: package.json
    set /a MISSING_FILES+=1
)

if exist "src\app\page.tsx" (
    echo [✓] Found: src\app\page.tsx
) else (
    echo [✗] Missing: src\app\page.tsx
    set /a MISSING_FILES+=1
)

if exist "prisma\schema.prisma" (
    echo [✓] Found: prisma\schema.prisma
) else (
    echo [✗] Missing: prisma\schema.prisma
    set /a MISSING_FILES+=1
)

if !MISSING_FILES! equ 0 (
    echo [✓] All required files are present ^(✓ Good^)
) else (
    echo [✗] Missing !MISSING_FILES! required files
    set /a ISSUES+=!MISSING_FILES!
)

REM Generate report
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║                    INSTALLATION CHECK REPORT                  ║
echo ║                                                              ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

if !ISSUES! equ 0 (
    echo 🎉 Your system is ready for installation!
    echo.
    echo Recommended next steps:
    echo 1. Run the automated setup: deploy.bat
    echo 2. Start the application: start.bat
    echo 3. Open your browser: http://localhost:3000
    echo.
    echo You're all set! 🚀
) else (
    echo ⚠️  Found !ISSUES! issue^(s^) that need attention
    echo.
    echo Please fix the issues marked with [✗] above
    echo.
    echo Common fixes:
    echo • Install Node.js: https://nodejs.org/
    echo • Make sure all application files are present
    echo • Restart your command prompt after installing Node.js
    echo.
    echo After fixing the issues, run this checker again.
)

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║                    END OF CHECK REPORT                        ║
echo ║                                                              ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

pause