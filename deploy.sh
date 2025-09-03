#!/bin/bash

# ================================================================
# AI Chat Application - Automated Deployment Script
# For Non-Technical Users
# ================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logo
echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🤖 AI Chat Application - Automated Deployment             ║
║                                                              ║
║    Deploy your personal AI chatbot with offline support      ║
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

# Function to check system requirements
check_requirements() {
    print_info "Checking system requirements..."
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_status "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js is not installed"
        print_info "Please install Node.js from https://nodejs.org/"
        print_info "Download the LTS version (recommended for stability)"
        exit 1
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_status "npm found: $NPM_VERSION"
    else
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check git
    if command_exists git; then
        GIT_VERSION=$(git --version)
        print_status "Git found: $GIT_VERSION"
    else
        print_warning "Git is not installed (optional but recommended)"
    fi
    
    echo ""
}

# Function to install Ollama (optional)
install_ollama() {
    print_info "Checking Ollama installation..."
    
    if command_exists ollama; then
        OLLAMA_VERSION=$(ollama --version)
        print_status "Ollama found: $OLLAMA_VERSION"
        
        # Check if Ollama is running
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            print_status "Ollama service is running"
        else
            print_warning "Ollama is installed but not running"
            print_info "To start Ollama: ollama serve"
        fi
    else
        print_warning "Ollama is not installed"
        print_info "Ollama is optional but required for offline mode"
        
        read -p "Would you like to install Ollama for offline AI? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Installing Ollama..."
            
            # Try to install Ollama
            if curl -fsSL https://ollama.com/install.sh | sh; then
                print_status "Ollama installed successfully"
                print_info "To start Ollama: ollama serve"
                print_info "To pull a model: ollama pull llama3.2"
            else
                print_error "Failed to install Ollama"
                print_info "You can install it manually later: https://ollama.com/"
            fi
        else
            print_info "Skipping Ollama installation (online mode will still work)"
        fi
    fi
    
    echo ""
}

# Function to install dependencies
install_dependencies() {
    print_info "Installing application dependencies..."
    
    if npm install; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
    
    echo ""
}

# Function to setup database
setup_database() {
    print_info "Setting up database..."
    
    # Run database migration
    if npx prisma db push; then
        print_status "Database setup completed"
    else
        print_error "Failed to setup database"
        exit 1
    fi
    
    echo ""
}

# Function to create startup scripts
create_startup_scripts() {
    print_info "Creating startup scripts..."
    
    # Create start script
    cat > start.sh << 'EOF'
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
EOF

    # Create stop script
    cat > stop.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping AI Chat Application..."

# Find and kill the process running on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Find and kill Ollama processes
pkill -f "ollama serve" 2>/dev/null || true

echo "✅ All services stopped"
EOF

    # Make scripts executable
    chmod +x start.sh
    chmod +x stop.sh
    
    print_status "Startup scripts created"
    print_info "Use './start.sh' to start the application"
    print_info "Use './stop.sh' to stop the application"
    
    echo ""
}

# Function to create desktop shortcut (Linux/macOS)
create_desktop_shortcut() {
    print_info "Creating desktop shortcut..."
    
    # Detect operating system
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        DESKTOP_FILE="$HOME/Desktop/AI-Chat-App.desktop"
        cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=AI Chat Application
Comment=Your personal AI chatbot with offline support
Exec=$(pwd)/start.sh
Icon=$(pwd)/public/favicon.ico
Terminal=true
Categories=Utility;Application;
EOF
        chmod +x "$DESKTOP_FILE"
        print_status "Desktop shortcut created: $DESKTOP_FILE"
        
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        print_info "On macOS, you can create an alias or use Spotlight to find the start.sh script"
        print_info "Location: $(pwd)/start.sh"
    else
        print_warning "Desktop shortcuts not supported on this OS"
    fi
    
    echo ""
}

# Function to run final checks
run_final_checks() {
    print_info "Running final checks..."
    
    # Check if all required files exist
    required_files=("package.json" "src/app/page.tsx" "prisma/schema.prisma")
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            print_status "Required file exists: $file"
        else
            print_error "Required file missing: $file"
            exit 1
        fi
    done
    
    # Test if the application can start
    print_info "Testing application startup..."
    timeout 10s npm run dev 2>/dev/null || true
    if [[ $? -eq 124 ]]; then
        print_status "Application startup test passed"
    else
        print_warning "Application startup test failed (this might be normal)"
    fi
    
    echo ""
}

# Function to display success message
display_success() {
    echo -e "${GREEN}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    🎉 DEPLOYMENT COMPLETE!                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    echo ""
    print_status "Your AI Chat Application has been successfully deployed!"
    echo ""
    print_info "🚀 TO START THE APPLICATION:"
    echo "   ./start.sh"
    echo ""
    print_info "🛑 TO STOP THE APPLICATION:"
    echo "   ./stop.sh"
    echo ""
    print_info "🌐 ACCESS THE APPLICATION:"
    echo "   Open your web browser and go to: http://localhost:3000"
    echo ""
    print_info "📱 FEATURES:"
    echo "   • Online AI chat with ZAI SDK"
    echo "   • Offline AI chat with Ollama (if installed)"
    echo "   • Conversation history and management"
    echo "   • Voice input support"
    echo "   • Responsive design for desktop and mobile"
    echo ""
    print_info "🔧 TROUBLESHOOTING:"
    echo "   • If the application doesn't start, check if port 3000 is available"
    echo "   • For offline mode, make sure Ollama is running: ollama serve"
    echo "   • Check the logs for any error messages"
    echo ""
    print_info "📞 SUPPORT:"
    echo "   If you encounter any issues, please check the README.md file"
    echo "   or review the installation steps in this script."
    echo ""
}

# Main deployment process
main() {
    echo ""
    print_info "Starting deployment process..."
    echo ""
    
    # Step 1: Check requirements
    check_requirements
    
    # Step 2: Install Ollama (optional)
    install_ollama
    
    # Step 3: Install dependencies
    install_dependencies
    
    # Step 4: Setup database
    setup_database
    
    # Step 5: Create startup scripts
    create_startup_scripts
    
    # Step 6: Create desktop shortcut
    create_desktop_shortcut
    
    # Step 7: Run final checks
    run_final_checks
    
    # Step 8: Display success message
    display_success
}

# Run main function
main "$@"