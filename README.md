# 🤖 AI Chat Application

A powerful, user-friendly AI chat application with both online and offline capabilities. Perfect for personal use with conversation history, voice input, and responsive design.

## ✨ Features

### 🌐 Online Mode
- **Always Available**: Works with internet connection
- **Fast Responses**: Quick AI responses from cloud servers
- **No Setup Required**: Works out of the box
- **Multiple Models**: Access to various AI models

### 🏠 Offline Mode
- **Privacy First**: All processing happens locally
- **No Internet Required**: Works without connection
- **Free Forever**: No API costs or usage limits
- **Customizable**: Use different AI models

### 💬 Smart Features
- **Conversation History**: Automatically save and manage chats
- **Voice Input**: Talk to AI using your microphone
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Easy on the eyes
- **Intuitive Interface**: Simple and clean design

## 🚀 Quick Start (Recommended for Non-Technical Users)

### Step 1: Check Your System
Run the installation checker first:

**Windows:**
```cmd
check-setup.bat
```

**macOS/Linux:**
```bash
./check-setup.sh
```

### Step 2: Automated Installation
Run the automated deployment script:

**Windows:**
```cmd
deploy.bat
```

**macOS/Linux:**
```bash
./deploy.sh
```

### Step 3: Start the Application
After installation completes:

**Windows:**
```cmd
start.bat
```

**macOS/Linux:**
```bash
./start.sh
```

### Step 4: Open Your Browser
Go to: `http://localhost:3000`

That's it! You're ready to chat with AI! 🎉

## 📋 System Requirements

### Required
- **Operating System**: Windows 10/11, macOS 10.14+, or Linux
- **Node.js**: Version 16 or higher
- **Memory**: At least 4GB RAM
- **Storage**: At least 1GB free space

### Optional (for offline mode)
- **Ollama**: For local AI processing
- **More Memory**: 8GB+ RAM recommended
- **More Storage**: Additional space for AI models (2-10GB per model)

## 🔧 Manual Installation

If automated setup doesn't work, follow these steps:

### 1. Install Node.js
Download and install Node.js from [https://nodejs.org/](https://nodejs.org/) (LTS version recommended).

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
```bash
npx prisma db push
```

### 4. Install Ollama (Optional for Offline Mode)
Download and install Ollama from [https://ollama.com/](https://ollama.com/)

Start Ollama:
```bash
ollama serve
```

Download a model:
```bash
ollama pull llama3.2
```

### 5. Start the Application
```bash
npm run dev
```

### 6. Access the Application
Open your browser and go to `http://localhost:3000`

## 🎮 Using the Application

### Basic Chatting
1. **Type your message** in the input box
2. **Press Enter** or click the send button
3. **Wait for the AI response**
4. **Continue chatting** as long as you like

### Voice Input
1. **Click the microphone button** 🎤
2. **Allow microphone permission** when prompted
3. **Speak your message** clearly
4. **Click stop** when finished
5. **Your speech will be converted to text** automatically

### Managing Conversations
- **View History**: Click the menu button (☰) in the top-left
- **New Chat**: Click "New Chat" button or select from sidebar
- **Switch Conversations**: Click any conversation in the sidebar
- **Delete Conversations**: Hover over conversation and click trash icon (🗑️)

### Switching Modes
- **Online Mode**: Uses internet AI (always available)
- **Offline Mode**: Uses local AI (requires Ollama)
- Use the mode selector in the top-right corner

## 🛠️ Troubleshooting

### Common Issues

#### Application won't start
1. Make sure Node.js is installed: `node --version`
2. Check if port 3000 is available
3. Try closing other applications using port 3000
4. Check terminal for error messages

#### "Command not found" errors
1. Make sure you're in the correct directory
2. Check that Node.js is properly installed
3. Try restarting your terminal/command prompt

#### Offline mode doesn't work
1. Make sure Ollama is installed: `ollama --version`
2. Start Ollama service: `ollama serve`
3. Download a model: `ollama pull llama3.2`
4. Check if Ollama is running: `curl http://localhost:11434/api/tags`

#### Voice input doesn't work
1. Make sure you've allowed microphone permission
2. Check if your microphone works in other applications
3. Try using Chrome or Firefox browser
4. Make sure you're using HTTPS (localhost should work fine)

#### Conversations not saving
1. Check database setup: `npx prisma db push`
2. Look for error messages in the terminal
3. Try refreshing the page

### Getting Help
- Check the terminal output for error messages
- Try restarting the application
- Make sure all requirements are installed
- Refer to the detailed setup guide: `SETUP-GUIDE.md`

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main application page
│   │   ├── api/
│   │   │   ├── chat/             # Chat API endpoint
│   │   │   ├── conversations/    # Conversation management
│   │   │   └── ollama/           # Ollama status check
│   │   └── layout.tsx            # App layout
│   ├── components/
│   │   └── ui/                   # UI components
│   ├── lib/
│   │   ├── db.ts                 # Database connection
│   │   └── socket.ts             # Socket.io setup
│   └── hooks/
├── prisma/
│   └── schema.prisma             # Database schema
├── public/                       # Static assets
├── deploy.sh                     # Linux/macOS deployment script
├── deploy.bat                    # Windows deployment script
├── check-setup.sh                # Linux/macOS system checker
├── check-setup.bat               # Windows system checker
├── start.sh                      # Linux/macOS start script
├── start.bat                     # Windows start script
├── stop.sh                       # Linux/macOS stop script
├── stop.bat                      # Windows stop script
└── SETUP-GUIDE.md                # Detailed setup guide
```

## 🔧 Technical Details

### Technologies Used
- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: SQLite with Prisma ORM
- **Online AI**: ZAI Web Dev SDK
- **Offline AI**: Ollama integration
- **Real-time**: Socket.io support
- **Voice**: Web Speech API

### Architecture
- **Client-Server**: Full-stack application with API routes
- **Database**: SQLite for conversation persistence
- **Modular Design**: Separate components for different functionalities
- **Error Handling**: Graceful degradation and user feedback
- **Security**: Input validation and secure API design

## 🤝 Contributing

This project is designed for personal use and learning. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for personal and educational use. Please ensure compliance with the terms of service of any AI services you use.

## 🙏 Acknowledgments

- **Next.js**: React framework for web applications
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Beautiful UI components
- **Prisma**: Next-generation ORM
- **Ollama**: Local AI processing
- **ZAI**: AI SDK for cloud processing

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Run the system checker: `check-setup.bat` (Windows) or `./check-setup.sh` (macOS/Linux)
3. Refer to the detailed setup guide: `SETUP-GUIDE.md`
4. Check the terminal output for error messages

---

**Happy Chatting! 🤖💬**