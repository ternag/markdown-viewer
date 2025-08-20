use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub path: String,
    pub name: String,
}

pub struct AppState {
    pub open_files: Mutex<HashMap<String, bool>>,
}

#[tauri::command]
pub async fn get_cli_args() -> Result<Vec<String>, String> {
    // For now, return empty vector - CLI args will be handled by Tauri automatically
    Ok(vec![])
}

#[tauri::command]
pub async fn check_file_already_open(
    path: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let open_files = state.open_files.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    Ok(open_files.get(&path).copied().unwrap_or(false))
}

#[tauri::command]
pub async fn register_file_open(
    path: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut open_files = state.open_files.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    open_files.insert(path, true);
    Ok(())
}

#[tauri::command]
pub async fn unregister_file_open(
    path: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut open_files = state.open_files.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    open_files.remove(&path);
    Ok(())
}

#[tauri::command]
pub async fn activate_existing_window(
    _path: String,
) -> Result<(), String> {
    // For MVP, we'll just log this - proper window activation would require
    // more complex inter-process communication
    log::info!("Request to activate window for file: {}", _path);
    Ok(())
}

#[tauri::command]
pub async fn open_file_dialog(app: tauri::AppHandle) -> Result<Option<String>, String> {
    println!("open_file_dialog command called");
    
    // Use the dialog plugin properly
    use tauri_plugin_dialog::DialogExt;
    
    let file_path = app.dialog()
        .file()
        .add_filter("Markdown", &["md", "markdown", "txt"])
        .blocking_pick_file();
    
    match file_path {
        Some(path) => {
            println!("Selected file: {:?}", path);
            Ok(Some(path.to_string()))
        },
        None => {
            println!("No file selected");
            Ok(None)
        }
    }
}

#[tauri::command]
pub async fn read_file_content(path: String) -> Result<String, String> {
    println!("read_file_content called for: {}", path);
    
    use std::fs;
    
    match fs::read_to_string(&path) {
        Ok(content) => {
            println!("Successfully read file: {} ({} bytes)", path, content.len());
            Ok(content)
        },
        Err(e) => {
            let error_msg = format!("Failed to read file {}: {}", path, e);
            println!("{}", error_msg);
            Err(error_msg)
        }
    }
}