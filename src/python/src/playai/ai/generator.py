"""AI content generation module."""

import asyncio
import json
import logging
import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from enum import Enum

from ..config import settings
from ..utils.helpers import format_response

logger = logging.getLogger(__name__)


class ModelType(Enum):
    """Supported model types."""
    TEXT_TO_IMAGE = "text-to-image"
    TEXT_TO_AUDIO = "text-to-audio"
    TEXT_TO_VIDEO = "text-to-video"
    TEXT_GENERATION = "text-generation"


@dataclass
class GenerationRequest:
    """Request for content generation."""
    model_type: str
    prompt: str
    parameters: Dict[str, Any]
    model_name: Optional[str] = None
    lora_name: Optional[str] = None


@dataclass
class GenerationResponse:
    """Response from content generation."""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    generation_id: str = ""
    status: str = "pending"  # pending, processing, completed, failed, cancelled


@dataclass
class ModelInfo:
    """Information about an AI model."""
    name: str
    model_type: str
    description: str
    parameters: Dict[str, Any]
    file_path: Optional[str] = None


@dataclass
class LoraInfo:
    """Information about a LoRA model."""
    name: str
    model_type: str
    description: str
    strength: float
    file_path: Optional[str] = None


class GenerationManager:
    """Manages ongoing generations."""
    
    def __init__(self):
        self.generations: Dict[str, GenerationResponse] = {}
        self.executor = ThreadPoolExecutor(max_workers=4)
        self._lock = threading.Lock()
    
    def start_generation(self, request: GenerationRequest) -> str:
        """Start a new generation."""
        generation_id = str(uuid.uuid4())
        
        response = GenerationResponse(
            success=False,
            generation_id=generation_id,
            status="pending"
        )
        
        with self._lock:
            self.generations[generation_id] = response
        
        # Start generation in background
        self.executor.submit(self._run_generation, generation_id, request)
        
        return generation_id
    
    def _run_generation(self, generation_id: str, request: GenerationRequest):
        """Run generation in background thread."""
        try:
            with self._lock:
                self.generations[generation_id].status = "processing"
            
            # Simulate generation time
            time.sleep(2)
            
            # Generate content based on model type
            if request.model_type == ModelType.TEXT_TO_IMAGE.value:
                result = self._generate_image(request)
            elif request.model_type == ModelType.TEXT_TO_AUDIO.value:
                result = self._generate_audio(request)
            elif request.model_type == ModelType.TEXT_TO_VIDEO.value:
                result = self._generate_video(request)
            elif request.model_type == ModelType.TEXT_GENERATION.value:
                result = self._generate_text(request)
            else:
                raise ValueError(f"Unsupported model type: {request.model_type}")
            
            with self._lock:
                self.generations[generation_id].success = True
                self.generations[generation_id].data = result
                self.generations[generation_id].status = "completed"
                
        except Exception as e:
            logger.error(f"Generation failed for {generation_id}: {e}")
            with self._lock:
                self.generations[generation_id].success = False
                self.generations[generation_id].error = str(e)
                self.generations[generation_id].status = "failed"
    
    def _generate_image(self, request: GenerationRequest) -> Dict[str, Any]:
        """Generate image from text prompt."""
        # This would integrate with actual image generation models
        # For now, return mock data
        return {
            "type": "image",
            "url": f"generated_image_{uuid.uuid4()}.png",
            "prompt": request.prompt,
            "parameters": request.parameters,
            "model_used": request.model_name or "default_image_model"
        }
    
    def _generate_audio(self, request: GenerationRequest) -> Dict[str, Any]:
        """Generate audio from text prompt."""
        return {
            "type": "audio",
            "url": f"generated_audio_{uuid.uuid4()}.wav",
            "prompt": request.prompt,
            "parameters": request.parameters,
            "model_used": request.model_name or "default_audio_model"
        }
    
    def _generate_video(self, request: GenerationRequest) -> Dict[str, Any]:
        """Generate video from text prompt."""
        return {
            "type": "video",
            "url": f"generated_video_{uuid.uuid4()}.mp4",
            "prompt": request.prompt,
            "parameters": request.parameters,
            "model_used": request.model_name or "default_video_model"
        }
    
    def _generate_text(self, request: GenerationRequest) -> Dict[str, Any]:
        """Generate text from prompt."""
        return {
            "type": "text",
            "content": f"Generated text based on: {request.prompt}",
            "prompt": request.prompt,
            "parameters": request.parameters,
            "model_used": request.model_name or "default_text_model"
        }
    
    def get_generation_status(self, generation_id: str) -> Optional[GenerationResponse]:
        """Get status of a generation."""
        with self._lock:
            return self.generations.get(generation_id)
    
    def cancel_generation(self, generation_id: str) -> bool:
        """Cancel a generation."""
        with self._lock:
            if generation_id in self.generations:
                self.generations[generation_id].status = "cancelled"
                return True
            return False
    
    def cleanup_completed(self):
        """Clean up completed generations."""
        with self._lock:
            to_remove = [
                gen_id for gen_id, response in self.generations.items()
                if response.status in ["completed", "failed", "cancelled"]
            ]
            for gen_id in to_remove:
                del self.generations[gen_id]


