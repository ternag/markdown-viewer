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

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    fn create_test_app_state() -> AppState {
        AppState {
            open_files: Mutex::new(HashMap::new()),
        }
    }

    #[tokio::test]
    async fn test_get_cli_args() {
        let result = get_cli_args().await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), vec![] as Vec<String>);
    }

    #[tokio::test]
    async fn test_file_registration_flow() {
        let state = create_test_app_state();
        let test_path = "/test/path/file.md".to_string();

        // Test the state logic directly without Tauri State wrapper
        // Initially file should not be open
        {
            let open_files = state.open_files.lock().unwrap();
            assert_eq!(open_files.get(&test_path), None);
        }

        // Register file as open
        {
            let mut open_files = state.open_files.lock().unwrap();
            open_files.insert(test_path.clone(), true);
        }

        // Now file should be open
        {
            let open_files = state.open_files.lock().unwrap();
            assert_eq!(open_files.get(&test_path), Some(&true));
        }

        // Unregister file
        {
            let mut open_files = state.open_files.lock().unwrap();
            open_files.remove(&test_path);
        }

        // File should no longer be open
        {
            let open_files = state.open_files.lock().unwrap();
            assert_eq!(open_files.get(&test_path), None);
        }
    }

    #[tokio::test]
    async fn test_multiple_files_registration() {
        let state = create_test_app_state();
        let file1 = "/test/file1.md".to_string();
        let file2 = "/test/file2.md".to_string();

        // Register multiple files
        {
            let mut open_files = state.open_files.lock().unwrap();
            open_files.insert(file1.clone(), true);
            open_files.insert(file2.clone(), true);
        }

        // Both should be registered
        {
            let open_files = state.open_files.lock().unwrap();
            assert_eq!(open_files.get(&file1), Some(&true));
            assert_eq!(open_files.get(&file2), Some(&true));
        }

        // Unregister one file
        {
            let mut open_files = state.open_files.lock().unwrap();
            open_files.remove(&file1);
        }

        // Only file2 should be registered
        {
            let open_files = state.open_files.lock().unwrap();
            assert_eq!(open_files.get(&file1), None);
            assert_eq!(open_files.get(&file2), Some(&true));
        }
    }

    #[tokio::test]
    async fn test_activate_existing_window() {
        let result = activate_existing_window("/test/path.md".to_string()).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_read_file_content_success() {
        // Create a temporary file with test content
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test.md");
        let test_content = "# Test Markdown\n\nThis is test content.";
        
        fs::write(&file_path, test_content).unwrap();

        let result = read_file_content(file_path.to_string_lossy().to_string()).await;
        
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), test_content);
    }

    #[tokio::test]
    async fn test_read_file_content_file_not_found() {
        let result = read_file_content("/non/existent/file.md".to_string()).await;
        
        assert!(result.is_err());
        let error = result.unwrap_err();
        assert!(error.contains("Failed to read file"));
        assert!(error.contains("/non/existent/file.md"));
    }

    #[tokio::test]
    async fn test_read_file_content_empty_file() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("empty.md");
        
        fs::write(&file_path, "").unwrap();

        let result = read_file_content(file_path.to_string_lossy().to_string()).await;
        
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "");
    }

    #[tokio::test]
    async fn test_read_file_content_large_file() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("large.md");
        let large_content = "# Large File\n".repeat(1000);
        
        fs::write(&file_path, &large_content).unwrap();

        let result = read_file_content(file_path.to_string_lossy().to_string()).await;
        
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), large_content);
    }

    #[test]
    fn test_file_info_serialization() {
        let file_info = FileInfo {
            path: "/test/path.md".to_string(),
            name: "path.md".to_string(),
        };

        let serialized = serde_json::to_string(&file_info).unwrap();
        let deserialized: FileInfo = serde_json::from_str(&serialized).unwrap();

        assert_eq!(file_info.path, deserialized.path);
        assert_eq!(file_info.name, deserialized.name);
    }

    #[test]
    fn test_app_state_creation() {
        let state = create_test_app_state();
        let open_files = state.open_files.lock().unwrap();
        assert!(open_files.is_empty());
    }
}
