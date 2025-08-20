export interface WindowState {
    currentFile: string | null;
    fileContent: string;
    searchResults: SearchResult[];
    settings: AppSettings;
}

export interface SearchResult {
    line: number;
    text: string;
    startIndex: number;
    endIndex: number;
}

export interface AppSettings {
    theme: 'light' | 'dark';
    fontSize: number;
    fontFamily: string;
    alwaysOnTop: boolean;
}

export interface FileInfo {
    path: string;
    name: string;
    lastModified: number;
}

// Types for Tauri API are now imported from @tauri-apps/api