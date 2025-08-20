# Important
This is just me testing and learning AI coding tools, and working with github. Though it might be a useful app to some, it is not a meant as production ready application. Just a learning project. There are plenty of markdown viewers and editors to choose from.

# Markdown Viewer MVP

A lightweight, cross-platform markdown viewer for the Desktop, built with Tauri and TypeScript.

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

## 📦 Creating a Release

This project includes automated CI/CD for creating releases with installers for all platforms.

### Step-by-Step Release Process

1. **Ensure CI passes**: Make sure all tests pass on the main branch
   ```bash
   # Check current status
   gh run list --limit 5
   ```

2. **Update version and create tag**:
   ```bash
   # Option A: Using npm (recommended)
   npm version patch    # 0.1.0 → 0.1.1 (bug fixes)
   npm version minor    # 0.1.0 → 0.2.0 (new features)
   npm version major    # 0.1.0 → 1.0.0 (breaking changes)
   
   # Option B: Manual git tag
   git tag v1.0.0
   ```

3. **Push tag to trigger release**:
   ```bash
   git push origin main --tags
   ```

4. **Monitor release build**:
   ```bash
   # Watch the release workflow
   gh run watch
   
   # Or view in browser
   gh repo view --web
   ```

### What Gets Created

The automated release process generates:

- **Windows**: `.msi` installer package
- **macOS**: `.dmg` disk image with app bundle
- **Linux**: 
  - `.deb` package (Debian/Ubuntu)
  - `.rpm` package (Red Hat/Fedora)
  - `.AppImage` portable application
- **Update manifest**: `latest.json` for auto-updater support
- **GitHub release page** with download links and release notes

### Release Workflow Details

- **Trigger**: Any git tag matching `v*` pattern (e.g., `v1.0.0`, `v0.2.1`)
- **Platforms**: Builds simultaneously on Ubuntu, Windows, and macOS
- **Testing**: Runs complete test suite before building
- **Distribution**: Uploads all installers to GitHub release assets
- **Automation**: Zero-touch process once tag is pushed

### Example Release Commands

```bash
# Create version 1.0.0 release
npm version major                    # Updates package.json to 1.0.0 and creates git tag
git push origin main --tags         # Triggers GitHub Actions release workflow

# Create patch release  
npm version patch                    # 1.0.0 → 1.0.1
git push origin main --tags

# View release status
gh release list                      # List all releases
gh release view v1.0.0 --web       # Open release page in browser
```

### Testing Release Process

To test the release workflow without creating a permanent release:

```bash
# Create test tag
git tag v0.1.0-test
git push origin v0.1.0-test

# Delete test release after verification
gh release delete v0.1.0-test
git tag -d v0.1.0-test
git push origin :refs/tags/v0.1.0-test
```

## 📄 License

This project is built as an MVP demonstration. See individual dependency licenses for third-party components.