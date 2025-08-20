import { FileManager } from '../src/file-manager';

describe('FileManager', () => {
    let fileManager: FileManager;
    let mockTauriInvoke: jest.Mock;

    beforeEach(() => {
        fileManager = new FileManager();
        
        // Mock the Tauri API
        mockTauriInvoke = jest.fn();
        (window as any).__TAURI__ = {
            invoke: mockTauriInvoke,
        };

        // Mock console methods to avoid noise in tests
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('openFileDialog', () => {
        test('should return file path when file is selected', async () => {
            const expectedPath = '/path/to/file.md';
            mockTauriInvoke.mockResolvedValue(expectedPath);

            const result = await fileManager.openFileDialog();

            expect(result).toBe(expectedPath);
            expect(mockTauriInvoke).toHaveBeenCalledWith('open_file_dialog');
        });

        test('should return null when no file is selected', async () => {
            mockTauriInvoke.mockResolvedValue(null);

            const result = await fileManager.openFileDialog();

            expect(result).toBe(null);
            expect(mockTauriInvoke).toHaveBeenCalledWith('open_file_dialog');
        });

        test('should handle errors gracefully', async () => {
            const error = new Error('Dialog failed');
            mockTauriInvoke.mockRejectedValue(error);
            
            // Mock alert to avoid actual dialog
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

            const result = await fileManager.openFileDialog();

            expect(result).toBe(null);
            expect(alertSpy).toHaveBeenCalledWith('Error opening file dialog: Error: Dialog failed');
            expect(console.error).toHaveBeenCalledWith('Error opening file dialog:', error);
            
            alertSpy.mockRestore();
        });
    });

    describe('readFile', () => {
        test('should return file content', async () => {
            const path = '/path/to/file.md';
            const expectedContent = '# Test Content\n\nThis is test markdown.';
            mockTauriInvoke.mockResolvedValue(expectedContent);

            const result = await fileManager.readFile(path);

            expect(result).toBe(expectedContent);
            expect(mockTauriInvoke).toHaveBeenCalledWith('read_file_content', { path });
        });

        test('should handle empty files', async () => {
            const path = '/path/to/empty.md';
            mockTauriInvoke.mockResolvedValue('');

            const result = await fileManager.readFile(path);

            expect(result).toBe('');
            expect(mockTauriInvoke).toHaveBeenCalledWith('read_file_content', { path });
        });

        test('should throw error when file read fails', async () => {
            const path = '/path/to/nonexistent.md';
            const error = new Error('File not found');
            mockTauriInvoke.mockRejectedValue(error);

            await expect(fileManager.readFile(path)).rejects.toThrow('Failed to read file: Error: File not found');
            expect(console.error).toHaveBeenCalledWith('Error reading file:', error);
        });
    });

    describe('checkFileAlreadyOpen', () => {
        test('should return true when file is already open', async () => {
            const path = '/path/to/file.md';
            mockTauriInvoke.mockResolvedValue(true);

            const result = await fileManager.checkFileAlreadyOpen(path);

            expect(result).toBe(true);
            expect(mockTauriInvoke).toHaveBeenCalledWith('check_file_already_open', { path });
        });

        test('should return false when file is not open', async () => {
            const path = '/path/to/file.md';
            mockTauriInvoke.mockResolvedValue(false);

            const result = await fileManager.checkFileAlreadyOpen(path);

            expect(result).toBe(false);
            expect(mockTauriInvoke).toHaveBeenCalledWith('check_file_already_open', { path });
        });

        test('should return false on error', async () => {
            const path = '/path/to/file.md';
            const error = new Error('Backend error');
            mockTauriInvoke.mockRejectedValue(error);

            const result = await fileManager.checkFileAlreadyOpen(path);

            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith('Error checking if file is already open:', error);
        });
    });

    describe('activateExistingWindow', () => {
        test('should call activate_existing_window command', async () => {
            const path = '/path/to/file.md';
            mockTauriInvoke.mockResolvedValue(undefined);

            await fileManager.activateExistingWindow(path);

            expect(mockTauriInvoke).toHaveBeenCalledWith('activate_existing_window', { path });
        });

        test('should handle errors gracefully', async () => {
            const path = '/path/to/file.md';
            const error = new Error('Activation failed');
            mockTauriInvoke.mockRejectedValue(error);

            // Should not throw
            await expect(fileManager.activateExistingWindow(path)).resolves.toBeUndefined();
            expect(console.error).toHaveBeenCalledWith('Error activating existing window:', error);
        });
    });

    describe('getFileName', () => {
        test('should extract filename from Unix path', () => {
            const path = '/home/user/documents/readme.md';
            const result = fileManager.getFileName(path);
            expect(result).toBe('readme.md');
        });

        test('should extract filename from Windows path', () => {
            const path = 'C:\\Users\\User\\Documents\\readme.md';
            const result = fileManager.getFileName(path);
            expect(result).toBe('readme.md');
        });

        test('should extract filename from mixed separators', () => {
            const path = '/home/user\\documents/readme.md';
            const result = fileManager.getFileName(path);
            expect(result).toBe('readme.md');
        });

        test('should handle filename without path', () => {
            const path = 'readme.md';
            const result = fileManager.getFileName(path);
            expect(result).toBe('readme.md');
        });

        test('should handle empty path', () => {
            const path = '';
            const result = fileManager.getFileName(path);
            expect(result).toBe('Unknown file');
        });

        test('should handle path ending with separator', () => {
            const path = '/home/user/documents/';
            const result = fileManager.getFileName(path);
            expect(result).toBe('Unknown file');
        });

        test('should handle path with only separators', () => {
            const path = '///';
            const result = fileManager.getFileName(path);
            expect(result).toBe('Unknown file');
        });
    });

    describe('getFileInfo', () => {
        test('should return file info object', () => {
            const path = '/home/user/test.md';
            const beforeTime = Date.now();
            
            const result = fileManager.getFileInfo(path);
            
            const afterTime = Date.now();

            expect(result.path).toBe(path);
            expect(result.name).toBe('test.md');
            expect(result.lastModified).toBeGreaterThanOrEqual(beforeTime);
            expect(result.lastModified).toBeLessThanOrEqual(afterTime);
        });

        test('should handle complex paths', () => {
            const path = '/very/long/path/to/some/complex-file-name.markdown';
            const result = fileManager.getFileInfo(path);

            expect(result.path).toBe(path);
            expect(result.name).toBe('complex-file-name.markdown');
            expect(typeof result.lastModified).toBe('number');
        });

        test('should handle Windows paths', () => {
            const path = 'C:\\Projects\\MyApp\\README.md';
            const result = fileManager.getFileInfo(path);

            expect(result.path).toBe(path);
            expect(result.name).toBe('README.md');
            expect(typeof result.lastModified).toBe('number');
        });
    });
});