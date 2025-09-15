mod ai;
mod engine;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            ai::generate_content,
            ai::get_available_models,
            ai::get_available_loras,
            ai::get_generation_status,
            ai::cancel_generation,
            ai::initialize_ai_backend,
            engine::create_tab,
            engine::destroy_tab,
            engine::load_url,
            engine::go_back,
            engine::go_forward,
            engine::reload_tab,
            engine::get_nav_state,
            engine::open_devtools,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
