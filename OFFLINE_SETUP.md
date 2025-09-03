# Offline ChatGPT Clone Setup Guide

This guide will help you set up your ChatGPT clone to work completely offline with local AI models.

## 🚀 Overview

Your ChatGPT clone now supports two modes:
- **Online Mode**: Uses cloud-based AI (z-ai-web-dev-sdk)
- **Offline Mode**: Uses local AI models via Ollama

## 📋 System Requirements

### Minimum Requirements
- **RAM**: 8GB (16GB recommended)
- **Storage**: 10GB free space (for models)
- **CPU**: Modern multi-core processor
- **OS**: Windows 10+, macOS 10.15+, or Linux

### Recommended Requirements
- **RAM**: 16GB+ (32GB for larger models)
- **Storage**: 50GB+ free space
- **CPU**: Apple Silicon (M1/M2/M3) or modern x86_64
- **GPU**: NVIDIA GPU with CUDA support (optional but recommended)

## 🛠️ Installation Steps

### Step 1: Install Ollama

#### macOS
```bash
# Install via Homebrew
brew install ollama

# Or download directly from https://ollama.com/download
```

#### Windows
1. Download Ollama from https://ollama.com/download
2. Run the installer
3. Restart your terminal/command prompt

#### Linux
```bash
# Download and install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
sudo systemctl start ollama
sudo systemctl enable ollama
```

### Step 2: Download AI Models

Choose a model based on your system capabilities:

#### For Most Systems (Recommended)
```bash
# Llama 3.2 (4B parameters) - Good balance of quality and performance
ollama pull llama3.2

# Llama 3.1 (8B parameters) - Better quality, more resources needed
ollama pull llama3.1
```

#### For Less Powerful Systems
```bash
# Phi-3 (3.8B parameters) - Fast and lightweight
ollama pull phi3

# Mistral (7B parameters) - Good performance on modest hardware
ollama pull mistral
```

#### For Powerful Systems
```bash
# Llama 3.2 (larger versions if available)
ollama pull llama3.2:70b  # Requires significant resources
```

### Step 3: Verify Ollama Installation

```bash
# Check if Ollama is running
ollama --version

# Test with a simple command
ollama run llama3.2 "Hello, how are you?"

# Check running models
ollama ps
```

### Step 4: Start Ollama Service

#### macOS/Windows
Ollama should start automatically after installation. If not:

```bash
# macOS
ollama serve

# Windows
# Look for Ollama in system tray or start menu
```

#### Linux
```bash
# Start the service
sudo systemctl start ollama

# Check status
sudo systemctl status ollama
```

## 🎮 Using Offline Mode

### 1. Start Your Chat Application
```bash
npm run dev
```

### 2. Switch to Offline Mode
- Open your browser to `http://localhost:3000`
- Click the mode selector in the top-right corner
- Select "Offline" mode
- Choose your preferred model from the dropdown

### 3. Start Chatting
- Type messages in the input field
- Responses will be generated locally using your downloaded model
- No internet connection required!

## 🔧 Troubleshooting

### Ollama Not Starting
```bash
# Check if Ollama is installed
which ollama

# Try starting manually
ollama serve

# Check logs (Linux)
sudo journalctl -u ollama -f
```

### Model Download Issues
```bash
# Check available disk space
df -h

# Try downloading again
ollama pull llama3.2

# List downloaded models
ollama list
```

### Connection Errors in App
1. **Ensure Ollama is running**: Check that Ollama service is active
2. **Verify port**: Ollama runs on port 11434 by default
3. **Check firewall**: Ensure port 11434 is not blocked
4. **Test Ollama directly**:
   ```bash
   curl http://localhost:11434/api/generate -X POST -d '{"model": "llama3.2", "prompt": "Hello"}'
   ```

### Performance Issues
- **Close other applications** to free up RAM
- **Use smaller models** (phi3, mistral) on weaker hardware
- **Enable GPU acceleration** if available:
  ```bash
  # For NVIDIA GPUs
  ollama run llama3.2 --gpu
  ```

## 📊 Model Comparison

| Model | Parameters | Size | Quality | Speed | Best For |
|-------|------------|------|---------|-------|----------|
| phi3 | 3.8B | ~2.5GB | Good | Very Fast | Low-end systems |
| mistral | 7B | ~4.2GB | Very Good | Fast | General use |
| llama3.2 | 4B | ~2.7GB | Excellent | Fast | Most systems |
| llama3.1 | 8B | ~4.9GB | Excellent | Medium | Quality-focused |

## 🔄 Advanced Configuration

### Environment Variables
Add these to your `.env.local` file:

```env
# Ollama configuration
OLLAMA_HOST=localhost
OLLAMA_PORT=11434

# Default model
DEFAULT_MODEL=llama3.2

# Default mode
DEFAULT_MODE=offline
```

### Custom Model Parameters
You can modify model behavior in the API call:

```javascript
// In your API route, you can add more options
options: {
  temperature: 0.7,    // Creativity (0-1)
  top_p: 0.9,         // Nucleus sampling
  max_tokens: 1000,   // Response length
  repeat_penalty: 1.1 // Reduce repetition
}
```

## 📱 Mobile/Portable Usage

### Creating a Portable Setup
1. **Install Ollama on a laptop**
2. **Download models while online**
3. **Use offline anywhere** - no internet needed!

### Battery Optimization
- Use smaller models (phi3, mistral) for better battery life
- Close unnecessary applications
- Consider using a power adapter for long sessions

## 🎯 Tips for Best Experience

1. **Start with llama3.2** - Best balance of quality and performance
2. **Download multiple models** - Switch based on your needs
3. **Keep Ollama updated**:
   ```bash
   # Update Ollama
   brew upgrade ollama  # macOS
   # Or download latest version from website
   ```
4. **Monitor resources** - Use Activity Monitor/Task Manager to check RAM/CPU usage
5. **Experiment with prompts** - Different models may respond better to certain styles

## 🆘 Getting Help

### Resources
- [Ollama Documentation](https://github.com/ollama/ollama)
- [Ollama Model Library](https://ollama.com/library)
- [Community Forum](https://github.com/ollama/ollama/discussions)

### Common Issues
- **"Connection refused"**: Start Ollama service
- **"Model not found"**: Download the model first
- **"Out of memory"**: Use a smaller model or close other apps
- **"Slow responses"**: Check system resources and use smaller model

---

🎉 **Congratulations!** You now have a fully functional offline ChatGPT clone that works anywhere, anytime, without an internet connection!