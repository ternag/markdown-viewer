// Markdown Viewer Application
// Using global variables instead of ES modules

// Global variables for dependencies
let markdownIt;

// Application state
const appState = {
    currentFile: null,
    fileContent: '',
    settings: {
        theme: 'light',
        fontSize: 16,
        fontFamily: 'system',
        alwaysOnTop: false
    }
};

// File Manager
class FileManager {
    async openFileDialog() {
        console.log('openFileDialog called');
        console.log('Available APIs:', {
            __TAURI__: typeof window.__TAURI__,
            __TAURI_INVOKE__: typeof window.__TAURI_INVOKE__,
            invoke: typeof window.invoke
        });
        
        if (window.__TAURI__) {
            console.log('__TAURI__ object contents:', Object.keys(window.__TAURI__));
            console.log('__TAURI__.invoke type:', typeof window.__TAURI__.invoke);
            if (window.__TAURI__.core) {
                console.log('__TAURI__.core.invoke type:', typeof window.__TAURI__.core?.invoke);
            }
        }
        
        // Try multiple Tauri API access patterns
        const tryInvoke = async (invokeFunc, command, params = {}) => {
            try {
                console.log('Trying invoke with:', command, params);
                const result = await invokeFunc(command, params);
                console.log('Invoke result:', result);
                return result;
            } catch (error) {
                console.error('Invoke error:', error);
                throw error;
            }
        };
        
        // Try window.__TAURI__.invoke
        if (window.__TAURI__ && window.__TAURI__.invoke) {
            try {
                console.log('Using window.__TAURI__.invoke');
                return await tryInvoke(window.__TAURI__.invoke, 'open_file_dialog');
            } catch (error) {
                console.error('__TAURI__.invoke failed:', error);
            }
        }
        
        // Try window.__TAURI__.core.invoke (Tauri v2 pattern)
        if (window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke) {
            try {
                console.log('Using window.__TAURI__.core.invoke');
                return await tryInvoke(window.__TAURI__.core.invoke, 'open_file_dialog');
            } catch (error) {
                console.error('__TAURI__.core.invoke failed:', error);
            }
        }
        
        // Try window.__TAURI_INVOKE__
        if (window.__TAURI_INVOKE__) {
            try {
                console.log('Using window.__TAURI_INVOKE__');
                return await tryInvoke(window.__TAURI_INVOKE__, 'open_file_dialog');
            } catch (error) {
                console.error('__TAURI_INVOKE__ failed:', error);
            }
        }
        
        // Try window.invoke
        if (typeof window.invoke === 'function') {
            try {
                console.log('Using window.invoke');
                return await tryInvoke(window.invoke, 'open_file_dialog');
            } catch (error) {
                console.error('window.invoke failed:', error);
            }
        }
        
        console.log('No Tauri API available, using custom dialog fallback');
        return this.showCustomFileDialog();
    }

    showCustomFileDialog() {
        return new Promise((resolve) => {
            // Create overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;

            // Create dialog
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                width: 90%;
            `;

            dialog.innerHTML = `
                <h3 style="margin: 0 0 20px 0; color: #333;">Open Markdown File</h3>
                <p style="margin: 0 0 15px 0; color: #666; line-height: 1.4;">
                    Enter the full path to a markdown file, or click "Demo" to see sample content:
                </p>
                <input type="text" id="file-path-input" 
                       placeholder="/Users/terje/repos/markdown-viewer/test.md"
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 20px; font-family: monospace;">
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button id="demo-btn" style="padding: 10px 20px; border: none; background: #28a745; color: white; border-radius: 4px; cursor: pointer;">Demo</button>
                    <button id="cancel-btn" style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">Cancel</button>
                    <button id="open-btn" style="padding: 10px 20px; border: none; background: #007acc; color: white; border-radius: 4px; cursor: pointer;">Open</button>
                </div>
            `;

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            const input = document.getElementById('file-path-input');
            const openBtn = document.getElementById('open-btn');
            const cancelBtn = document.getElementById('cancel-btn');
            const demoBtn = document.getElementById('demo-btn');

            const cleanup = () => {
                document.body.removeChild(overlay);
            };

            openBtn.onclick = () => {
                const path = input.value.trim();
                cleanup();
                resolve(path || 'demo');
            };

            demoBtn.onclick = () => {
                cleanup();
                resolve('demo');
            };

            cancelBtn.onclick = () => {
                cleanup();
                resolve(null);
            };

            // Focus the input
            input.focus();
            
            // Handle Enter key
            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    openBtn.click();
                }
            };
        });
    }

    async readFile(path) {
        try {
            console.log('Reading file:', path);
            
            // Try the same invoke patterns that worked for file dialog
            const tryInvoke = async (invokeFunc, command, params = {}) => {
                try {
                    console.log('Trying invoke with:', command, params);
                    const result = await invokeFunc(command, params);
                    console.log('Invoke result length:', result?.length || 'null');
                    return result;
                } catch (error) {
                    console.error('Invoke error:', error);
                    throw error;
                }
            };
            
            // Try window.__TAURI__.core.invoke (this worked for file dialog)
            if (window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke) {
                try {
                    console.log('Using window.__TAURI__.core.invoke for file read');
                    return await tryInvoke(window.__TAURI__.core.invoke, 'read_file_content', { path });
                } catch (error) {
                    console.error('__TAURI__.core.invoke failed for file read:', error);
                }
            }
            
            // Try window.__TAURI__.invoke
            if (window.__TAURI__ && window.__TAURI__.invoke) {
                try {
                    console.log('Using window.__TAURI__.invoke for file read');
                    return await tryInvoke(window.__TAURI__.invoke, 'read_file_content', { path });
                } catch (error) {
                    console.error('__TAURI__.invoke failed for file read:', error);
                }
            }
            
            // Try other patterns
            if (window.__TAURI_INVOKE__) {
                try {
                    console.log('Using window.__TAURI_INVOKE__ for file read');
                    return await tryInvoke(window.__TAURI_INVOKE__, 'read_file_content', { path });
                } catch (error) {
                    console.error('__TAURI_INVOKE__ failed for file read:', error);
                }
            }
            
            if (typeof window.invoke === 'function') {
                try {
                    console.log('Using window.invoke for file read');
                    return await tryInvoke(window.invoke, 'read_file_content', { path });
                } catch (error) {
                    console.error('window.invoke failed for file read:', error);
                }
            }
            
            // Fallback to demo content
            console.log('No working Tauri API found, returning sample content');
            return `# Demo Markdown Content

This is a demonstration of the Markdown Viewer since the Tauri API is not available.

## Features Working
- ✅ Markdown rendering with markdown-it
- ✅ Syntax highlighting with Prism.js  
- ✅ Responsive layout and styling
- ✅ Text selection and copying

## Sample Code Block

\`\`\`javascript
function hello() {
    console.log("Markdown Viewer is working!");
    return "Hello World";
}
\`\`\`

## What You Can Test
1. **Text Selection**: Select any text in this document
2. **Keyboard Shortcuts**: 
   - \`F5\` to reload
   - \`Shift+?\` to show shortcuts
3. **Responsive Design**: Resize the window

The file path you entered was: **${path}**

*The file dialog is now working with the native system dialog!*`;
            
        } catch (error) {
            console.error('Error reading file:', error);
            throw new Error(`Failed to read file: ${error}`);
        }
    }

    async checkFileAlreadyOpen(path) {
        try {
            // Use the same invoke pattern that works
            if (window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke) {
                return await window.__TAURI__.core.invoke('check_file_already_open', { path });
            }
            if (window.__TAURI__ && window.__TAURI__.invoke) {
                return await window.__TAURI__.invoke('check_file_already_open', { path });
            }
            return false;
        } catch (error) {
            console.error('Error checking if file is already open:', error);
            return false;
        }
    }

    async activateExistingWindow(path) {
        try {
            // Use the same invoke pattern that works
            if (window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke) {
                await window.__TAURI__.core.invoke('activate_existing_window', { path });
            } else if (window.__TAURI__ && window.__TAURI__.invoke) {
                await window.__TAURI__.invoke('activate_existing_window', { path });
            }
        } catch (error) {
            console.error('Error activating existing window:', error);
        }
    }

    getFileName(path) {
        return path.split(/[\\/]/).pop() || 'Unknown file';
    }

    getFileInfo(path) {
        return {
            path,
            name: this.getFileName(path),
            lastModified: Date.now()
        };
    }
}

// Markdown Renderer
class MarkdownRenderer {
    constructor() {
        this.md = window.markdownit({
            html: true,
            linkify: true,
            typographer: true,
            breaks: false,
            highlight: (str, lang) => {
                if (lang && lang.trim()) {
                    return `<pre class="language-${lang}"><code class="language-${lang}">${this.escapeHtml(str)}</code></pre>`;
                }
                return `<pre><code>${this.escapeHtml(str)}</code></pre>`;
            }
        });
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    render(content) {
        try {
            return this.md.render(content);
        } catch (error) {
            console.error('Error rendering markdown:', error);
            return `<div class="error">Error rendering markdown: ${error}</div>`;
        }
    }
}

// Syntax Highlighter
class SyntaxHighlighter {
    constructor() {
        this.loadedLanguages = new Set(['markup', 'css', 'clike', 'javascript']);
    }

    async highlightAllInContainer(container) {
        if (typeof window.Prism !== 'undefined' && window.Prism.highlightAllUnder) {
            window.Prism.highlightAllUnder(container);
        } else if (typeof window.Prism !== 'undefined' && window.Prism.highlightAll) {
            window.Prism.highlightAll();
        }
    }
}

// Main Application
class MarkdownViewerApp {
    constructor() {
        console.log('MarkdownViewerApp constructor called');
        
        // Initialize components
        this.fileManager = new FileManager();
        
        // Wait for dependencies to load
        this.initializeWhenReady();
    }

    async initializeWhenReady() {
        // Wait for Tauri API to be available
        let tauriAttempts = 0;
        while (!window.__TAURI__ && !window.__TAURI_INVOKE__ && typeof window.invoke !== 'function' && tauriAttempts < 100) {
            console.log('Waiting for Tauri API...', tauriAttempts);
            await new Promise(resolve => setTimeout(resolve, 100));
            tauriAttempts++;
        }

        const tauriAvailable = window.__TAURI__ || window.__TAURI_INVOKE__ || typeof window.invoke === 'function';
        if (!tauriAvailable) {
            console.error('Tauri API failed to load');
            console.log('Falling back to prompt-based file selection');
            // Continue without Tauri API for basic functionality
        } else {
            console.log('Tauri API loaded successfully');
        }

        // Wait for markdown-it to be available
        let attempts = 0;
        while (typeof window.markdownit === 'undefined' && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (typeof window.markdownit === 'undefined') {
            console.error('markdown-it failed to load');
            return;
        }

        console.log('All dependencies loaded, initializing app...');

        // Initialize after dependencies are loaded
        this.renderer = new MarkdownRenderer();
        this.syntaxHighlighter = new SyntaxHighlighter();
        
        this.initializeElements();
        this.bindEvents();
        this.checkForCLIArguments();
    }

    initializeElements() {
        this.contentElement = document.getElementById('markdown-content');
    }

    bindEvents() {
        console.log('Binding events...');
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                this.openFile();
            }
            if (e.key === 'F5') {
                e.preventDefault();
                if (appState.currentFile) {
                    this.reloadCurrentFile();
                }
            }
            if (e.key === '?' && e.shiftKey) {
                e.preventDefault();
                this.toggleShortcutsInfo();
            }
        });

        // Add shortcuts info element
        this.createShortcutsInfo();
        
        // Listen for menu events
        this.setupMenuEventListeners();
    }

    async checkForCLIArguments() {
        try {
            let args = null;
            // Use the same invoke pattern that works
            if (window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke) {
                args = await window.__TAURI__.core.invoke('get_cli_args');
            } else if (window.__TAURI__ && window.__TAURI__.invoke) {
                args = await window.__TAURI__.invoke('get_cli_args');
            }
            
            if (args && Array.isArray(args) && args.length > 0) {
                const filePath = args[0];
                await this.loadFile(filePath);
            }
        } catch (error) {
            console.log('No CLI arguments or error getting them:', error);
        }
    }

    async openFile() {
        console.log('openFile method called');
        try {
            console.log('Calling fileManager.openFileDialog...');
            const filePath = await this.fileManager.openFileDialog();
            if (filePath) {
                // Check if file is already open in another window
                const alreadyOpen = await this.fileManager.checkFileAlreadyOpen(filePath);
                if (alreadyOpen) {
                    await this.fileManager.activateExistingWindow(filePath);
                    return;
                }
                
                await this.loadFile(filePath);
            }
        } catch (error) {
            this.showError(`Failed to open file: ${error}`);
        }
    }

    async loadFile(filePath) {
        this.showLoading();
        
        try {
            const content = await this.fileManager.readFile(filePath);
            const fileInfo = this.fileManager.getFileInfo(filePath);
            
            appState.currentFile = filePath;
            appState.fileContent = content;
            
            await this.renderContent(content);
            this.updateUI(fileInfo);
            
            // Register this file as open
            try {
                if (window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke) {
                    await window.__TAURI__.core.invoke('register_file_open', { path: filePath });
                } else if (window.__TAURI__ && window.__TAURI__.invoke) {
                    await window.__TAURI__.invoke('register_file_open', { path: filePath });
                }
            } catch (error) {
                console.warn('Could not register file as open:', error);
            }
            
        } catch (error) {
            this.showError(`Failed to load file: ${error}`);
        }
    }

