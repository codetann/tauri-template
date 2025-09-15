#!/usr/bin/env python3
"""Test runner script for PlayAI."""

import subprocess
import sys
from pathlib import Path


def run_tests(test_path: str = "tests/", verbose: bool = True, coverage: bool = False):
    """Run tests with specified options."""
    cmd = ["python", "-m", "pytest"]
    
    if verbose:
        cmd.append("-v")
    
    if coverage:
        cmd.extend(["--cov=src/playai", "--cov-report=html", "--cov-report=term"])
    
    cmd.append(test_path)
    
    print(f"Running: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, check=False)
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"Error running tests: {e}")
        return False


def run_linting():
    """Run code linting."""
    print("Running flake8...")
    try:
        subprocess.run(["flake8", "src/", "tests/"], check=False)
    except subprocess.CalledProcessError:
        print("Linting found issues.")
        return False
    
    print("Running black check...")
    try:
        subprocess.run(["black", "--check", "src/", "tests/"], check=False)
    except subprocess.CalledProcessError:
        print("Black formatting issues found.")
        return False
    
    return True


def run_type_checking():
    """Run type checking."""
    print("Running mypy...")
    try:
        subprocess.run(["mypy", "src/"], check=False)
    except subprocess.CalledProcessError:
        print("Type checking found issues.")
        return False
    
    return True


def main():
    """Main test runner function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Run PlayAI tests and checks")
    parser.add_argument("--no-lint", action="store_true", help="Skip linting")
    parser.add_argument("--no-type-check", action="store_true", help="Skip type checking")
    parser.add_argument("--coverage", action="store_true", help="Run with coverage")
    parser.add_argument("--test-path", default="tests/", help="Path to test directory")
    
    args = parser.parse_args()
    
    # Change to script directory
    script_dir = Path(__file__).parent
    import os
    os.chdir(script_dir)
    
    success = True
    
    # Run tests
    if not run_tests(args.test_path, coverage=args.coverage):
        success = False
    
    # Run linting
    if not args.no_lint:
        if not run_linting():
            success = False
    
    # Run type checking
    if not args.no_type_check:
        if not run_type_checking():
            success = False
    
    if success:
        print("\n✅ All checks passed!")
        sys.exit(0)
    else:
        print("\n❌ Some checks failed!")
        sys.exit(1)


if __name__ == "__main__":
    main() 