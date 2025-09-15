# Python Project

This is a Python project with a clean, modular structure.

## Project Structure

```
src/python/
├── README.md              # This file
├── requirements.txt       # Python dependencies
├── setup.py              # Package setup and installation
├── pyproject.toml        # Modern Python project configuration
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── src/                 # Source code
│   └── playai/         # Main package
│       ├── __init__.py
│       ├── core/       # Core functionality
│       ├── utils/      # Utility functions
│       └── config/     # Configuration management
├── tests/              # Test files
│   ├── __init__.py
│   ├── test_core/
│   └── test_utils/
├── docs/               # Documentation
└── scripts/            # Utility scripts
```

## Setup

1. **Activate virtual environment:**
   ```bash
   source .venv/bin/activate  # On macOS/Linux
   # or
   .venv\Scripts\activate     # On Windows
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install in development mode:**
   ```bash
   pip install -e .
   ```

## Development

- **Run tests:** `pytest`
- **Format code:** `black src/ tests/`
- **Lint code:** `flake8 src/ tests/`
- **Type checking:** `mypy src/`

## Environment Variables

Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

## Usage

```python
from playai.core import main_function

# Your code here
```

## Contributing

1. Follow PEP 8 style guidelines
2. Write tests for new functionality
3. Update documentation as needed
4. Use pre-commit hooks for code quality 