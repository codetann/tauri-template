"""Tests for helper utility functions."""

import pytest
from datetime import datetime

from playai.utils.helpers import (
    validate_input,
    format_response,
    safe_json_loads,
    flatten_dict,
    get_nested_value,
    sanitize_string,
    truncate_string
)


class TestValidateInput:
    """Test cases for validate_input."""
    
    def test_validate_input_valid(self):
        """Test validation with valid input."""
        data = {
            "type": "text",
            "content": "Hello World"
        }
        assert validate_input(data) is True
    
    def test_validate_input_missing_type(self):
        """Test validation with missing type field."""
        data = {
            "content": "Hello World"
        }
        assert validate_input(data) is False
    
    def test_validate_input_missing_content(self):
        """Test validation with missing content field."""
        data = {
            "type": "text"
        }
        assert validate_input(data) is False
    
    def test_validate_input_not_dict(self):
        """Test validation with non-dict input."""
        data = "not a dict"
        assert validate_input(data) is False
    
    def test_validate_input_empty_dict(self):
        """Test validation with empty dict."""
        data = {}
        assert validate_input(data) is False


class TestFormatResponse:
    """Test cases for format_response."""
    
    def test_format_response_basic(self):
        """Test basic response formatting."""
        data = {"test": "data"}
        result = format_response(data)
        
        assert result["status"] == "success"
        assert result["data"] == data
        assert "timestamp" in result
    
    def test_format_response_with_message(self):
        """Test response formatting with message."""
        data = {"test": "data"}
        message = "Test message"
        result = format_response(data, message=message)
        
        assert result["status"] == "success"
        assert result["data"] == data
        assert result["message"] == message
    
    def test_format_response_with_custom_status(self):
        """Test response formatting with custom status."""
        data = {"test": "data"}
        result = format_response(data, status="error")
        
        assert result["status"] == "error"
        assert result["data"] == data


class TestSafeJsonLoads:
    """Test cases for safe_json_loads."""
    
    def test_safe_json_loads_valid(self):
        """Test parsing valid JSON."""
        json_string = '{"key": "value"}'
        result = safe_json_loads(json_string)
        
        assert result == {"key": "value"}
    
    def test_safe_json_loads_invalid(self):
        """Test parsing invalid JSON."""
        json_string = '{"key": "value"'
        result = safe_json_loads(json_string)
        
        assert result is None
    
    def test_safe_json_loads_not_string(self):
        """Test parsing non-string input."""
        result = safe_json_loads(123)
        
        assert result is None


class TestFlattenDict:
    """Test cases for flatten_dict."""
    
    def test_flatten_dict_simple(self):
        """Test flattening simple dictionary."""
        data = {"a": 1, "b": 2}
        result = flatten_dict(data)
        
        assert result == {"a": 1, "b": 2}
    
    def test_flatten_dict_nested(self):
        """Test flattening nested dictionary."""
        data = {"a": {"b": {"c": 1}}}
        result = flatten_dict(data)
        
        assert result == {"a.b.c": 1}
    
    def test_flatten_dict_custom_separator(self):
        """Test flattening with custom separator."""
        data = {"a": {"b": 1}}
        result = flatten_dict(data, sep="_")
        
        assert result == {"a_b": 1}


class TestGetNestedValue:
    """Test cases for get_nested_value."""
    
    def test_get_nested_value_exists(self):
        """Test getting existing nested value."""
        data = {"a": {"b": {"c": 1}}}
        result = get_nested_value(data, "a.b.c")
        
        assert result == 1
    
    def test_get_nested_value_not_exists(self):
        """Test getting non-existing nested value."""
        data = {"a": {"b": 1}}
        result = get_nested_value(data, "a.b.c")
        
        assert result is None
    
    def test_get_nested_value_with_default(self):
        """Test getting nested value with default."""
        data = {"a": {"b": 1}}
        result = get_nested_value(data, "a.b.c", default="default")
        
        assert result == "default"


class TestSanitizeString:
    """Test cases for sanitize_string."""
    
    def test_sanitize_string_normal(self):
        """Test sanitizing normal string."""
        text = "Hello World"
        result = sanitize_string(text)
        
        assert result == "Hello World"
    
    def test_sanitize_string_with_control_chars(self):
        """Test sanitizing string with control characters."""
        text = "Hello\x00World"
        result = sanitize_string(text)
        
        assert result == "HelloWorld"
    
    def test_sanitize_string_not_string(self):
        """Test sanitizing non-string input."""
        text = 123
        result = sanitize_string(text)
        
        assert result == "123"


class TestTruncateString:
    """Test cases for truncate_string."""
    
    def test_truncate_string_short(self):
        """Test truncating short string."""
        text = "Hello"
        result = truncate_string(text, max_length=10)
        
        assert result == "Hello"
    
    def test_truncate_string_long(self):
        """Test truncating long string."""
        text = "Hello World This Is A Long String"
        result = truncate_string(text, max_length=10)
        
        assert result == "Hello Worl..."
    
    def test_truncate_string_custom_suffix(self):
        """Test truncating with custom suffix."""
        text = "Hello World"
        result = truncate_string(text, max_length=5, suffix="***")
        
        assert result == "He***" 