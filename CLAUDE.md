# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a markdown viewer application designed to be a lightweight, cross-platform tool for reading markdown files. The primary use case is displaying markdown content in a scrollable window that can be used as a reference while working in other applications.

## Key Project Characteristics

- **Not an editor**: This is a viewer-only application - no editing capabilities
- **Cross-platform**: Targets Windows, Mac, and Linux
- **Lightweight and fast**: Performance is a key requirement
- **File watching**: Automatically updates display when source markdown files change
- **Multi-instance support**: Multiple documents can be viewed simultaneously, one per window

## Core Features to Implement

Based on the requirements.md, the application should support:

### MVP Features
- Open and render markdown files
- Cross-platform compatibility

### Key Features
- File watching with automatic updates
- Recent files management
- Multiple application instances (one document per window)
- Content selection
- Multiple markdown dialect support
- Syntax highlighting for code snippets (with support for many languages)
- Single instance per file (activate existing window if file already open)
- Search functionality
- Keyboard shortcuts
- Trackpad/mouse gestures (scroll, zoom)
- Comprehensive settings system

### Nice-to-Have Features
- "Always on top" window option
- Customizable presentation styles
- Visual markers for updated content
- Zoom/font size accessibility options
- Dark/light theme support
- Table of contents navigation
- File association capabilities

## Technical Architecture

### Technology Stack
- **Framework**: Tauri (Rust backend + web frontend)
- **Language**: Rust for backend, TypeScript/HTML/CSS for frontend (vanilla TS, no framework)
- **Markdown Parsing**: `markdown-it` (frontend) - chosen for better interactive features
- **Syntax Highlighting**: Prism.js with dynamic language loading for optimal bundle size
- **Document Diffing**: `fast-diff` for incremental content updates
- **File Watching**: `notify` crate with debouncing
- **State Management**: Simple per-window state + global instance tracking
- **Instance Management**: IPC or file-based communication to track open files

### Architecture Patterns

#### Backend (Rust)
- **Command Pattern**: Simple Tauri commands for file operations
  ```rust
  #[tauri::command]
  async fn open_file(path: String) -> Result<String, String>
  
  #[tauri::command]
  async fn check_file_already_open(path: String) -> Result<bool, String>
  
  #[tauri::command]
  async fn activate_existing_window(path: String) -> Result<(), String>
  ```
- **Singleton Pattern**: Single instance per file management
- **Observer Pattern**: File watching with debounced updates (200ms) per window

#### Frontend
- **Component-Based Design**: Single-window focused UI components
  - DocumentViewer, Toolbar, SearchPanel, SettingsPanel
- **Module Pattern**: Separated concerns with TypeScript
  - `markdown-renderer.ts`, `file-watcher.ts`, `settings-manager.ts`, `search-engine.ts`
- **Incremental Updates**: Text-level diffing for partial document updates (preserves scroll, selection)
- **State Management**: Type-safe per-window state
  ```typescript
  interface WindowState {
    currentFile: string | null;
    fileContent: string;
    searchResults: SearchResult[];
    settings: AppSettings;
  }
  ```

#### Single-Instance-Per-File Architecture
- Each window displays exactly one document
- Global tracking of open files to prevent duplicates
- Window activation instead of creating new instances for same file
- Independent file watchers per window
- No inter-window communication needed (except for instance checking)

### Development Commands

Once implementation begins:
```bash
# Development
cargo tauri dev

# Build
cargo tauri build

# Test
cargo test

# TypeScript compilation and tests
npm run build
npm test
```

### Project Structure (Planned)
```
src-tauri/          # Rust backend
├── src/
│   ├── main.rs
│   ├── commands/   # Simple Tauri commands
│   ├── file/       # File operations & watching
│   └── instance/   # Single-instance-per-file management
├── Cargo.toml
└── tauri.conf.json

src/                # Frontend (TypeScript)
├── components/     # UI component classes
├── modules/        # Business logic modules
├── types/          # TypeScript interfaces
├── styles/         # CSS/styling
├── index.html
└── tsconfig.json
```

## MVP Development Plan

### MVP Scope
**Core Features (MVP):**
- Open and display markdown files (file dialog + CLI args)
- Basic markdown rendering with syntax highlighting
- Cross-platform compatibility
- Single instance per file enforcement

**Deferred to Phase 2:**
- File watching with automatic updates
- Search functionality
- Incremental document updates
- Custom themes/settings
- Recent files management

### Development Phases

#### Phase 1: Project Setup
- Initialize Tauri project with TypeScript
- Set up build pipeline and development environment
- Create basic window structure and file organization
- Test cross-platform development setup

**Milestone 1:** "Hello World" - Tauri app opens with basic window

#### Phase 2: Core Functionality
- Implement file opening (dialog + CLI arguments)
- Set up markdown-it parsing pipeline
- Basic HTML rendering and content display
- Ensure text selection works properly

**Milestone 2:** "File Operations" - Can open and display markdown files

#### Phase 3: Polish & Distribution
- Implement single instance per file logic
- Add syntax highlighting with Prism.js
- Basic styling, layout, and user experience polish
- Cross-platform build scripts and packaging

**Milestone 3:** "Production Ready" - Fully functional MVP ready for distribution

### Success Criteria
- Opens markdown files from file dialog or command line
- Displays properly formatted markdown with syntax highlighting
- Prevents duplicate windows for same file
- Runs on Windows, macOS, and Linux
- Lightweight and responsive performance

### Post-MVP Features (Stage 2)
- File watching with automatic updates
- Search functionality with highlighting
- Incremental document updates
- Settings panel and custom themes
- Recent files management


## Git Guidelines

**General guidelines:**
- **Commit format**: `git commit -m "Short title" -m "Detailed body"`
- **Branch naming**: lowercase-with-hyphens (e.g., `feature/websocket-support`)
- **Max commit title**: 72 characters
- **Branch creation**: Create feature branches when committing from master
- **Imperative mood**: Use "Add", "Fix", "Update" (not "Added", "Fixed", "Updated")
- **Include task numbers** from the implementation plan
