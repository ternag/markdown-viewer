import Prism from 'prismjs';

export class SyntaxHighlighter {
    private loadedLanguages: Set<string> = new Set();
    
    constructor() {
        // Load core Prism with basic languages
        this.loadedLanguages.add('markup');
        this.loadedLanguages.add('css');
        this.loadedLanguages.add('clike');
        this.loadedLanguages.add('javascript');
    }

    async loadLanguage(language: string): Promise<void> {
        if (this.loadedLanguages.has(language)) {
            return;
        }

        // For MVP, we'll use a simple approach with CDN loading
        // This avoids TypeScript module resolution issues
        const supportedLanguages = [
            'typescript', 'python', 'rust', 'bash', 'json', 'yaml', 
            'markdown', 'sql', 'go', 'java', 'c', 'cpp'
        ];

        if (supportedLanguages.includes(language)) {
            try {
                // Use CDN to load language components
                const script = document.createElement('script');
                script.src = `https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-${language}.min.js`;
                script.onload = () => {
                    this.loadedLanguages.add(language);
                };
                script.onerror = () => {
                    console.warn(`Failed to load language ${language}`);
                };
                document.head.appendChild(script);
                
                // Wait a bit for the script to load
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Failed to load language ${language}:`, error);
            }
        } else {
            console.warn(`Language ${language} not supported for syntax highlighting`);
        }
    }

    async highlightElement(element: Element): Promise<void> {
        if (element.tagName !== 'CODE') {
            return;
        }

        const codeElement = element as HTMLElement;
        const className = codeElement.className;
        const languageMatch = className.match(/language-(\w+)/);
        
        if (languageMatch) {
            const language = languageMatch[1];
            await this.loadLanguage(language);
            
            if (this.loadedLanguages.has(language)) {
                Prism.highlightElement(codeElement);
            }
        }
    }

    async highlightAllInContainer(container: Element): Promise<void> {
        const codeElements = container.querySelectorAll('pre code[class*="language-"]');
        
        for (const codeElement of codeElements) {
            await this.highlightElement(codeElement);
        }
    }

    highlightCode(code: string, language: string): string {
        if (!this.loadedLanguages.has(language)) {
            return code; // Return unhighlighted if language not loaded
        }

        const grammar = Prism.languages[language];
        if (!grammar) {
            return code;
        }

        return Prism.highlight(code, grammar, language);
    }
}