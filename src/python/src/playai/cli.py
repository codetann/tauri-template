"""Command-line interface for PlayAI."""

import argparse
import json
import logging
import sys
from typing import Dict, Any

from .core import main_function
from .config import settings
from .utils.helpers import format_response
from .ai.generator import (
    generate_content,
    get_available_models,
    get_available_loras,
    get_generation_status,
    cancel_generation,
    initialize_backend
)


def setup_logging() -> None:
    """Setup logging configuration."""
    logging_config = settings.get_logging_config()
    
    logging.basicConfig(
        level=getattr(logging, logging_config["level"]),
        format=logging_config["format"],
        filename=logging_config.get("filename")
    )


def parse_arguments() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="PlayAI - A Python package for AI functionality",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  playai process '{"type": "text", "content": "Hello World"}'
  playai config
  playai generate '{"model_type": "text-to-image", "prompt": "A beautiful sunset"}'
  playai list-models
  playai list-loras
  playai --help
        """
    )
    
    parser.add_argument(
        "command",
        choices=["process", "config", "generate", "list-models", "list-loras", "status", "cancel", "init"],
        help="Command to execute"
    )
    
    parser.add_argument(
        "input_data",
        nargs="?",
        help="Input data as JSON string (for process command)"
    )
    
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug mode"
    )
    
    parser.add_argument(
        "--output",
        "-o",
        help="Output file path (default: stdout)"
    )
    
    return parser.parse_args()


def process_command(input_data: str) -> Dict[str, Any]:
    """
    Process the input data using the main function.
    
    Args:
        input_data: JSON string containing input data
        
    Returns:
        Processing results
    """
    try:
        # Parse input data
        data = json.loads(input_data)
        
        # Process the data
        result = main_function(data)
        
        return format_response(result, status="success")
        
    except json.JSONDecodeError as e:
        return format_response(
            None,
            status="error",
            message=f"Invalid JSON input: {e}"
        )
    except ValueError as e:
        return format_response(
            None,
            status="error",
            message=str(e)
        )
    except Exception as e:
        return format_response(
            None,
            status="error",
            message=f"Unexpected error: {e}"
        )


def config_command() -> Dict[str, Any]:
    """
    Get configuration information.
    
    Returns:
        Configuration information
    """
    return format_response(
        {
            "debug": settings.debug,
            "environment": settings.environment,
            "api_base_url": settings.api_base_url
        },
        status="success",
        message="Configuration retrieved successfully"
    )


def generate_command(input_data: str) -> Dict[str, Any]:
    """
    Generate content using AI models.
    
    Args:
        input_data: JSON string containing generation request
        
    Returns:
        Generation response
    """
    try:
        request = json.loads(input_data)
        result = generate_content(request)
        return format_response(result, status="success")
    except json.JSONDecodeError as e:
        return format_response(
            None,
            status="error",
            message=f"Invalid JSON input: {e}"
        )
    except Exception as e:
        return format_response(
            None,
            status="error",
            message=f"Generation error: {e}"
        )


def list_models_command() -> Dict[str, Any]:
    """
    Get available models.
    
    Returns:
        List of available models
    """
    try:
        models = get_available_models()
        return format_response(models, status="success")
    except Exception as e:
        return format_response(
            None,
            status="error",
            message=f"Failed to get models: {e}"
        )


def list_loras_command() -> Dict[str, Any]:
    """
    Get available LoRAs.
    
    Returns:
        List of available LoRAs
    """
    try:
        loras = get_available_loras()
        return format_response(loras, status="success")
    except Exception as e:
        return format_response(
            None,
            status="error",
            message=f"Failed to get LoRAs: {e}"
        )


def status_command(generation_id: str) -> Dict[str, Any]:
    """
    Get generation status.
    
    Args:
        generation_id: Generation ID to check
        
    Returns:
        Generation status
    """
    try:
        status = get_generation_status(generation_id)
        return format_response(status, status="success")
    except Exception as e:
        return format_response(
            None,
            status="error",
            message=f"Failed to get status: {e}"
        )


def cancel_command(generation_id: str) -> Dict[str, Any]:
    """
    Cancel a generation.
    
    Args:
        generation_id: Generation ID to cancel
        
    Returns:
        Cancellation result
    """
    try:
        cancel_generation(generation_id)
        return format_response(
            {"cancelled": True},
            status="success",
            message="Generation cancelled successfully"
        )
    except Exception as e:
        return format_response(
            None,
            status="error",
            message=f"Failed to cancel generation: {e}"
        )


def init_command() -> Dict[str, Any]:
    """
    Initialize the AI backend.
    
    Returns:
        Initialization result
    """
    try:
        initialize_backend()
        return format_response(
            {"initialized": True},
            status="success",
            message="AI backend initialized successfully"
        )
    except Exception as e:
        return format_response(
            None,
            status="error",
            message=f"Failed to initialize backend: {e}"
        )


def output_result(result: Dict[str, Any], output_file: str = None) -> None:
    """
    Output the result to stdout or file.
    
    Args:
        result: Result to output
        output_file: Optional output file path
    """
    json_result = json.dumps(result, indent=2)
    
    if output_file:
        try:
            with open(output_file, 'w') as f:
                f.write(json_result)
            print(f"Result written to {output_file}")
        except IOError as e:
            print(f"Error writing to file: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        print(json_result)


def main() -> None:
    """Main CLI entry point."""
    # Setup logging
    setup_logging()
    
    # Parse arguments
    args = parse_arguments()
    
    # Enable debug mode if requested
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        # Execute command
        if args.command == "process":
            if not args.input_data:
                print("Error: Input data required for process command", file=sys.stderr)
                sys.exit(1)
            
            result = process_command(args.input_data)
        elif args.command == "config":
            result = config_command()
        elif args.command == "generate":
            if not args.input_data:
                print("Error: Generation request required for generate command", file=sys.stderr)
                sys.exit(1)
            
            result = generate_command(args.input_data)
        elif args.command == "list-models":
            result = list_models_command()
        elif args.command == "list-loras":
            result = list_loras_command()
        elif args.command == "status":
            if not args.input_data:
                print("Error: Generation ID required for status command", file=sys.stderr)
                sys.exit(1)
            
            result = status_command(args.input_data)
        elif args.command == "cancel":
            if not args.input_data:
                print("Error: Generation ID required for cancel command", file=sys.stderr)
                sys.exit(1)
            
            result = cancel_command(args.input_data)
        elif args.command == "init":
            result = init_command()
        else:
            print(f"Unknown command: {args.command}", file=sys.stderr)
            sys.exit(1)
        
        # Output result
        output_result(result, args.output)
        
        # Exit with error code if there was an error
        if result.get("status") == "error":
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\nOperation cancelled by user", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main() 