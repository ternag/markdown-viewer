mod commands;

use commands::{AppState, get_cli_args, check_file_already_open, register_file_open, unregister_file_open, activate_existing_window, open_file_dialog, read_file_content};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{menu::{Menu, MenuItem, Submenu, MenuId}, Emitter};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .manage(AppState {
      open_files: Mutex::new(HashMap::new()),
    })
    .invoke_handler(tauri::generate_handler![
      get_cli_args,
      check_file_already_open,
      register_file_open,
      unregister_file_open,
      activate_existing_window,
      open_file_dialog,
      read_file_content
    ])
    .on_menu_event(|app, event| {
      match event.id() {
        id if id == &MenuId::new("open_file") => {
          // Emit an event to the frontend to trigger file open
          if let Err(e) = app.emit("menu-open-file", ()) {
            eprintln!("Failed to emit menu event: {}", e);
          }
        }
        id if id == &MenuId::new("about") => {
          // Emit an event to show about dialog
          if let Err(e) = app.emit("menu-about", ()) {
            eprintln!("Failed to emit about event: {}", e);
          }
        }
        id if id == &MenuId::new("quit") => {
          // Quit the application
          app.exit(0);
        }
        _ => {}
      }
    })
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      
      // Create menu in setup where we have access to app handle
      
      // App menu items (appears under "Markdown Viewer" on macOS)
      let about_item = MenuItem::with_id(app, MenuId::new("about"), "About Markdown Viewer", true, None::<&str>)?;
      let quit_item = MenuItem::with_id(app, MenuId::new("quit"), "Quit", true, Some("CmdOrCtrl+Q"))?;
      let app_menu = Submenu::with_id_and_items(app, MenuId::new("app_menu"), "Markdown Viewer", true, &[&about_item, &quit_item])?;
      
      // File menu
      let open_file_item = MenuItem::with_id(app, MenuId::new("open_file"), "Open File...", true, Some("CmdOrCtrl+O"))?;
      let file_menu = Submenu::with_id_and_items(app, MenuId::new("file"), "File", true, &[&open_file_item])?;
      
      let menu = Menu::with_items(app, &[&app_menu, &file_menu])?;
      app.set_menu(menu)?;
      
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
