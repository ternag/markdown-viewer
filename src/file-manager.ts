import { FileInfo } from './types.js';

export class FileManager {
    async openFileDialog(): Promise<string | null> {
        console.log('openFileDialog called');
        try {
            console.log('Calling custom open_file_dialog command...');
            // Use the global Tauri API
            const result = await (window as any).__TAURI__.invoke('open_file_dialog') as string | null;
            console.log('Dialog result:', result);
            return result;
        } catch (error) {
            console.error('Error opening file dialog:', error);
            alert(`Error opening file dialog: ${error}`);
            return null;
        }
    }

    async readFile(path: string): Promise<string> {
        try {
            console.log('Reading file:', path);
            const content = await (window as any).__TAURI__.invoke('read_file_content', { path }) as string;
            return content;
        } catch (error) {
            console.error('Error reading file:', error);
            throw new Error(`Failed to read file: ${error}`);
        }
    }

    async checkFileAlreadyOpen(path: string): Promise<boolean> {
        try {
            return await (window as any).__TAURI__.invoke('check_file_already_open', { path });
        } catch (error) {
            console.error('Error checking if file is already open:', error);
            return false;
        }
    }

    async activateExistingWindow(path: string): Promise<void> {
        try {
            await (window as any).__TAURI__.invoke('activate_existing_window', { path });
        } catch (error) {
            console.error('Error activating existing window:', error);
        }
    }

    getFileName(path: string): string {
        return path.split(/[\\/]/).pop() || 'Unknown file';
    }

    getFileInfo(path: string): FileInfo {
        return {
            path,
            name: this.getFileName(path),
            lastModified: Date.now()
        };
    }
}