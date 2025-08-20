# Build System Guide

This document explains how to build and distribute the Markdown Viewer application.

## Prerequisites

### Development Environment
- **Node.js 18+**: For frontend development and build tools
- **Rust**: Latest stable version for Tauri backend
- **Platform-specific dependencies**:
  - **Ubuntu/Debian**: `libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf`
  - **Windows**: Visual Studio Build Tools or Visual Studio Community
  - **macOS**: Xcode Command Line Tools

### Installation
```bash
# Install Node.js dependencies
npm install

# Install Rust dependencies (handled automatically by Cargo)
```

## Build Commands

### Development Builds
```bash
# Run in development mode (with hot reload)
npm run dev
# OR
cargo tauri dev

# Build frontend only
npm run build

# Build debug version of the app
npm run build:debug
```

### Production Builds
```bash
# Build optimized release version
npm run build:release

# Platform-specific builds (advanced)
cargo tauri build --target x86_64-pc-windows-msvc  # Windows
cargo tauri build --target x86_64-apple-darwin     # macOS Intel  
cargo tauri build --target aarch64-apple-darwin    # macOS Apple Silicon
cargo tauri build --target x86_64-unknown-linux-gnu # Linux
```

## Build Artifacts

### Debug Builds (`src-tauri/target/debug/bundle/`)
- **macOS**: `.app` bundle and `.dmg` installer
- **Windows**: `.exe` and `.msi` installer
- **Linux**: `.deb`, `.rpm`, and `.AppImage` packages

### Release Builds (`src-tauri/target/release/bundle/`)
- Same structure as debug builds but optimized for production
- Smaller file sizes and better performance
- Used for distribution

## CI/CD Pipeline

### GitHub Actions Workflows

#### Build and Test (`.github/workflows/build.yml`)
- **Triggers**: Push to `main`/`develop` branches, pull requests to `main`
- **Platforms**: Ubuntu, Windows, macOS
- **Steps**:
  1. Run all tests (frontend + backend)
  2. Build debug version for validation
  3. Upload artifacts for main branch pushes

#### Release (`.github/workflows/release.yml`)
- **Triggers**: Git tags matching `v*` (e.g., `v1.0.0`)
- **Platforms**: Ubuntu, Windows, macOS  
- **Steps**:
  1. Run complete test suite
  2. Build production releases for all platforms
  3. Generate update manifest
  4. Create GitHub release with installers

### Artifact Storage
- **Development builds**: Stored for 30 days as GitHub Actions artifacts
- **Release builds**: Permanently stored as GitHub release assets
- **Update manifests**: Generated for auto-updater support

## Distribution Packages

### Platform-Specific Outputs

| Platform | Package Types | Description |
|----------|---------------|-------------|
| Windows | `.msi` | Windows Installer package |
| Windows | `.exe` | Portable executable |
| macOS | `.dmg` | Disk image installer |
| macOS | `.app` | Application bundle (inside DMG) |
| Linux | `.deb` | Debian/Ubuntu package |
| Linux | `.rpm` | Red Hat/Fedora package |
| Linux | `.AppImage` | Portable application |

### Package Configuration

The build configuration is defined in `src-tauri/tauri.conf.json`:

```json
{
  "bundle": {
    "active": true,
    "targets": ["msi", "deb", "rpm", "dmg", "appimage"],
    "publisher": "Markdown Viewer Team",
    "category": "Productivity",
    "shortDescription": "A lightweight, cross-platform markdown viewer",
    "longDescription": "A fast and lightweight markdown viewer for reading documentation and notes across Windows, macOS, and Linux."
  }
}
```

## Release Process

### Manual Release
```bash
# 1. Update version in package.json and Cargo.toml
npm version patch  # or minor/major

# 2. Commit and tag
git add .
git commit -m "Release v1.0.1"
git tag v1.0.1

# 3. Push to trigger release
git push origin main --tags
```

### Automated Release
1. **GitHub Actions** automatically:
   - Builds for all platforms
   - Runs complete test suite
   - Creates GitHub release
   - Uploads installers as assets
   - Generates update manifest

### Release Assets
Each release includes:
- **Windows**: `markdown-viewer_v1.0.0_x64_en-US.msi`
- **macOS**: `markdown-viewer_v1.0.0_x64.dmg`
- **Linux**: 
  - `markdown-viewer_v1.0.0_amd64.deb`
  - `markdown-viewer_v1.0.0_x86_64.rpm`
  - `markdown-viewer_v1.0.0_amd64.AppImage`
- **Update Manifest**: `latest.json` (for auto-updates)

## Troubleshooting

### Common Build Issues

#### Missing Dependencies (Linux)
```bash
sudo apt-get update
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf
```

#### Rust Compilation Errors
```bash
# Clean and rebuild
cargo clean
npm run build:release
```

#### Frontend Build Failures
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Platform-Specific Issues

#### macOS Code Signing
- For development: Code signing is not required
- For distribution: Apple Developer account needed for notarization

#### Windows Certificates
- For development: Self-signed certificates work
- For distribution: Code signing certificate recommended

#### Linux Dependencies
- Different distributions may require different packages
- AppImage provides the most compatible option

## Performance Optimization

### Build Size Optimization
- Release builds are automatically optimized
- Bundle size typically:
  - **Windows**: ~15-25MB (MSI)
  - **macOS**: ~20-30MB (DMG)
  - **Linux**: ~20-30MB (AppImage), ~5-10MB (DEB/RPM)

### Build Time Optimization
- Use GitHub Actions caching for Rust dependencies
- Incremental builds during development
- Parallel builds on multi-core systems

## Security Considerations

### Code Signing
- **macOS**: Required for Gatekeeper compatibility
- **Windows**: Recommended to avoid SmartScreen warnings
- **Linux**: Package signatures handled by package managers

### Update Security
- Update manifests include signature verification
- HTTPS-only update endpoints
- Public key validation for update authenticity

## Monitoring and Analytics

### Build Metrics
- **Build time**: Target <10 minutes for full multi-platform build
- **Artifact size**: Monitor for size regressions
- **Success rate**: Track build failure patterns

### Distribution Metrics
- **Download statistics**: Available through GitHub Releases
- **Platform adoption**: Track which installers are most used
- **Update adoption**: Monitor auto-update success rates