# Global generation manager
_generation_manager = GenerationManager()


def generate_content(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate content using AI models."""
    try:
        request = GenerationRequest(
            model_type=request_data["model_type"],
            prompt=request_data["prompt"],
            parameters=request_data.get("parameters", {}),
            model_name=request_data.get("model_name"),
            lora_name=request_data.get("lora_name")
        )
        
        generation_id = _generation_manager.start_generation(request)
        
        return {
            "generation_id": generation_id,
            "status": "started"
        }
        
    except Exception as e:
        logger.error(f"Failed to start generation: {e}")
        raise


def get_generation_status(generation_id: str) -> Dict[str, Any]:
    """Get the status of a generation."""
    response = _generation_manager.get_generation_status(generation_id)
    
    if response is None:
        raise ValueError(f"Generation {generation_id} not found")
    
    return asdict(response)


def cancel_generation(generation_id: str) -> bool:
    """Cancel a generation."""
    return _generation_manager.cancel_generation(generation_id)


def get_available_models() -> List[Dict[str, Any]]:
    """Get list of available models."""
    models = [
        ModelInfo(
            name="stable-diffusion-xl",
            model_type=ModelType.TEXT_TO_IMAGE.value,
            description="High-quality image generation model",
            parameters={
                "width": 1024,
                "height": 1024,
                "steps": 50,
                "guidance_scale": 7.5
            }
        ),
        ModelInfo(
            name="whisper-large",
            model_type=ModelType.TEXT_TO_AUDIO.value,
            description="Text-to-speech model",
            parameters={
                "voice": "default",
                "speed": 1.0,
                "quality": "high"
            }
        ),
        ModelInfo(
            name="llama-2-7b",
            model_type=ModelType.TEXT_GENERATION.value,
            description="Large language model for text generation",
            parameters={
                "max_tokens": 2048,
                "temperature": 0.7,
                "top_p": 0.9
            }
        ),
        ModelInfo(
            name="stable-video-diffusion",
            model_type=ModelType.TEXT_TO_VIDEO.value,
            description="Text-to-video generation model",
            parameters={
                "width": 576,
                "height": 320,
                "frames": 25,
                "fps": 8
            }
        )
    ]
    
    return [asdict(model) for model in models]


def get_available_loras() -> List[Dict[str, Any]]:
    """Get list of available LoRAs."""
    loras = [
        LoraInfo(
            name="anime-style",
            model_type=ModelType.TEXT_TO_IMAGE.value,
            description="Anime art style LoRA",
            strength=0.8
        ),
        LoraInfo(
            name="realistic-portrait",
            model_type=ModelType.TEXT_TO_IMAGE.value,
            description="Realistic portrait style LoRA",
            strength=0.7
        ),
        LoraInfo(
            name="cyberpunk",
            model_type=ModelType.TEXT_TO_IMAGE.value,
            description="Cyberpunk aesthetic LoRA",
            strength=0.9
        )
    ]
    
    return [asdict(lora) for lora in loras]


def initialize_backend() -> None:
    """Initialize the AI backend."""
    logger.info("Initializing AI backend...")
    
    # Create necessary directories
    Path("models").mkdir(exist_ok=True)
    Path("loras").mkdir(exist_ok=True)
    Path("outputs").mkdir(exist_ok=True)
    
    # Load model configurations
    # This would typically load from config files or databases
    
    logger.info("AI backend initialized successfully")


def cleanup_old_generations():
    """Clean up old completed generations."""
    _generation_manager.cleanup_completed() 