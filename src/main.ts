import { MarkdownRenderer } from './markdown-renderer.js';
import { FileManager } from './file-manager.js';
import { SyntaxHighlighter } from './syntax-highlighter.js';
import { WindowState } from './types.js';
// Using global Tauri API instead of imports

class MarkdownViewerApp {
    private renderer: MarkdownRenderer;
    private fileManager: FileManager;
    private syntaxHighlighter: SyntaxHighlighter;
    private state: WindowState;
    
    private contentElement!: HTMLElement;
    private toolbarElement!: HTMLElement;
    private openFileBtn!: HTMLButtonElement;
    private currentFileNameSpan!: HTMLSpanElement;

    constructor() {
        console.log('MarkdownViewerApp constructor called');
        this.renderer = new MarkdownRenderer();
        this.fileManager = new FileManager();
        this.syntaxHighlighter = new SyntaxHighlighter();
        
        this.state = {
            currentFile: null,
            fileContent: '',
            searchResults: [],
            settings: {
                theme: 'light',
                fontSize: 16,
                fontFamily: 'system',
                alwaysOnTop: false
            }
        };

        this.initializeElements();
        this.bindEvents();
        this.checkForCLIArguments();
    }

    private initializeElements(): void {
        this.contentElement = document.getElementById('markdown-content')!;
        this.toolbarElement = document.getElementById('toolbar')!;
        this.openFileBtn = document.getElementById('open-file-btn') as HTMLButtonElement;
        this.currentFileNameSpan = document.getElementById('current-file-name') as HTMLSpanElement;
    }

    private bindEvents(): void {
        console.log('Binding events...');
        console.log('Open file button:', this.openFileBtn);
        this.openFileBtn.addEventListener('click', () => {
            console.log('Open file button clicked!');
            this.openFile();
        });
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                this.openFile();
            }
            if (e.key === 'F5') {
                e.preventDefault();
                if (this.state.currentFile) {
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
    }

    private async checkForCLIArguments(): Promise<void> {
        try {
            const args = await (window as any).__TAURI__.invoke('get_cli_args') as string[];
            if (args && Array.isArray(args) && args.length > 0) {
                const filePath = args[0];
                await this.loadFile(filePath);
            }
        } catch (error) {
            console.log('No CLI arguments or error getting them:', error);
        }
    }

    private async openFile(): Promise<void> {
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

    private async loadFile(filePath: string): Promise<void> {
        this.showLoading();
        
        try {
            const content = await this.fileManager.readFile(filePath);
            const fileInfo = this.fileManager.getFileInfo(filePath);
            
            this.state.currentFile = filePath;
            this.state.fileContent = content;
            
            await this.renderContent(content);
            this.updateUI(fileInfo);
            
            // Register this file as open
            try {
                await (window as any).__TAURI__.invoke('register_file_open', { path: filePath });
            } catch (error) {
                console.warn('Could not register file as open:', error);
            }
            
        } catch (error) {
            this.showError(`Failed to load file: ${error}`);
        }
    }

    private async renderContent(content: string): Promise<void> {
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

    private updateUI(fileInfo: { name: string; path: string }): void {
        this.currentFileNameSpan.textContent = fileInfo.name;
        this.currentFileNameSpan.title = fileInfo.path;
        
        // Update window title
        document.title = `${fileInfo.name} - Markdown Viewer`;
    }

    private showError(message: string): void {
        this.contentElement.innerHTML = `
            <div class="error-message">
                <h2>Error</h2>
                <p>${message}</p>
            </div>
        `;
    }

    private showLoading(): void {
        this.contentElement.innerHTML = `
            <div class="loading">
                Loading file...
            </div>
        `;
    }

    private async reloadCurrentFile(): Promise<void> {
        if (this.state.currentFile) {
            await this.loadFile(this.state.currentFile);
        }
    }

    private createShortcutsInfo(): void {
        const shortcutsDiv = document.createElement('div');
        shortcutsDiv.className = 'shortcuts-info';
        shortcutsDiv.innerHTML = `
            <kbd>Ctrl/Cmd+O</kbd> Open file<br>
            <kbd>F5</kbd> Reload current file<br>
            <kbd>Shift+?</kbd> Toggle shortcuts
        `;
        document.body.appendChild(shortcutsDiv);
    }

    private toggleShortcutsInfo(): void {
        const shortcutsDiv = document.querySelector('.shortcuts-info');
        if (shortcutsDiv) {
            shortcutsDiv.classList.toggle('show');
            // Auto hide after 3 seconds
            setTimeout(() => {
                shortcutsDiv.classList.remove('show');
            }, 3000);
        }
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
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded event fired (from loading state)');
        new MarkdownViewerApp();
    });
} else {
    console.log('Document already loaded, initializing immediately');
    new MarkdownViewerApp();
}