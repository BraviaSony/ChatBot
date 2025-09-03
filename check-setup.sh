#!/bin/bash

# ================================================================
# AI Chat Application - Installation Checker
# For Non-Technical Users
# ================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🔍 AI Chat Application - Installation Checker             ║
║                                                              ║
║    Check if your system is ready for deployment              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_nodejs() {
    print_info "Checking Node.js..."
    
    if command_exists node; then
        NODE_VERSION=$(node --version)
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        
        if [ "$NODE_MAJOR" -ge 16 ]; then
            print_status "Node.js $NODE_VERSION (✓ Good)"
        else
            print_error "Node.js $NODE_VERSION (✗ Too old, need 16+)"
            print_info "Please upgrade Node.js from https://nodejs.org/"
            return 1
        fi
    else
        print_error "Node.js not found (✗ Required)"
        print_info "Please install Node.js from https://nodejs.org/"
        return 1
    fi
    
    return 0
}

# Function to check npm
check_npm() {
    print_info "Checking npm..."
    
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_status "npm $NPM_VERSION (✓ Good)"
        return 0
    else
        print_error "npm not found (✗ Required)"
        return 1
    fi
}

# Function to check git
check_git() {
    print_info "Checking Git..."
    
    if command_exists git; then
        GIT_VERSION=$(git --version)
        print_status "Git $GIT_VERSION (✓ Good)"
        return 0
    else
        print_warning "Git not found (⚠ Optional but recommended)"
        return 0
    fi
}

# Function to check Ollama
check_ollama() {
    print_info "Checking Ollama..."
    
    if command_exists ollama; then
        OLLAMA_VERSION=$(ollama --version)
        print_status "Ollama $OLLAMA_VERSION (✓ Installed)"
        
        # Check if Ollama is running
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            print_status "Ollama service is running (✓ Good)"
            
            # Check available models
            MODELS=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*' | grep -o '[^"]*$' | head -5)
            if [ -n "$MODELS" ]; then
                print_status "Available models: $MODELS"
            else
                print_warning "No models found. Run: ollama pull llama3.2"
            fi
        else
            print_warning "Ollama installed but not running"
            print_info "Start with: ollama serve"
        fi
    else
        print_warning "Ollama not found (⚠ Optional for offline mode)"
        print_info "Install from: https://ollama.com/"
    fi
    
    return 0
}

# Function to check port availability
check_ports() {
    print_info "Checking port availability..."
    
    # Check port 3000 (application)
    if netstat -tuln 2>/dev/null | grep -q ":3000 "; then
        print_warning "Port 3000 is in use (⚠ Might conflict)"
        print_info "Make sure no other application is using port 3000"
    else
        print_status "Port 3000 is available (✓ Good)"
    fi
    
    # Check port 11434 (Ollama)
    if netstat -tuln 2>/dev/null | grep -q ":11434 "; then
        print_status "Port 11434 is in use (✓ Ollama might be running)"
    else
        print_info "Port 11434 is available (for Ollama)"
    fi
}

# Function to check disk space
check_disk_space() {
    print_info "Checking disk space..."
    
    if command_exists df; then
        # Get available space in GB
        AVAILABLE_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
        
        if [ "$AVAILABLE_SPACE" -ge 1 ]; then
            print_status "Disk space: ${AVAILABLE_SPACE}GB available (✓ Good)"
        else
            print_warning "Low disk space: ${AVAILABLE_SPACE}GB available (⚠ Might be tight)"
        fi
    else
        print_warning "Cannot check disk space"
    fi
}

# Function to check memory
check_memory() {
    print_info "Checking memory..."
    
    if command_exists free; then
        # Linux memory check
        TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.1f", $2/1024}')
        AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.1f", $7/1024}')
        
        print_info "Total memory: ${TOTAL_MEM}GB"
        print_info "Available memory: ${AVAILABLE_MEM}GB"
        
        if (( $(echo "$TOTAL_MEM >= 4" | bc -l) )); then
            print_status "Memory is sufficient (✓ Good)"
        else
            print_warning "Low memory (⚠ 4GB+ recommended)"
        fi
        
    elif command_exists vm_stat; then
        # macOS memory check
        TOTAL_MEM=$(sysctl -n hw.memsize | awk '{printf "%.1f", $1/1024/1024/1024}')
        print_info "Total memory: ${TOTAL_MEM}GB"
        
        if (( $(echo "$TOTAL_MEM >= 4" | bc -l) )); then
            print_status "Memory is sufficient (✓ Good)"
        else
            print_warning "Low memory (⚠ 4GB+ recommended)"
        fi
    else
        print_warning "Cannot check memory"
    fi
}

# Function to check application files
check_application_files() {
    print_info "Checking application files..."
    
    REQUIRED_FILES=("package.json" "src/app/page.tsx" "prisma/schema.prisma")
    MISSING_FILES=()
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$file" ]; then
            print_status "Found: $file"
        else
            print_error "Missing: $file"
            MISSING_FILES+=("$file")
        fi
    done
    
    if [ ${#MISSING_FILES[@]} -eq 0 ]; then
        print_status "All required files are present (✓ Good)"
        return 0
    else
        print_error "Missing ${#MISSING_FILES[@]} required files"
        return 1
    fi
}

# Function to generate report
generate_report() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}                    INSTALLATION CHECK REPORT                     ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Count issues
    ISSUES=0
    
    # Check Node.js
    if ! command_exists node || [ "$(node --version | cut -d'.' -f1 | sed 's/v//')" -lt 16 ]; then
        ((ISSUES++))
    fi
    
    # Check npm
    if ! command_exists npm; then
        ((ISSUES++))
    fi
    
    # Check application files
    REQUIRED_FILES=("package.json" "src/app/page.tsx" "prisma/schema.prisma")
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            ((ISSUES++))
            break
        fi
    done
    
    # Generate recommendations
    if [ $ISSUES -eq 0 ]; then
        echo -e "${GREEN}🎉 Your system is ready for installation!${NC}"
        echo ""
        echo -e "${GREEN}Recommended next steps:${NC}"
        echo "1. Run the automated setup: ./deploy.sh"
        echo "2. Start the application: ./start.sh"
        echo "3. Open your browser: http://localhost:3000"
        echo ""
        echo -e "${GREEN}You're all set! 🚀${NC}"
    else
        echo -e "${YELLOW}⚠️  Found $ISSUES issue(s) that need attention${NC}"
        echo ""
        echo -e "${YELLOW}Please fix the issues marked with [✗] above${NC}"
        echo ""
        echo -e "${YELLOW}Common fixes:${NC}"
        echo "• Install Node.js: https://nodejs.org/"
        echo "• Make sure all application files are present"
        echo "• Restart your terminal after installing Node.js"
        echo ""
        echo -e "${BLUE}After fixing the issues, run this checker again.${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
}

# Main check process
main() {
    echo ""
    
    # Run all checks
    check_nodejs
    check_npm
    check_git
    check_ollama
    check_ports
    check_disk_space
    check_memory
    check_application_files
    
    # Generate report
    generate_report
}

# Run main function
main "$@"