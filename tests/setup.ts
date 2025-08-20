// Jest setup file
import 'jest-environment-jsdom';

// Mock Tauri APIs for testing
const mockTauri = {
  invoke: jest.fn(),
  listen: jest.fn(),
  emit: jest.fn(),
};

// Mock the Tauri API module
jest.mock('@tauri-apps/api/core', () => ({
  invoke: mockTauri.invoke,
}));

jest.mock('@tauri-apps/api/event', () => ({
  listen: mockTauri.listen,
  emit: mockTauri.emit,
}));

jest.mock('@tauri-apps/plugin-dialog', () => ({
  open: jest.fn(),
}));

// Global test utilities
(global as any).mockTauri = mockTauri;

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});