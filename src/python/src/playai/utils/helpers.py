"""Helper utility functions for PlayAI."""

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

logger = logging.getLogger(__name__)


def validate_input(data: Dict[str, Any]) -> bool:
    """
    Validate input data structure and content.
    
    Args:
        data: Input data to validate
        
    Returns:
        True if data is valid, False otherwise
    """
    if not isinstance(data, dict):
        logger.error("Input data must be a dictionary")
        return False
    
    if not data:
        logger.error("Input data cannot be empty")
        return False
    
    # Add your validation logic here
    required_fields = ["type", "content"]
    for field in required_fields:
        if field not in data:
            logger.error(f"Missing required field: {field}")
            return False
    
    return True


def format_response(
    data: Any,
    status: str = "success",
    message: Optional[str] = None,
    timestamp: Optional[str] = None
) -> Dict[str, Any]:
    """
    Format a standardized response.
    
    Args:
        data: Response data
        status: Response status (success, error, warning)
        message: Optional message
        timestamp: Optional timestamp
        
    Returns:
        Formatted response dictionary
    """
    if timestamp is None:
        timestamp = datetime.utcnow().isoformat() + "Z"
    
    response = {
        "status": status,
        "data": data,
        "timestamp": timestamp
    }
    
    if message:
        response["message"] = message
    
    return response


def safe_json_loads(json_string: str) -> Optional[Dict[str, Any]]:
    """
    Safely parse JSON string.
    
    Args:
        json_string: JSON string to parse
        
    Returns:
        Parsed JSON data or None if parsing fails
    """
    try:
        return json.loads(json_string)
    except (json.JSONDecodeError, TypeError) as e:
        logger.error(f"Failed to parse JSON: {e}")
        return None


def flatten_dict(data: Dict[str, Any], parent_key: str = "", sep: str = ".") -> Dict[str, Any]:
    """
    Flatten a nested dictionary.
    
    Args:
        data: Dictionary to flatten
        parent_key: Parent key for nested items
        sep: Separator for nested keys
        
    Returns:
        Flattened dictionary
    """
    items: List[tuple] = []
    
    for key, value in data.items():
        new_key = f"{parent_key}{sep}{key}" if parent_key else key
        
        if isinstance(value, dict):
            items.extend(flatten_dict(value, new_key, sep=sep).items())
        else:
            items.append((new_key, value))
    
    return dict(items)


def get_nested_value(data: Dict[str, Any], key_path: str, default: Any = None) -> Any:
    """
    Get a value from a nested dictionary using dot notation.
    
    Args:
        data: Dictionary to search in
        key_path: Dot-separated key path (e.g., "user.profile.name")
        default: Default value if key is not found
        
    Returns:
        Value at the specified path or default value
    """
    keys = key_path.split(".")
    current = data
    
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return default
    
    return current


def sanitize_string(text: str) -> str:
    """
    Sanitize a string by removing potentially dangerous characters.
    
    Args:
        text: String to sanitize
        
    Returns:
        Sanitized string
    """
    if not isinstance(text, str):
        return str(text)
    
    # Remove null bytes and other control characters
    sanitized = "".join(char for char in text if ord(char) >= 32 or char in "\n\r\t")
    
    return sanitized.strip()


def truncate_string(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """
    Truncate a string to a maximum length.
    
    Args:
        text: String to truncate
        max_length: Maximum length
        suffix: Suffix to add if truncated
        
    Returns:
        Truncated string
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix 