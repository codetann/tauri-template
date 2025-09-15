#!/usr/bin/env python3
"""Development setup script for PlayAI."""

import os
import subprocess
import sys
from pathlib import Path


def run_command(command: str, check: bool = True) -> subprocess.CompletedProcess:
    """Run a shell command."""
    print(f"Running: {command}")
    result = subprocess.run(command, shell=True, check=check)
    return result


def setup_virtual_environment():
    """Setup virtual environment if it doesn't exist."""
    venv_path = Path(".venv")
    
    if not venv_path.exists():
        print("Creating virtual environment...")
        run_command("python -m venv .venv")
    else:
        print("Virtual environment already exists.")


def install_dependencies():
    """Install project dependencies."""
    print("Installing dependencies...")
    
    # Install base dependencies
    run_command("pip install -r requirements.txt")
    
    # Install in development mode
    run_command("pip install -e .")


def setup_pre_commit():
    """Setup pre-commit hooks."""
    print("Setting up pre-commit hooks...")
    
    try:
        run_command("pre-commit install", check=False)
        print("Pre-commit hooks installed successfully.")
    except subprocess.CalledProcessError:
        print("Warning: Could not install pre-commit hooks. Continuing...")


def create_env_file():
    """Create .env file from template if it doesn't exist."""
    env_file = Path(".env")
    env_example = Path("env.example")
    
    if not env_file.exists() and env_example.exists():
        print("Creating .env file from template...")
        run_command(f"cp env.example .env")
        print("Please edit .env file with your actual configuration values.")
    elif env_file.exists():
        print(".env file already exists.")
    else:
        print("Warning: No env.example file found.")


def run_tests():
    """Run tests to verify setup."""
    print("Running tests...")
    
    try:
        run_command("python -m pytest tests/ -v", check=False)
        print("Tests completed.")
    except subprocess.CalledProcessError:
        print("Warning: Some tests failed. This might be expected for initial setup.")


def main():
    """Main setup function."""
    print("Setting up PlayAI development environment...")
    
    # Change to project root directory (parent of scripts directory)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    os.chdir(project_root)
    
    try:
        setup_virtual_environment()
        install_dependencies()
        setup_pre_commit()
        create_env_file()
        run_tests()
        
        print("\n✅ Development environment setup complete!")
        print("\nNext steps:")
        print("1. Activate virtual environment: source .venv/bin/activate")
        print("2. Edit .env file with your configuration")
        print("3. Start developing!")
        
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main() 