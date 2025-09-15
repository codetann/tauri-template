.PHONY: help install install-dev test lint format type-check clean setup run-example

# Default target
help:
	@echo "Available commands:"
	@echo "  install      - Install production dependencies"
	@echo "  install-dev  - Install development dependencies"
	@echo "  test         - Run tests"
	@echo "  lint         - Run linting (flake8)"
	@echo "  format       - Format code with black"
	@echo "  type-check   - Run type checking with mypy"
	@echo "  clean        - Clean build artifacts"
	@echo "  setup        - Setup development environment"
	@echo "  run-example  - Run basic usage example"

# Install production dependencies
install:
	pip install -r requirements.txt

# Install development dependencies
install-dev:
	pip install -r requirements.txt
	pip install -e .

# Run tests
test:
	python -m pytest tests/ -v

# Run tests with coverage
test-cov:
	python -m pytest tests/ -v --cov=src/playai --cov-report=html --cov-report=term

# Run linting
lint:
	flake8 src/ tests/

# Format code
format:
	black src/ tests/

# Check code formatting
format-check:
	black --check src/ tests/

# Run type checking
type-check:
	mypy src/

# Clean build artifacts
clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info/
	rm -rf .pytest_cache/
	rm -rf htmlcov/
	rm -rf .coverage
	find . -type d -name __pycache__ -delete
	find . -type f -name "*.pyc" -delete

# Setup development environment
setup:
	python scripts/setup_dev.py

# Run basic usage example
run-example:
	python examples/basic_usage.py

# Run all checks
check: lint format-check type-check test

# Install pre-commit hooks
pre-commit:
	pre-commit install

# Update dependencies
update-deps:
	pip install --upgrade -r requirements.txt

# Build package
build:
	python setup.py sdist bdist_wheel

# Install package
install-pkg:
	pip install -e .

# Uninstall package
uninstall-pkg:
	pip uninstall playai -y 