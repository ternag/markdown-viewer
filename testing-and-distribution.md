# Testing, Build System, and Distribution Guide

This document outlines the testing strategy, CI/CD pipeline, and distribution approach for the markdown viewer application.

## Testing Strategy

### What Should Be Tested

#### Rust Backend Tests
- **File operations**: Opening, reading, validating markdown files
- **Command handlers**: Tauri command functions (`open_file`, `get_file_content`)
- **Error handling**: Invalid file paths, permission errors, file not found
- **File watching**: Detecting changes, debouncing updates (when implemented)
- **Instance management**: Single instance per file enforcement

#### TypeScript Frontend Tests  
- **Markdown rendering**: Parsing correctness with various markdown features
- **Syntax highlighting**: Code block detection and highlighting
- **UI interactions**: File opening, search functionality (when implemented)
- **Error handling**: Network errors, file read failures
- **Utility functions**: File path validation, content diffing
- **State management**: Window state persistence and updates

#### Integration Tests
- **End-to-end workflows**: Open file → render → display
- **Cross-platform compatibility**: File paths, dialog behavior
- **Performance**: Large file handling, memory usage
- **File watching integration**: Backend file changes → frontend updates

### Test Implementation Plan

#### Rust Testing Setup
```bash
# Run Rust tests
cargo test

# Run with coverage
cargo tarpaulin --out Html
```

#### TypeScript Testing Setup
```bash
# Install test dependencies
npm install --save-dev jest @types/jest ts-jest

# Run TypeScript tests  
npm test

# Type checking
npm run type-check
```

#### Test Structure
```
tests/
├── rust/
│   ├── unit/
│   │   ├── file_operations.rs
│   │   ├── commands.rs
│   │   └── instance_manager.rs
│   └── integration/
│       └── end_to_end.rs
└── frontend/
    ├── unit/
    │   ├── markdown-renderer.test.ts
    │   ├── syntax-highlighter.test.ts
    │   └── file-manager.test.ts
    └── integration/
        └── app.test.ts
```

## GitHub Actions CI/CD Pipeline

### Pipeline Features
- **Multi-platform builds**: Windows, macOS, Linux simultaneously
- **Automated testing**: Run test suites on all platforms
- **Release automation**: Create GitHub releases with installers
- **Cross-compilation**: Build platform-specific binaries
- **Dependency caching**: Speed up builds with cargo and npm caches

### Workflow Structure

#### Main Build Workflow (`.github/workflows/build.yml`)
```yaml
name: Build and Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Setup Rust
      uses: dtolnay/rust-toolchain@stable
      
    - name: Cache Rust dependencies
      uses: actions/cache@v4
      with:
        path: |
          ~/.cargo/registry
          ~/.cargo/git
          src-tauri/target
        key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
    
    - name: Install dependencies
      run: npm install
      
    - name: Run TypeScript type check
      run: npm run type-check
      
    - name: Run frontend tests
      run: npm test
      
    - name: Run Rust tests
      run: cargo test
      working-directory: src-tauri
      
    - name: Build frontend
      run: npm run build
      
    - name: Build Tauri app (debug)
      run: npm run build:debug

  build-release:
    needs: test
    runs-on: ${{ matrix.os }}
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
    - uses: actions/checkout@v4
    # ... setup steps similar to test job ...
    
    - name: Build Tauri app (release)
      run: npm run build:release
      
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: release-${{ matrix.os }}
        path: src-tauri/target/release/bundle/
```

