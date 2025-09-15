"""Tests for main core functionality."""

import pytest
from unittest.mock import patch, MagicMock

from playai.core.main import main_function, process_data, get_config_info


class TestMainFunction:
    """Test cases for main_function."""
    
    def test_main_function_success(self):
        """Test successful execution of main_function."""
        input_data = {
            "type": "text",
            "content": "Hello World"
        }
        
        with patch('playai.core.main.validate_input', return_value=True):
            result = main_function(input_data)
        
        assert result["status"] == "success"
        assert result["data"] == input_data
        assert "processed_at" in result
    
    def test_main_function_invalid_input(self):
        """Test main_function with invalid input."""
        input_data = {}
        
        with patch('playai.core.main.validate_input', return_value=False):
            with pytest.raises(ValueError, match="Invalid input data provided"):
                main_function(input_data)
    
    def test_main_function_empty_input(self):
        """Test main_function with empty input."""
        input_data = {}
        
        with patch('playai.core.main.validate_input', return_value=False):
            with pytest.raises(ValueError, match="Invalid input data provided"):
                main_function(input_data)


class TestProcessData:
    """Test cases for process_data."""
    
    def test_process_data_success(self):
        """Test successful data processing."""
        data = {"test": "data"}
        result = process_data(data)
        
        assert result["status"] == "success"
        assert result["data"] == data
        assert "processed_at" in result
    
    def test_process_data_empty_dict(self):
        """Test processing empty dictionary."""
        data = {}
        result = process_data(data)
        
        assert result["status"] == "success"
        assert result["data"] == data


class TestGetConfigInfo:
    """Test cases for get_config_info."""
    
    @patch('playai.core.main.settings')
    def test_get_config_info(self, mock_settings):
        """Test getting configuration information."""
        mock_settings.debug = True
        mock_settings.environment = "test"
        mock_settings.api_base_url = "https://test.api.com"
        
        result = get_config_info()
        
        assert result["debug"] is True
        assert result["environment"] == "test"
        assert result["api_base_url"] == "https://test.api.com" 