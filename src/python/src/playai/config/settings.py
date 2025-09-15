"""Settings configuration for PlayAI."""

import os
from typing import Optional

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""
    
    def __init__(self):
        # API Configuration
        self.api_key: Optional[str] = os.getenv("API_KEY")
        self.api_base_url: str = os.getenv("API_BASE_URL", "https://api.example.com")
        
        # Database Configuration
        self.database_url: Optional[str] = os.getenv("DATABASE_URL")
        
        # Logging Configuration
        self.log_level: str = os.getenv("LOG_LEVEL", "INFO")
        self.log_file: Optional[str] = os.getenv("LOG_FILE")
        
        # Application Configuration
        self.debug: bool = os.getenv("DEBUG", "False").lower() == "true"
        self.secret_key: str = os.getenv("SECRET_KEY", "default-secret-key")
        self.environment: str = os.getenv("ENVIRONMENT", "development")
        
        # External Services
        self.redis_url: Optional[str] = os.getenv("REDIS_URL")
        self.celery_broker_url: Optional[str] = os.getenv("CELERY_BROKER_URL")
    
    def validate(self) -> bool:
        """
        Validate that required settings are present.
        
        Returns:
            True if all required settings are valid
        """
        required_settings = [
            self.api_key,
            self.secret_key,
        ]
        
        return all(setting is not None for setting in required_settings)
    
    def get_database_config(self) -> dict:
        """
        Get database configuration as a dictionary.
        
        Returns:
            Database configuration dictionary
        """
        if not self.database_url:
            return {}
        
        return {
            "url": self.database_url,
            "echo": self.debug,
        }
    
    def get_logging_config(self) -> dict:
        """
        Get logging configuration as a dictionary.
        
        Returns:
            Logging configuration dictionary
        """
        config = {
            "level": self.log_level,
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        }
        
        if self.log_file:
            config["filename"] = self.log_file
        
        return config


# Global settings instance
settings = Settings() 