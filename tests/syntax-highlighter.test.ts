// Mock Prism.js before importing
const mockPrism = {
    highlightElement: jest.fn(),
    highlight: jest.fn(),
    languages: {
        javascript: { /* mock grammar */ },
        typescript: { /* mock grammar */ },
        python: { /* mock grammar */ },
    },
};

jest.mock('prismjs', () => mockPrism);

import { SyntaxHighlighter } from '../src/syntax-highlighter';

// Mock DOM methods
Object.defineProperty(document, 'createElement', {
    value: jest.fn(),
});

Object.defineProperty(document, 'head', {
    value: {
        appendChild: jest.fn(),
    },
});

describe('SyntaxHighlighter', () => {
    let highlighter: SyntaxHighlighter;

    beforeEach(() => {
        highlighter = new SyntaxHighlighter();
        jest.clearAllMocks();
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('constructor', () => {
        test('should initialize with core languages loaded', () => {
            expect(highlighter['loadedLanguages'].has('markup')).toBe(true);
            expect(highlighter['loadedLanguages'].has('css')).toBe(true);
            expect(highlighter['loadedLanguages'].has('clike')).toBe(true);
            expect(highlighter['loadedLanguages'].has('javascript')).toBe(true);
        });
    });

    describe('loadLanguage', () => {
        beforeEach(() => {
            // Reset the loaded languages for testing
            highlighter['loadedLanguages'] = new Set(['markup', 'css', 'clike', 'javascript']);
        });

        test('should not reload already loaded language', async () => {
            const createElementSpy = jest.spyOn(document, 'createElement');

            await highlighter.loadLanguage('javascript');

            expect(createElementSpy).not.toHaveBeenCalled();
        });

        test('should load supported language via CDN', async () => {
            const mockScript = {
                src: '',
                onload: null as (() => void) | null,
                onerror: null as (() => void) | null,
            };

            const createElementSpy = jest.spyOn(document, 'createElement')
                .mockReturnValue(mockScript as any);
            const appendChildSpy = jest.spyOn(document.head, 'appendChild');

            // Start loading
            const loadPromise = highlighter.loadLanguage('typescript');

            // Simulate successful script load
            setTimeout(() => {
                if (mockScript.onload) mockScript.onload();
            }, 50);

            await loadPromise;

            expect(createElementSpy).toHaveBeenCalledWith('script');
            expect(mockScript.src).toBe('https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-typescript.min.js');
            expect(appendChildSpy).toHaveBeenCalledWith(mockScript);
            expect(highlighter['loadedLanguages'].has('typescript')).toBe(true);
        });

        test('should handle script load error gracefully', async () => {
            const mockScript = {
                src: '',
                onload: null as (() => void) | null,
                onerror: null as (() => void) | null,
            };

            jest.spyOn(document, 'createElement').mockReturnValue(mockScript as any);

            // Start loading
            const loadPromise = highlighter.loadLanguage('python');

            // Simulate script load error
            setTimeout(() => {
                if (mockScript.onerror) mockScript.onerror();
            }, 50);

            await loadPromise;

            expect(console.warn).toHaveBeenCalledWith('Failed to load language python');
            expect(highlighter['loadedLanguages'].has('python')).toBe(false);
        });

        test('should warn about unsupported language', async () => {
            await highlighter.loadLanguage('unsupported-lang');

            expect(console.warn).toHaveBeenCalledWith('Language unsupported-lang not supported for syntax highlighting');
            expect(highlighter['loadedLanguages'].has('unsupported-lang')).toBe(false);
        });

        test('should handle loading errors', async () => {
            const mockScript = {
                src: '',
                onload: null as (() => void) | null,
                onerror: null as (() => void) | null,
            };

            // Mock createElement to throw error
            jest.spyOn(document, 'createElement').mockImplementation(() => {
                throw new Error('DOM error');
            });

            await highlighter.loadLanguage('rust');

            expect(console.error).toHaveBeenCalledWith('Failed to load language rust:', expect.any(Error));
        });
    });

    describe('highlightElement', () => {
        test('should highlight element with language class', async () => {
            const mockElement = {
                tagName: 'CODE',
                className: 'language-javascript',
            } as HTMLElement;

            await highlighter.highlightElement(mockElement);

            expect(mockPrism.highlightElement).toHaveBeenCalledWith(mockElement);
        });

        test('should load language before highlighting', async () => {
            const mockScript = {
                src: '',
                onload: null as (() => void) | null,
                onerror: null as (() => void) | null,
            };

            jest.spyOn(document, 'createElement').mockReturnValue(mockScript as any);

            const mockElement = {
                tagName: 'CODE',
                className: 'language-python',
            } as HTMLElement;

            // Start highlighting
            const highlightPromise = highlighter.highlightElement(mockElement);

            // Simulate script load
            setTimeout(() => {
                highlighter['loadedLanguages'].add('python');
                if (mockScript.onload) mockScript.onload();
            }, 50);

            await highlightPromise;

            expect(mockPrism.highlightElement).toHaveBeenCalledWith(mockElement);
        });

        test('should ignore non-code elements', async () => {
            const mockElement = {
                tagName: 'DIV',
                className: 'language-javascript',
            } as HTMLElement;

            await highlighter.highlightElement(mockElement);

            expect(mockPrism.highlightElement).not.toHaveBeenCalled();
        });

        test('should ignore elements without language class', async () => {
            const mockElement = {
                tagName: 'CODE',
                className: 'some-other-class',
            } as HTMLElement;

            await highlighter.highlightElement(mockElement);

            expect(mockPrism.highlightElement).not.toHaveBeenCalled();
        });
    });

    describe('highlightAllInContainer', () => {
        test('should highlight all code elements in container', async () => {
            const mockCodeElements = [
                { tagName: 'CODE', className: 'language-javascript' },
                { tagName: 'CODE', className: 'language-typescript' },
            ];

            const mockContainer = {
                querySelectorAll: jest.fn().mockReturnValue(mockCodeElements),
            } as any;

            const highlightElementSpy = jest.spyOn(highlighter, 'highlightElement')
                .mockResolvedValue(undefined);

            await highlighter.highlightAllInContainer(mockContainer);

            expect(mockContainer.querySelectorAll).toHaveBeenCalledWith('pre code[class*="language-"]');
            expect(highlightElementSpy).toHaveBeenCalledTimes(2);
            expect(highlightElementSpy).toHaveBeenCalledWith(mockCodeElements[0]);
            expect(highlightElementSpy).toHaveBeenCalledWith(mockCodeElements[1]);
        });

        test('should handle empty container', async () => {
            const mockContainer = {
                querySelectorAll: jest.fn().mockReturnValue([]),
            } as any;

            const highlightElementSpy = jest.spyOn(highlighter, 'highlightElement');

            await highlighter.highlightAllInContainer(mockContainer);

            expect(highlightElementSpy).not.toHaveBeenCalled();
        });
    });

    describe('highlightCode', () => {
        test('should return highlighted code for loaded language', () => {
            const code = 'console.log("hello");';
            const language = 'javascript';
            const highlightedCode = '<span class="token">highlighted</span>';

            mockPrism.highlight.mockReturnValue(highlightedCode);

            const result = highlighter.highlightCode(code, language);

            expect(mockPrism.highlight).toHaveBeenCalledWith(code, mockPrism.languages.javascript, language);
            expect(result).toBe(highlightedCode);
        });

        test('should return unhighlighted code for unloaded language', () => {
            const code = 'print("hello")';
            const language = 'unloaded-lang';

            const result = highlighter.highlightCode(code, language);

            expect(mockPrism.highlight).not.toHaveBeenCalled();
            expect(result).toBe(code);
        });

        test('should return unhighlighted code when grammar is missing', () => {
            highlighter['loadedLanguages'].add('missing-grammar');
            const code = 'some code';
            const language = 'missing-grammar';

            const result = highlighter.highlightCode(code, language);

            expect(result).toBe(code);
        });

        test('should handle loaded language with available grammar', () => {
            const code = 'def hello(): pass';
            const language = 'python';
            
            // Simulate python being loaded
            highlighter['loadedLanguages'].add('python');
            
            const highlightedCode = '<span class="token">highlighted python</span>';
            mockPrism.highlight.mockReturnValue(highlightedCode);

            const result = highlighter.highlightCode(code, language);

            expect(mockPrism.highlight).toHaveBeenCalledWith(code, mockPrism.languages.python, language);
            expect(result).toBe(highlightedCode);
        });
    });
});