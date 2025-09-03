#!/bin/bash

# ================================================================
# AI Chat Application - Interactive Installation Wizard
# For Non-Technical Users
# ================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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

print_step() {
    echo -e "${PURPLE}[Step $1]${NC} $2"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get user confirmation
confirm() {
    while true; do
        read -p "$1 (y/n): " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Function to show progress
show_progress() {
    local pid=$!
    local delay=0.1
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Welcome screen
echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║          🧙‍♂️ AI Chat Application - Installation Wizard          ║
║                                                              ║
║           I'll guide you through the installation             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo "Welcome! I'll help you install your personal AI chat application."
echo "This wizard will guide you through each step of the process."
echo ""

if confirm "Would you like to continue with the installation?"; then
    print_info "Great! Let's get started..."
    echo ""
else
    print_info "No problem! You can run this wizard again anytime."
    exit 0
fi

# Step 1: System Check
print_step "1" "Checking your system requirements"
echo ""

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status "Node.js found: $NODE_VERSION"
    
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 16 ]; then
        print_status "Node.js version is good"
    else
        print_error "Node.js version is too old (need 16+)"
        print_info "Please upgrade Node.js from https://nodejs.org/"
        exit 1
    fi
else
    print_error "Node.js is not installed"
    print_info "Please install Node.js from https://nodejs.org/ (LTS version)"
    print_info "After installation, run this wizard again."
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

# Check available disk space
print_info "Checking disk space..."
if command_exists df; then
    AVAILABLE_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
    if [ "$AVAILABLE_SPACE" -ge 1 ]; then
        print_status "Disk space: ${AVAILABLE_SPACE}GB available"
    else
        print_warning "Low disk space: ${AVAILABLE_SPACE}GB available"
    fi
fi

echo ""
print_status "System check completed!"
echo ""

# Step 2: Install Dependencies
print_step "2" "Installing application dependencies"
echo ""

print_info "This may take a few minutes..."
echo ""

if npm install; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

echo ""

# Step 3: Database Setup
print_step "3" "Setting up the database"
echo ""

print_info "Configuring database for conversation storage..."
echo ""

if npx prisma db push; then
    print_status "Database setup completed"
else
    print_error "Failed to setup database"
    exit 1
fi

echo ""

# Step 4: Ollama Installation (Optional)
print_step "4" "Setting up offline AI capabilities (optional)"
echo ""

if command_exists ollama; then
    print_status "Ollama is already installed"
    OLLAMA_VERSION=$(ollama --version)
    print_info "Version: $OLLAMA_VERSION"
    
    # Check if Ollama is running
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        print_status "Ollama service is running"
        
        # Check available models
        MODELS=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*' | grep -o '[^"]*$' | head -3)
        if [ -n "$MODELS" ]; then
            print_status "Available models: $MODELS"
        else
            print_warning "No AI models found"
        fi
    else
        print_warning "Ollama is installed but not running"
        print_info "You can start it later with: ollama serve"
    fi
else
    print_warning "Ollama is not installed"
    echo ""
    print_info "Ollama enables offline AI chat (no internet required)"
    print_info "It's optional but recommended for privacy and offline use"
    echo ""
    
    if confirm "Would you like to install Ollama?"; then
        print_info "Installing Ollama..."
        echo ""
        
        if curl -fsSL https://ollama.com/install.sh | sh; then
            print_status "Ollama installed successfully"
            print_info "You can start it with: ollama serve"
            print_info "And download models with: ollama pull llama3.2"
        else
            print_error "Failed to install Ollama"
            print_info "You can install it manually later from https://ollama.com/"
        fi
    else
        print_info "No problem! You can still use online AI chat"
        print_info "You can install Ollama later if needed"
    fi
fi

echo ""

# Step 5: Create Startup Scripts
print_step "5" "Creating startup scripts"
echo ""

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
echo ""

# Step 6: Create Desktop Shortcut
print_step "6" "Creating desktop shortcut"
echo ""

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

# Step 7: Final Checks
print_step "7" "Running final checks"
echo ""

# Check if all required files exist
required_files=("package.json" "src/app/page.tsx" "prisma/schema.prisma")
all_files_exist=true

for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        print_status "Required file exists: $file"
    else
        print_error "Required file missing: $file"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = true ]; then
    print_status "All required files are present"
else
    print_error "Some required files are missing"
    exit 1
fi

echo ""

# Step 8: Installation Complete
print_step "8" "Installation complete!"
echo ""

echo -e "${GREEN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    🎉 INSTALLATION COMPLETE!                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
print_status "Your AI Chat Application has been successfully installed!"
echo ""

echo -e "${CYAN}🚀 HOW TO START THE APPLICATION:${NC}"
echo "   Method 1: Use the startup script"
echo "   ./start.sh"
echo ""
echo "   Method 2: Use the desktop shortcut (if created)"
echo "   Double-click the AI Chat Application icon on your desktop"
echo ""

echo -e "${CYAN}🛑 HOW TO STOP THE APPLICATION:${NC}"
echo "   ./stop.sh"
echo ""

echo -e "${CYAN}🌐 HOW TO ACCESS THE APPLICATION:${NC}"
echo "   Open your web browser and go to: http://localhost:3000"
echo ""

echo -e "${CYAN}📱 WHAT YOU CAN DO:${NC}"
echo "   • Chat with AI online (always available)"
echo "   • Chat with AI offline (if Ollama is installed)"
echo "   • Save and manage your conversations"
echo "   • Use voice input to talk to AI"
echo "   • Access from any device on your network"
echo ""

echo -e "${CYAN}🔧 GETTING HELP:${NC}"
echo "   • If you have issues, check the terminal output"
echo "   • Run the system checker: ./check-setup.sh"
echo "   • Read the setup guide: SETUP-GUIDE.md"
echo "   • Make sure port 3000 is available"
echo ""

echo -e "${YELLOW}💡 TIPS FOR FIRST USE:${NC}"
echo "   • Start with online mode to test the application"
echo "   • Try voice input - it's really fun!"
echo "   • Your conversations are automatically saved"
echo "   • Use the sidebar to manage your chat history"
echo ""

if confirm "Would you like to start the application now?"; then
    print_info "Starting the application..."
    echo ""
    ./start.sh
else
    print_info "No problem! You can start it anytime with: ./start.sh"
    echo ""
    print_info "Thank you for installing the AI Chat Application!"
    print_info "Enjoy chatting with AI! 🤖💬"
fi

echo ""
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
echo ""