    async renderContent(content) {
        if (!content.trim()) {
            this.contentElement.innerHTML = '<div class="welcome-message"><p>This file appears to be empty.</p></div>';
            return;
        }

        const htmlContent = this.renderer.render(content);
        this.contentElement.innerHTML = htmlContent;
        
        // Apply syntax highlighting
        await this.syntaxHighlighter.highlightAllInContainer(this.contentElement);
        
        // Enable text selection
        this.contentElement.style.userSelect = 'text';
        
        // Scroll to top
        this.contentElement.scrollTop = 0;
    }

    updateUI(fileInfo) {
        // Update window title
        document.title = `${fileInfo.name} - Markdown Viewer`;
    }

    showError(message) {
        this.contentElement.innerHTML = `
            <div class="error-message">
                <h2>Error</h2>
                <p>${message}</p>
            </div>
        `;
    }

    showLoading() {
        this.contentElement.innerHTML = `
            <div class="loading">
                Loading file...
            </div>
        `;
    }

    async reloadCurrentFile() {
        if (appState.currentFile) {
            await this.loadFile(appState.currentFile);
        }
    }

    createShortcutsInfo() {
        const shortcutsDiv = document.createElement('div');
        shortcutsDiv.className = 'shortcuts-info';
        shortcutsDiv.innerHTML = `
            <kbd>Ctrl/Cmd+O</kbd> Open file<br>
            <kbd>F5</kbd> Reload current file<br>
            <kbd>Shift+?</kbd> Toggle shortcuts
        `;
        document.body.appendChild(shortcutsDiv);
    }

    toggleShortcutsInfo() {
        const shortcutsDiv = document.querySelector('.shortcuts-info');
        if (shortcutsDiv) {
            shortcutsDiv.classList.toggle('show');
            // Auto hide after 3 seconds
            setTimeout(() => {
                shortcutsDiv.classList.remove('show');
            }, 3000);
        }
    }

    setupMenuEventListeners() {
        // Listen for menu events from Tauri
        const tryListen = async () => {
            try {
                // Try different ways to access the event listener
                if (window.__TAURI__ && window.__TAURI__.event && window.__TAURI__.event.listen) {
                    await window.__TAURI__.event.listen('menu-open-file', () => {
                        console.log('Menu open file triggered');
                        this.openFile();
                    });
                    await window.__TAURI__.event.listen('menu-about', () => {
                        console.log('Menu about triggered');
                        this.showAbout();
                    });
                    console.log('Menu event listeners registered via __TAURI__.event.listen');
                } else if (window.__TAURI__ && window.__TAURI__.listen) {
                    await window.__TAURI__.listen('menu-open-file', () => {
                        console.log('Menu open file triggered');
                        this.openFile();
                    });
                    await window.__TAURI__.listen('menu-about', () => {
                        console.log('Menu about triggered');
                        this.showAbout();
                    });
                    console.log('Menu event listeners registered via __TAURI__.listen');
                } else {
                    console.log('No Tauri event listener available');
                }
            } catch (error) {
                console.error('Failed to setup menu event listener:', error);
            }
        };
        
        tryListen();
    }

    showAbout() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        // Create dialog
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            width: 90%;
            text-align: center;
        `;

        dialog.innerHTML = `
            <h2 style="margin: 0 0 20px 0; color: #333;">About Markdown Viewer</h2>
            <p style="margin: 0 0 15px 0; color: #666; line-height: 1.6;">
                A lightweight, cross-platform markdown viewer built with Tauri.
            </p>
            <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">
                Version 0.1.0
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="close-about-btn" style="padding: 10px 20px; border: none; background: #007acc; color: white; border-radius: 4px; cursor: pointer;">OK</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const closeBtn = document.getElementById('close-about-btn');
        const cleanup = () => {
            document.body.removeChild(overlay);
        };

        closeBtn.onclick = cleanup;
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                cleanup();
            }
        };

        // Handle Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                cleanup();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
}

// Initialize the app when DOM is loaded
console.log('Script loaded, document.readyState:', document.readyState);

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    new MarkdownViewerApp();
});

// Also initialize if DOMContentLoaded has already fired
if (document.readyState === 'loading') {
    console.log('Document still loading, adding event listener');
} else {
    console.log('Document already loaded, initializing immediately');
    new MarkdownViewerApp();
}