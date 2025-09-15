#[tauri::command]
pub async fn create_tab(engine: String, _container_id: String, url: String) -> Result<String, String> {
    println!("Creating tab in engine: {} -> {}", engine, url);
    Ok(format!("{}-tab-1", engine))
}

#[tauri::command]
pub async fn destroy_tab(tab_id: String) -> Result<(), String> {
    println!("Destroy tab: {}", tab_id);
    Ok(())
}

#[tauri::command]
pub async fn load_url(tab_id: String, url: String) -> Result<(), String> {
    println!("Load URL {} in tab {}", url, tab_id);
    Ok(())
}

#[tauri::command]
pub async fn go_back(tab_id: String) -> Result<(), String> {
    println!("Go back in {}", tab_id);
    Ok(())
}

#[tauri::command]
pub async fn go_forward(tab_id: String) -> Result<(), String> {
    println!("Go forward in {}", tab_id);
    Ok(())
}

#[tauri::command]
pub async fn reload_tab(tab_id: String, hard: Option<bool>) -> Result<(), String> {
    println!("Reload {} hard? {:?}", tab_id, hard);
    Ok(())
}

#[tauri::command]
pub async fn get_nav_state(_tab_id: String) -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "url": "about:blank",
        "canGoBack": false,
        "canGoForward": false
    }))
}

#[tauri::command]
pub async fn open_devtools(tab_id: String) -> Result<(), String> {
    println!("Open devtools in {}", tab_id);
    Ok(())
}