#### Release Workflow (`.github/workflows/release.yml`)
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
    - uses: actions/checkout@v4
    # ... build steps ...
    
    - name: Create Release
      uses: softprops/action-gh-release@v1
      with:
        files: |
          src-tauri/target/release/bundle/msi/*.msi
          src-tauri/target/release/bundle/deb/*.deb
          src-tauri/target/release/bundle/rpm/*.rpm
          src-tauri/target/release/bundle/dmg/*.dmg
          src-tauri/target/release/bundle/appimage/*.AppImage
        generate_release_notes: true
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Distribution Strategy

### Platform-Specific Package Outputs

#### Windows
- **`.msi` installer**: Windows Installer package for easy installation
- **`.exe` portable**: Standalone executable (optional)
- **Distribution**: Microsoft Store (future consideration)

#### macOS  
- **`.dmg` installer**: Disk image for drag-and-drop installation
- **`.app` bundle**: Application bundle included in DMG
- **Distribution**: Mac App Store (future consideration)
- **Code signing**: Required for distribution outside Mac App Store

#### Linux
- **`.deb` package**: Debian/Ubuntu package manager
- **`.rpm` package**: Red Hat/Fedora package manager  
- **`.AppImage`**: Portable application format
- **Distribution**: Direct download from GitHub releases

### GitHub Release Features
- **Automatic releases**: Triggered by version tags
- **Release assets**: Platform-specific installers uploaded automatically
- **Release notes**: Generated from commit messages and PR titles
- **Download statistics**: Track adoption across platforms
- **Update notifications**: Integration with Tauri's updater system

### Release Process
1. **Version bump**: Update version in `package.json` and `Cargo.toml`
2. **Create tag**: `git tag v1.0.0 && git push origin v1.0.0`
3. **Automatic build**: GitHub Actions builds all platforms
4. **Release creation**: Automatic GitHub release with installers
5. **User installation**: Users download platform-appropriate package

### Package Configuration

#### Tauri Configuration (`src-tauri/tauri.conf.json`)
```json
{
  "bundle": {
    "active": true,
    "targets": ["msi", "deb", "rpm", "dmg", "appimage"],
    "identifier": "com.example.markdown-viewer",
    "publisher": "Your Name",
    "icon": ["icons/32x32.png", "icons/128x128.png", "icons/icon.icns", "icons/icon.ico"],
    "resources": [],
    "externalBin": [],
    "copyright": "Copyright © 2024",
    "category": "Productivity",
    "shortDescription": "A lightweight, cross-platform markdown viewer",
    "longDescription": "A fast and lightweight markdown viewer for reading documentation and notes across Windows, macOS, and Linux.",
    "deb": {
      "depends": []
    },
    "macOS": {
      "frameworks": [],
      "minimumSystemVersion": "10.13"
    },
    "windows": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256",
      "timestampUrl": ""
    }
  }
}
```

## Development Commands

### Testing Commands
```bash
# Run all tests
npm run test:all           # (to be implemented)

# Frontend tests
npm test                   # (to be implemented)
npm run type-check         # TypeScript type checking

# Backend tests  
cargo test                 # Run Rust tests
cargo tarpaulin           # Run with coverage (optional)

# Integration tests
npm run test:e2e          # (to be implemented)
```

### Build Commands
```bash
# Development
npm run dev               # Start development server
cargo tauri dev          # Alternative development command

# Production builds
npm run build:release     # Build optimized release
npm run build:debug      # Build with debug symbols

# Platform-specific builds (local)
cargo tauri build --target x86_64-pc-windows-msvc  # Windows
cargo tauri build --target x86_64-apple-darwin     # macOS Intel  
cargo tauri build --target aarch64-apple-darwin    # macOS Apple Silicon
cargo tauri build --target x86_64-unknown-linux-gnu # Linux
```

### Release Commands
```bash
# Prepare release
npm version patch         # Bump patch version
npm version minor         # Bump minor version  
npm version major         # Bump major version

# Create release
git tag v1.0.0
git push origin v1.0.0   # Triggers GitHub Actions release workflow
```


## Auto-Update Strategy

The markdown viewer can implement automatic updates, but capabilities vary significantly by distribution method.

### Auto-Update Support by Distribution Type

#### ✅ **Full Auto-Update Support**
- **Windows MSI/EXE**: Tauri's built-in updater works seamlessly
- **macOS DMG/APP**: Full support with proper code signing
- **AppImage**: Can self-update by replacing the executable file

#### ⚠️ **Limited/Notification-Only Support**  
- **DEB packages**: Updates via `apt` - app can notify but not auto-install
- **RPM packages**: Updates via `dnf/yum` - notification only

### Tauri Auto-Updater Implementation

#### Backend Setup (`src-tauri/Cargo.toml`)
```toml
[dependencies]
tauri-plugin-updater = "2"
```

#### Backend Implementation (`src-tauri/src/main.rs`)
```rust
use tauri_plugin_updater::UpdaterExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // Check for updates on startup
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                check_for_updates(handle).await.ok();
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn check_for_updates(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        let mut downloaded = 0;
        
        // Download with progress tracking
        update.download_and_install(
            |chunk_length, content_length| {
                downloaded += chunk_length;
                println!("Downloaded {} of {:?}", downloaded, content_length);
                
                // Emit progress to frontend
                app.emit("update-progress", UpdateProgress {
                    downloaded,
                    total: content_length,
                }).ok();
            },
            || {
                println!("Download finished");
                app.emit("update-downloaded", ()).ok();
            },
        ).await?;
        
        println!("Update installed - restarting");
        app.restart();
    }
    Ok(())
}

#[derive(Clone, serde::Serialize)]
struct UpdateProgress {
    downloaded: usize,
    total: Option<usize>,
}

#[tauri::command]
async fn check_for_updates_manual(app: tauri::AppHandle) -> Result<bool, String> {
    match app.updater() {
        Ok(updater) => {
            match updater.check().await {
                Ok(Some(_update)) => Ok(true),
                Ok(None) => Ok(false),
                Err(e) => Err(format!("Update check failed: {}", e)),
            }
        },
        Err(e) => Err(format!("Updater not available: {}", e)),
    }
}
```

#### Frontend Implementation (`src/updater.ts`)
```typescript
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

interface UpdateProgress {
    downloaded: number;
    total?: number;
}

export class UpdateManager {
    private updateProgressCallback?: (progress: UpdateProgress) => void;

    constructor() {
        this.setupEventListeners();
    }

    private async setupEventListeners() {
        // Listen for update progress
        await listen('update-progress', (event) => {
            const progress = event.payload as UpdateProgress;
            this.updateProgressCallback?.(progress);
        });

        // Listen for download completion
        await listen('update-downloaded', () => {
            this.showRestartDialog();
        });
    }

    async checkForUpdates(): Promise<boolean> {
        try {
            return await invoke('check_for_updates_manual');
        } catch (error) {
            console.error('Update check failed:', error);
            return false;
        }
    }

    async detectDistributionMethod(): Promise<string> {
        // Detect how the app was installed to determine update strategy
        const platform = await import('@tauri-apps/api/core').then(m => m.platform());
        
        // Simple detection logic - could be enhanced
        if (platform === 'windows') return 'msi';
        if (platform === 'darwin') return 'dmg';
        if (platform === 'linux') {
            // Default to AppImage for Linux
            return 'appimage';
        }
        return 'unknown';
    }

    async handleUpdateCheck() {
        const distributionMethod = await this.detectDistributionMethod();
        const hasUpdate = await this.checkForUpdates();

        if (!hasUpdate) {
            this.showNoUpdateDialog();
            return;
        }

        switch (distributionMethod) {
            case 'msi':
            case 'dmg':
            case 'appimage':
                this.showAutoUpdateDialog();
                break;
            
            case 'deb':
                this.showManualUpdateDialog(
                    'Package Manager Update Required',
                    'Run: sudo apt update && sudo apt upgrade markdown-viewer'
                );
                break;
                
            case 'rpm':
                this.showManualUpdateDialog(
                    'Package Manager Update Required', 
                    'Run: sudo dnf update markdown-viewer'
                );
                break;
                
            default:
                this.showGenericUpdateDialog();
        }
    }

    private showAutoUpdateDialog() {
        // Show dialog with "Update Now" button
        const dialog = document.createElement('div');
        dialog.innerHTML = `
            <div class="update-dialog">
                <h3>Update Available</h3>
                <p>A new version is available. Update now?</p>
                <div class="update-progress" style="display: none;">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <span class="progress-text">Downloading...</span>
                </div>
                <div class="dialog-buttons">
                    <button id="update-now">Update Now</button>
                    <button id="update-later">Later</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        dialog.querySelector('#update-now')?.addEventListener('click', () => {
            this.startAutoUpdate();
        });
    }

    private showManualUpdateDialog(title: string, instruction: string) {
        const dialog = document.createElement('div');
        dialog.innerHTML = `
            <div class="update-dialog">
                <h3>${title}</h3>
                <p>A new version is available.</p>
                <code>${instruction}</code>
                <div class="dialog-buttons">
                    <button id="copy-command">Copy Command</button>
                    <button id="close-dialog">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        dialog.querySelector('#copy-command')?.addEventListener('click', () => {
            navigator.clipboard.writeText(instruction.replace('Run: ', ''));
        });
    }

    onUpdateProgress(callback: (progress: UpdateProgress) => void) {
        this.updateProgressCallback = callback;
    }

    private async startAutoUpdate() {
        // Auto-update process is handled by the backend
        // Just show progress UI
        const progressEl = document.querySelector('.update-progress') as HTMLElement;
        if (progressEl) {
            progressEl.style.display = 'block';
        }
    }

    private showRestartDialog() {
        const dialog = document.createElement('div');
        dialog.innerHTML = `
            <div class="update-dialog">
                <h3>Update Complete</h3>
                <p>Update installed successfully. Restart to apply changes.</p>
                <div class="dialog-buttons">
                    <button id="restart-now">Restart Now</button>
                    <button id="restart-later">Restart Later</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
    }
}
```

### Configuration for Auto-Updates

#### Update Server Configuration (`src-tauri/tauri.conf.json`)
```json
{
  "bundle": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://github.com/yourusername/markdown-viewer/releases/latest/download/latest.json"
      ],
      "dialog": false,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

#### GitHub Release Workflow Enhancement
Update the release workflow to generate the update manifest:

```yaml
- name: Generate update manifest
  run: |
    cat > latest.json << EOF
    {
      "version": "${{ github.ref_name }}",
      "notes": "See the assets to download this version and install.",
      "pub_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
      "platforms": {
        "windows-x86_64": {
          "signature": "",
          "url": "https://github.com/${{ github.repository }}/releases/download/${{ github.ref_name }}/markdown-viewer_${{ github.ref_name }}_x64_en-US.msi.zip"
        },
        "darwin-x86_64": {
          "signature": "",
          "url": "https://github.com/${{ github.repository }}/releases/download/${{ github.ref_name }}/markdown-viewer_${{ github.ref_name }}_x64.dmg.tar.gz"
        },
        "linux-x86_64": {
          "signature": "",
          "url": "https://github.com/${{ github.repository }}/releases/download/${{ github.ref_name }}/markdown-viewer_${{ github.ref_name }}_amd64.AppImage.tar.gz"
        }
      }
    }
    EOF

- name: Upload update manifest
  uses: softprops/action-gh-release@v1
  with:
    files: latest.json
```

### Recommended Hybrid Strategy

1. **Enable auto-updates** for portable formats (MSI, DMG, AppImage)
2. **Show update notifications** with instructions for package managers
3. **Periodic update checks** (daily or weekly)
4. **Manual update check** in Help menu

### Security Considerations

- **Code signing**: Required for Windows/macOS auto-updates
- **Public key validation**: Prevents malicious updates
- **HTTPS endpoints**: Secure update manifest delivery
- **Signature verification**: Ensures update authenticity

This approach provides the best user experience across all distribution methods while respecting each platform's update mechanisms.

## Implementation Priority

### Phase 1: Testing Infrastructure
1. Set up Rust unit tests for file operations and commands
2. Set up TypeScript/Jest testing for frontend components
3. Add test scripts to `package.json`
4. Create basic CI workflow for testing

### Phase 2: Build Automation  
1. Implement GitHub Actions workflow for multi-platform builds
2. Configure Tauri bundle settings for all platforms
3. Test build artifacts on each target platform
4. Set up artifact upload and storage

### Phase 3: Distribution Pipeline
1. Implement release automation workflow
2. Configure code signing for macOS/Windows (if needed)
3. Test end-to-end release process
4. Document installation instructions for users

### Phase 4: Enhanced Features
1. Implement automatic updater system (see Auto-Update Strategy section)
2. Add build notifications and monitoring
3. Consider additional distribution channels (future):
   - **AUR**: Create PKGBUILD for Arch User Repository
4. Implement telemetry for usage analytics (optional)

## Success Metrics

- **Test Coverage**: >80% code coverage for critical paths
- **Build Time**: <10 minutes for full multi-platform build
- **Package Size**: <50MB per platform installer
- **Cross-platform**: Successful builds and tests on all target platforms
- **Release Automation**: Zero-touch releases from git tag to published packages