# PlayAI - AI Generation Platform

A modern desktop application for AI content generation, built with Tauri, React, and Python.

## 🏗️ Architecture Overview

PlayAI is a multi-layered application with the following architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   AI Generation │  │  Generation     │  │   Settings   │ │
│  │     Interface   │  │   History       │  │   & Config   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Rust Backend (Tauri)                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   AI Commands   │  │   Engine        │  │   Event      │ │
│  │   Handler       │  │   Management    │  │   System     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Python AI Backend                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Text-to-      │  │   Text-to-      │  │   Text       │ │
│  │   Image         │  │   Audio/Video   │  │   Generation │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Model         │  │   LoRA          │  │   Generation │ │
│  │   Management    │  │   Integration   │  │   Queue      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Features

### AI Generation Capabilities
- **Text-to-Image**: Generate images from text prompts using Stable Diffusion and other models
- **Text-to-Audio**: Convert text to speech with various voices and styles
- **Text-to-Video**: Create short videos from text descriptions
- **Text Generation**: Generate text content using large language models

### Advanced Features
- **Model Management**: Dynamic loading and switching between different AI models
- **LoRA Support**: Fine-tuned model adapters for specialized styles and tasks
- **Generation History**: Track and manage all your generations with filtering and search
- **Real-time Status**: Monitor generation progress with live updates
- **Parameter Control**: Fine-tune generation parameters for optimal results

### User Interface
- **Modern UI**: Clean, responsive interface built with HeroUI
- **Dark Theme**: Optimized for content creation workflows
- **Real-time Updates**: Live status updates and progress indicators
- **History Management**: Comprehensive generation history with filtering

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **HeroUI** for UI components
- **Zustand** for state management
- **Tauri** for desktop app framework

### Backend
- **Rust** with Tauri for native desktop functionality
- **Python** for AI model integration and processing
- **PyTorch** and **Transformers** for AI models
- **Diffusers** for image generation

### AI Models
- **Stable Diffusion** for image generation
- **Whisper** for text-to-speech
- **LLaMA** for text generation
- **Stable Video Diffusion** for video generation

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Rust and Cargo
- Python 3.8+
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd playai
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Setup Python backend**
   ```bash
   cd src/python
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   pip install -e .
   ```

4. **Build and run the application**
   ```bash
   npm run tauri dev
   ```

## 🔧 Development

### Project Structure
```
playai/
├── src/                    # Frontend source code
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── state/            # State management
│   └── styles/           # CSS and styling
├── src-tauri/            # Rust backend
│   ├── src/              # Rust source code
│   │   ├── ai/           # AI command handlers
│   │   └── engine/       # Engine management
│   └── Cargo.toml        # Rust dependencies
├── src/python/           # Python AI backend
│   ├── src/playai/       # Python package
│   │   ├── ai/           # AI generation logic
│   │   ├── core/         # Core functionality
│   │   ├── config/       # Configuration
│   │   └── utils/        # Utility functions
│   ├── tests/            # Python tests
│   └── requirements.txt  # Python dependencies
└── README.md
```

### Development Commands

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

#### Rust Backend
```bash
npm run tauri dev    # Start Tauri development
npm run tauri build  # Build desktop application
```

#### Python Backend
```bash
cd src/python
make setup           # Setup development environment
make test            # Run tests
make lint            # Run linting
make format          # Format code
```

### Adding New AI Models

1. **Add model configuration** in `src/python/src/playai/ai/generator.py`
2. **Update model loading logic** in the generation functions
3. **Add UI components** for model-specific parameters
4. **Update tests** to cover new functionality

### Adding New Generation Types

1. **Extend the ModelType enum** in the Python backend
2. **Add generation function** in the GenerationManager
3. **Update frontend interface** to support the new type
4. **Add appropriate UI components** and icons

## 🧪 Testing

### Frontend Tests
```bash
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
```

### Python Tests
```bash
cd src/python
make test            # Run all tests
make test-cov        # Run tests with coverage
```

### Integration Tests
```bash
npm run test:integration  # Test Rust-Python integration
```

## 📚 API Reference

### Rust Commands (Tauri)

#### AI Generation
- `generate_content(request)` - Start content generation
- `get_available_models()` - Get list of available models
- `get_available_loras()` - Get list of available LoRAs
- `get_generation_status(generation_id)` - Check generation status
- `cancel_generation(generation_id)` - Cancel ongoing generation

#### Engine Management
- `create_tab(engine, container_id, url)` - Create new browser tab
- `destroy_tab(tab_id)` - Destroy browser tab
- `load_url(tab_id, url)` - Load URL in tab
- `get_nav_state(tab_id)` - Get navigation state

### Python CLI Commands

```bash
playai generate '{"model_type": "text-to-image", "prompt": "A beautiful sunset"}'
playai list-models
playai list-loras
playai status <generation_id>
playai cancel <generation_id>
playai init
```

## 🔒 Security

- Environment variables for sensitive configuration
- Input validation and sanitization
- Secure model loading and execution
- Error handling and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript/React best practices
- Write tests for new functionality
- Update documentation for API changes
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the docs folder for detailed guides
- **Issues**: Report bugs and request features on GitHub
- **Discussions**: Join community discussions for help and ideas

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic AI generation interface
- ✅ Model management system
- ✅ Generation history
- ✅ Real-time status updates

### Phase 2 (Next)
- 🔄 Advanced parameter controls
- 🔄 Batch generation
- 🔄 Model fine-tuning interface
- 🔄 Plugin system

### Phase 3 (Future)
- 📋 Cloud model integration
- 📋 Collaborative features
- 📋 Advanced analytics
- 📋 Mobile companion app

---

**PlayAI** - Empowering creativity through AI generation 🚀
