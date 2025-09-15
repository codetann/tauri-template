#!/usr/bin/env python3
"""Basic usage example for PlayAI."""

import json
from playai.core import main_function
from playai.utils.helpers import format_response


def example_basic_processing():
    """Example of basic data processing."""
    print("=== Basic Processing Example ===")
    
    # Sample input data
    input_data = {
        "type": "text",
        "content": "Hello, this is a test message for PlayAI processing."
    }
    
    print(f"Input data: {json.dumps(input_data, indent=2)}")
    
    try:
        # Process the data
        result = main_function(input_data)
        print(f"Result: {json.dumps(result, indent=2)}")
        
    except Exception as e:
        print(f"Error: {e}")


def example_response_formatting():
    """Example of response formatting."""
    print("\n=== Response Formatting Example ===")
    
    data = {
        "user_id": 123,
        "message": "Hello World",
        "timestamp": "2024-01-01T12:00:00Z"
    }
    
    # Format a success response
    success_response = format_response(
        data=data,
        status="success",
        message="Data processed successfully"
    )
    
    print("Success Response:")
    print(json.dumps(success_response, indent=2))
    
    # Format an error response
    error_response = format_response(
        data=None,
        status="error",
        message="Something went wrong"
    )
    
    print("\nError Response:")
    print(json.dumps(error_response, indent=2))


def example_configuration():
    """Example of configuration usage."""
    print("\n=== Configuration Example ===")
    
    from playai.config import settings
    
    print("Current Configuration:")
    print(f"  Debug Mode: {settings.debug}")
    print(f"  Environment: {settings.environment}")
    print(f"  API Base URL: {settings.api_base_url}")
    print(f"  Log Level: {settings.log_level}")
    
    # Validate settings
    if settings.validate():
        print("  ✅ Configuration is valid")
    else:
        print("  ❌ Configuration has issues")


def main():
    """Run all examples."""
    print("PlayAI Basic Usage Examples\n")
    
    example_basic_processing()
    example_response_formatting()
    example_configuration()
    
    print("\n=== Examples Complete ===")


if __name__ == "__main__":
    main() 