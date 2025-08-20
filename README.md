# Markdown Viewer MVP

A lightweight, cross-platform markdown viewer built with Tauri and TypeScript.

## ✅ MVP Features Completed

### Core Functionality
- **File Opening**: Open markdown files via file dialog or CLI arguments
- **Markdown Rendering**: Full markdown support using markdown-it parser
- **Syntax Highlighting**: Code blocks with Prism.js for 12+ languages
- **Text Selection**: Native browser text selection and copying
- **Cross-platform**: Runs on Windows, macOS, and Linux

### User Experience
- **Clean Interface**: Minimal, distraction-free reading experience
- **Responsive Layout**: Adapts to window resizing
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd+O`: Open file
  - `F5`: Reload current file
  - `Shift+?`: Show/hide keyboard shortcuts
- **Loading States**: Visual feedback during file operations
- **Error Handling**: Clear error messages for file issues

### Technical Features
- **Single Instance Per File**: Prevents duplicate windows for same file
- **Instance Management**: Global tracking of open files
- **Performance**: Optimized bundle with dynamic language loading
- **TypeScript**: Full type safety throughout the codebase

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Building
```bash
# Build frontend only
npm run build

# Build complete application (debug)
npm run build:debug

# Build for release
npm run build:release
```

### Testing
```bash
# Test with sample file
# Open the application and load test.md
```

## 📁 Project Structure

```
├── src/                    # Frontend TypeScript code
│   ├── main.ts            # Main application logic
│   ├── markdown-renderer.ts # Markdown parsing
│   ├── syntax-highlighter.ts # Code highlighting
│   ├── file-manager.ts    # File operations
│   ├── types.ts           # Type definitions
│   ├── index.html         # Main HTML template
│   └── styles.css         # Application styling
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── main.rs        # Entry point
│   │   ├── lib.rs         # Application setup
│   │   └── commands.rs    # Tauri commands
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── dist/                  # Built frontend assets
├── test.md               # Sample markdown file
└── package.json          # Node.js configuration
```

## 🛠 Technology Stack

### Frontend
- **TypeScript**: Type-safe JavaScript
- **Vanilla JS**: No framework dependencies
- **markdown-it**: Markdown parsing and rendering
- **Prism.js**: Syntax highlighting for code blocks

### Backend
- **Rust**: High-performance, memory-safe backend
- **Tauri**: Cross-platform app framework
- **tauri-plugin-fs**: File system operations
- **tauri-plugin-dialog**: Native file dialogs

### Build System
- **TypeScript Compiler**: Frontend compilation
- **Cargo**: Rust compilation and dependency management
- **Tauri CLI**: Application bundling and distribution

## 📋 MVP Requirements Met

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Open markdown files | ✅ | File dialog + CLI support |
| Cross-platform compatibility | ✅ | Tauri framework |
| Markdown rendering | ✅ | markdown-it parser |
| Syntax highlighting | ✅ | Prism.js integration |
| Single instance per file | ✅ | Rust-based instance tracking |
| Text selection | ✅ | Native browser selection |
| Clean interface | ✅ | Custom CSS styling |
| Keyboard shortcuts | ✅ | Event handling |
| Error handling | ✅ | Try-catch with user feedback |
| Build pipeline | ✅ | npm + cargo scripts |

## 🎯 Success Criteria Achieved

- ✅ Opens markdown files from file dialog or command line
- ✅ Displays properly formatted markdown with syntax highlighting  
- ✅ Prevents duplicate windows for same file
- ✅ Runs on Windows, macOS, and Linux
- ✅ Lightweight and responsive performance
- ✅ Professional user experience with loading states and shortcuts

## 🔮 Future Enhancements (Post-MVP)

The following features are planned for future releases:
- File watching with automatic updates
- Search functionality with highlighting
- Custom themes and settings panel
- Recent files management
- Table of contents navigation
- Zoom/font size controls

## 📄 License

This project is built as an MVP demonstration. See individual dependency licenses for third-party components.