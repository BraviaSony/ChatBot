# 🤖 AI Chat Application - Setup Guide for Non-Technical Users

## 📋 Table of Contents
- [Overview](#overview)
- [System Requirements](#system-requirements)
- [Quick Start (Automated)](#quick-start-automated)
- [Manual Installation](#manual-installation)
- [Using the Application](#using-the-application)
- [Troubleshooting](#troubleshooting)
- [Features Guide](#features-guide)

## 🎯 Overview

This guide will help you install and run your personal AI chat application on your local computer. The application includes:

- **Online AI Chat**: Chat with AI using internet connection
- **Offline AI Chat**: Chat with AI locally (optional, requires Ollama)
- **Conversation History**: Save and manage your chat history
- **Voice Input**: Talk to the AI using your microphone
- **Mobile Friendly**: Works on both desktop and mobile devices

## 💻 System Requirements

Before you begin, make sure your computer meets these requirements:

### Required
- **Operating System**: Windows 10/11, macOS 10.14+, or Linux
- **Node.js**: Version 16 or higher
- **Memory**: At least 4GB RAM
- **Storage**: At least 1GB free space

### Optional (for offline mode)
- **Ollama**: For local AI processing
- **More Memory**: 8GB+ RAM recommended for offline mode
- **More Storage**: Additional space for AI models (2-10GB per model)

## 🚀 Quick Start (Automated - Recommended)

This is the easiest way to install the application.

### Step 1: Install Node.js

1. **Open your web browser** and go to: [https://nodejs.org/](https://nodejs.org/)
2. **Click the "LTS" button** (recommended for most users)
3. **Download and run the installer**
   - **Windows**: Run the `.msi` file
   - **macOS**: Run the `.pkg` file
   - **Linux**: Follow the instructions on the website

4. **Verify installation**:
   - **Windows**: Open Command Prompt or PowerShell
   - **macOS/Linux**: Open Terminal
   - Type: `node --version`
   - You should see something like: `v18.17.0`

### Step 2: Download the Application

1. **Download the application files** (you should already have these)
2. **Extract the files** if they're in a zip folder
3. **Remember the location** where you extracted the files

### Step 3: Run the Automated Setup

1. **Open a terminal/command prompt**:
   - **Windows**: 
     - Press `Win + R`, type `cmd`, and press Enter
     - OR search for "Command Prompt" in Start menu
   - **macOS**: 
     - Press `Cmd + Space`, type "Terminal", and press Enter
     - OR find Terminal in Applications > Utilities
   - **Linux**: 
     - Press `Ctrl + Alt + T` to open Terminal
     - OR search for "Terminal" in your applications

2. **Navigate to the application folder**:
   ```bash
   # Replace "path-to-your-folder" with the actual path
   cd path-to-your-folder
   
   # Example on Windows:
   cd C:\Users\YourName\Desktop\AI-Chat-App
   
   # Example on macOS/Linux:
   cd /home/yourname/Desktop/AI-Chat-App
   ```

3. **Run the automated setup**:
   ```bash
   ./deploy.sh
   ```

4. **Follow the on-screen instructions**:
   - The script will check your system
   - Install required dependencies
   - Ask if you want to install Ollama (for offline mode)
   - Create startup scripts
   - Create desktop shortcuts

### Step 4: Start the Application

1. **Start the application**:
   ```bash
   ./start.sh
   ```

2. **Open your web browser** and go to: `http://localhost:3000`

3. **You're ready to chat!** 🎉

### Step 5: Stop the Application

When you're done using the application:

```bash
./stop.sh
```

## 🔧 Manual Installation (Alternative Method)

If the automated setup doesn't work, follow these steps:

### Step 1: Install Node.js

Follow the same Node.js installation steps as above.

### Step 2: Install Dependencies

1. **Open terminal/command prompt**
2. **Navigate to the application folder**
3. **Install dependencies**:
   ```bash
   npm install
   ```

### Step 3: Setup Database

```bash
npx prisma db push
```

### Step 4: Install Ollama (Optional)

For offline AI capabilities:

1. **Install Ollama**:
   - **Windows/macOS/Linux**: Visit [https://ollama.com/](https://ollama.com/)
   - Download and run the installer

2. **Start Ollama**:
   ```bash
   ollama serve
   ```

3. **Download an AI model** (in a new terminal):
   ```bash
   ollama pull llama3.2
   ```

### Step 5: Start the Application

```bash
npm run dev
```

### Step 6: Access the Application

Open your web browser and go to: `http://localhost:3000`

## 🎮 Using the Application

### First Time Setup

1. **Open the application** in your web browser
2. **Choose your mode**:
   - **Online**: Uses internet AI (always available)
   - **Offline**: Uses local AI (requires Ollama)

### Basic Chatting

1. **Type your message** in the input box at the bottom
2. **Press Enter** or click the send button
3. **Wait for the AI response**
4. **Continue chatting** as long as you like

### Voice Input

1. **Click the microphone button** 🎤
2. **Allow microphone permission** when prompted
3. **Speak your message** clearly
4. **Click stop** when finished (or wait for auto-stop)
5. **Your speech will be converted to text** automatically

### Managing Conversations

1. **View conversation history**:
   - Click the menu button (☰) in the top-left
   - See all your previous conversations

2. **Start a new chat**:
   - Click the "New Chat" button in the header
   - Or select "New Chat" from the sidebar

3. **Switch between conversations**:
   - Open the sidebar (☰ button)
   - Click on any conversation to load it

4. **Delete conversations**:
   - Hover over a conversation in the sidebar
   - Click the trash icon (🗑️) that appears

### Offline Mode Setup

1. **Install Ollama** (if not already done)
2. **Start Ollama service**:
   ```bash
   ollama serve
   ```
3. **In the application**:
   - Switch to "Offline" mode in the top-right
   - Select your preferred AI model
   - Start chatting offline!

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### Problem: Application won't start
**Solution:**
1. Make sure Node.js is installed: `node --version`
2. Check if port 3000 is available
3. Try closing other applications that might use port 3000
4. Run: `npm run dev` and check for error messages

#### Problem: "Command not found" errors
**Solution:**
1. Make sure you're in the correct directory
2. Check that Node.js is properly installed
3. Try restarting your terminal/command prompt

#### Problem: Offline mode doesn't work
**Solution:**
1. Make sure Ollama is installed: `ollama --version`
2. Start Ollama service: `ollama serve`
3. Download a model: `ollama pull llama3.2`
4. Check if Ollama is running: `curl http://localhost:11434/api/tags`

#### Problem: Voice input doesn't work
**Solution:**
1. Make sure you've allowed microphone permission
2. Check if your microphone is working in other applications
3. Try using Chrome or Firefox browser
4. Make sure you're using HTTPS (localhost should work fine)

#### Problem: Conversations not saving
**Solution:**
1. Check if the database is properly set up: `npx prisma db push`
2. Look for error messages in the terminal
3. Try refreshing the page

#### Problem: White screen or loading forever
**Solution:**
1. Check the terminal for error messages
2. Try clearing your browser cache
3. Try a different browser
4. Restart the application: `./stop.sh` then `./start.sh`

### Getting Help

If you encounter issues not covered here:

1. **Check the terminal output** for error messages
2. **Try restarting the application**
3. **Make sure all requirements are installed**
4. **Search for your error online** - many common issues have solutions available

## 📚 Features Guide

### Online Mode Features
- ✅ **Always Available**: Works as long as you have internet
- ✅ **Fast Response**: Quick AI responses from cloud servers
- ✅ **Multiple Models**: Access to various AI models
- ✅ **No Setup Required**: Works out of the box

### Offline Mode Features
- ✅ **Privacy**: All processing happens on your computer
- ✅ **No Internet Required**: Works without internet connection
- ✅ **Free**: No API costs or usage limits
- ✅ **Customizable**: Can use different AI models

### Conversation Management
- ✅ **Auto-save**: Conversations saved automatically
- ✅ **Searchable**: Easy to find past conversations
- ✅ **Organized**: Conversations grouped by session
- ✅ **Export**: Can export conversation data

### User Interface
- ✅ **Responsive**: Works on desktop, tablet, and mobile
- ✅ **Dark Theme**: Easy on the eyes
- ✅ **Intuitive**: Simple and clean design
- ✅ **Accessible**: Works with screen readers

### Voice Features
- ✅ **Multiple Languages**: Supports various languages
- ✅ **Real-time**: Live transcription as you speak
- ✅ **Accurate**: High-quality speech recognition
- ✅ **Easy to Use**: One-click voice input

---

## 🎉 Congratulations!

You've successfully set up your personal AI chat application! Enjoy chatting with AI both online and offline. If you need any help, refer back to this guide or check the troubleshooting section.

**Happy Chatting! 🤖💬**