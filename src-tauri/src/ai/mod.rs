use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct GenerationRequest {
    pub model_type: String, // "text-to-image", "text-to-audio", "text-to-video", "text-generation"
    pub prompt: String,
    pub parameters: serde_json::Value,
    pub model_name: Option<String>,
    pub lora_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GenerationResponse {
    pub success: bool,
    pub data: Option<serde_json::Value>,
    pub error: Option<String>,
    pub generation_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ModelInfo {
    pub name: String,
    pub model_type: String,
    pub description: String,
    pub parameters: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoraInfo {
    pub name: String,
    pub model_type: String,
    pub description: String,
    pub strength: f32,
}

/// Generate content using the Python AI backend
#[tauri::command]
pub async fn generate_content(
    request: GenerationRequest,
    app_handle: tauri::AppHandle,
) -> Result<GenerationResponse, String> {
    let _generation_id = uuid::Uuid::new_v4().to_string();

    // Get the Python backend path
    let python_path = get_python_backend_path(&app_handle)?;

    // Prepare the command to call Python backend
    let result = Command::new("python")
        .arg(python_path)
        .arg("generate")
        .arg(serde_json::to_string(&request).map_err(|e| e.to_string())?)
        .output()
        .map_err(|e| format!("Failed to execute Python backend: {}", e))?;

    if result.status.success() {
        let response: GenerationResponse = serde_json::from_slice(&result.stdout)
            .map_err(|e| format!("Failed to parse Python response: {}", e))?;

        Ok(response)
    } else {
        let error = String::from_utf8_lossy(&result.stderr);
        Err(format!("Python backend error: {}", error))
    }
}

/// Get available models from the Python backend
#[tauri::command]
pub async fn get_available_models(app_handle: tauri::AppHandle) -> Result<Vec<ModelInfo>, String> {
    let python_path = get_python_backend_path(&app_handle)?;

    let result = Command::new("python")
        .arg(python_path)
        .arg("list-models")
        .output()
        .map_err(|e| format!("Failed to execute Python backend: {}", e))?;

    if result.status.success() {
        let models: Vec<ModelInfo> = serde_json::from_slice(&result.stdout)
            .map_err(|e| format!("Failed to parse models response: {}", e))?;

        Ok(models)
    } else {
        let error = String::from_utf8_lossy(&result.stderr);
        Err(format!("Python backend error: {}", error))
    }
}

/// Get available LoRAs from the Python backend
#[tauri::command]
pub async fn get_available_loras(app_handle: tauri::AppHandle) -> Result<Vec<LoraInfo>, String> {
    let python_path = get_python_backend_path(&app_handle)?;

    let result = Command::new("python")
        .arg(python_path)
        .arg("list-loras")
        .output()
        .map_err(|e| format!("Failed to execute Python backend: {}", e))?;

    if result.status.success() {
        let loras: Vec<LoraInfo> = serde_json::from_slice(&result.stdout)
            .map_err(|e| format!("Failed to parse LoRAs response: {}", e))?;

        Ok(loras)
    } else {
        let error = String::from_utf8_lossy(&result.stderr);
        Err(format!("Python backend error: {}", error))
    }
}

/// Get generation status
#[tauri::command]
pub async fn get_generation_status(
    generation_id: String,
    app_handle: tauri::AppHandle,
) -> Result<GenerationResponse, String> {
    let python_path = get_python_backend_path(&app_handle)?;

    let result = Command::new("python")
        .arg(python_path)
        .arg("status")
        .arg(generation_id)
        .output()
        .map_err(|e| format!("Failed to execute Python backend: {}", e))?;

    if result.status.success() {
        let response: GenerationResponse = serde_json::from_slice(&result.stdout)
            .map_err(|e| format!("Failed to parse status response: {}", e))?;

        Ok(response)
    } else {
        let error = String::from_utf8_lossy(&result.stderr);
        Err(format!("Python backend error: {}", error))
    }
}

/// Cancel a generation
#[tauri::command]
pub async fn cancel_generation(
    generation_id: String,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let python_path = get_python_backend_path(&app_handle)?;

    let result = Command::new("python")
        .arg(python_path)
        .arg("cancel")
        .arg(generation_id)
        .output()
        .map_err(|e| format!("Failed to execute Python backend: {}", e))?;

    if result.status.success() {
        Ok(())
    } else {
        let error = String::from_utf8_lossy(&result.stderr);
        Err(format!("Python backend error: {}", error))
    }
}

/// Get the path to the Python backend script
fn get_python_backend_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let resource_path = app_handle
        .path()
        .resource_dir()
        .map_err(|e| format!("Could not get resource directory: {}", e))?
        .join("src/python/src/playai/cli.py");

    Ok(resource_path)
}

/// Initialize the AI backend
#[tauri::command]
pub async fn initialize_ai_backend(app_handle: tauri::AppHandle) -> Result<(), String> {
    let python_path = get_python_backend_path(&app_handle)?;

    let result = Command::new("python")
        .arg(python_path)
        .arg("init")
        .output()
        .map_err(|e| format!("Failed to initialize Python backend: {}", e))?;

    if result.status.success() {
        Ok(())
    } else {
        let error = String::from_utf8_lossy(&result.stderr);
        Err(format!("Python backend initialization error: {}", error))
    }
}
