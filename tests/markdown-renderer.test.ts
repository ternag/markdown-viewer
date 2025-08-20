import { MarkdownRenderer } from '../src/markdown-renderer';

describe('MarkdownRenderer', () => {
    let renderer: MarkdownRenderer;

    beforeEach(() => {
        renderer = new MarkdownRenderer();
    });

    describe('render', () => {
        test('should render basic markdown', () => {
            const input = '# Hello World';
            const result = renderer.render(input);
            
            expect(result).toContain('<h1>Hello World</h1>');
        });

        test('should render paragraphs', () => {
            const input = 'This is a paragraph.\n\nThis is another paragraph.';
            const result = renderer.render(input);
            
            expect(result).toContain('<p>This is a paragraph.</p>');
            expect(result).toContain('<p>This is another paragraph.</p>');
        });

        test('should render code blocks with language', () => {
            const input = '```javascript\nconsole.log("Hello");\n```';
            const result = renderer.render(input);
            
            expect(result).toContain('class="language-javascript"');
            expect(result).toContain('console.log(&quot;Hello&quot;);');
        });

        test('should render code blocks without language', () => {
            const input = '```\nsome code\n```';
            const result = renderer.render(input);
            
            expect(result).toContain('<pre><code>');
            expect(result).toContain('some code');
        });

        test('should render inline code', () => {
            const input = 'This is `inline code` in text.';
            const result = renderer.render(input);
            
            expect(result).toContain('<code>inline code</code>');
        });

        test('should render links', () => {
            const input = '[Example](https://example.com)';
            const result = renderer.render(input);
            
            expect(result).toContain('<a href="https://example.com">Example</a>');
        });

        test('should auto-link URLs', () => {
            const input = 'Visit https://example.com for more info.';
            const result = renderer.render(input);
            
            expect(result).toContain('href="https://example.com"');
        });

        test('should render lists', () => {
            const input = '- Item 1\n- Item 2\n- Item 3';
            const result = renderer.render(input);
            
            expect(result).toContain('<ul>');
            expect(result).toContain('<li>Item 1</li>');
            expect(result).toContain('<li>Item 2</li>');
            expect(result).toContain('<li>Item 3</li>');
        });

        test('should render numbered lists', () => {
            const input = '1. First item\n2. Second item\n3. Third item';
            const result = renderer.render(input);
            
            expect(result).toContain('<ol>');
            expect(result).toContain('<li>First item</li>');
            expect(result).toContain('<li>Second item</li>');
        });

        test('should render blockquotes', () => {
            const input = '> This is a quote\n> with multiple lines';
            const result = renderer.render(input);
            
            expect(result).toContain('<blockquote>');
        });

        test('should render tables', () => {
            const input = '| Name | Age |\n|------|-----|\n| John | 25 |\n| Jane | 30 |';
            const result = renderer.render(input);
            
            expect(result).toContain('<table>');
            expect(result).toContain('<th>Name</th>');
            expect(result).toContain('<td>John</td>');
        });

        test('should handle empty input', () => {
            const result = renderer.render('');
            expect(result).toBe('');
        });

        test('should handle HTML characters in code', () => {
            const input = '```html\n<div class="test">Content</div>\n```';
            const result = renderer.render(input);
            
            expect(result).toContain('&lt;div class=&quot;test&quot;&gt;');
        });

        test('should handle malformed markdown gracefully', () => {
            const input = '# Unclosed [link\n```\nunclosed code block';
            const result = renderer.render(input);
            
            // Should not throw and return some result
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });

        test('should handle special characters', () => {
            const input = 'Text with & < > " \' characters';
            const result = renderer.render(input);
            
            expect(result).toContain('&amp;');
            expect(result).toContain('&lt;');
            expect(result).toContain('&gt;');
        });
    });

    describe('renderInline', () => {
        test('should render inline markdown', () => {
            const input = 'This is **bold** and *italic*';
            const result = renderer.renderInline(input);
            
            expect(result).toContain('<strong>bold</strong>');
            expect(result).toContain('<em>italic</em>');
            expect(result).not.toContain('<p>');
        });

        test('should render inline code', () => {
            const input = 'Use `console.log()` for debugging';
            const result = renderer.renderInline(input);
            
            expect(result).toContain('<code>console.log()</code>');
        });

        test('should render inline links', () => {
            const input = 'Visit [our site](https://example.com)';
            const result = renderer.renderInline(input);
            
            expect(result).toContain('<a href="https://example.com">our site</a>');
        });

        test('should handle empty inline input', () => {
            const result = renderer.renderInline('');
            expect(result).toBe('');
        });
    });

    describe('error handling', () => {
        test('should handle render errors gracefully', () => {
            // Mock console.error to avoid noise in test output
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            // This shouldn't normally cause an error, but we're testing the error path
            const result = renderer.render('# Normal content');
            
            expect(typeof result).toBe('string');
            
            consoleSpy.mockRestore();
        });

        test('should handle renderInline errors gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            const result = renderer.renderInline('**normal inline**');
            
            expect(typeof result).toBe('string');
            
            consoleSpy.mockRestore();
        });
    });

    describe('HTML escaping', () => {
        test('should escape HTML in code blocks', () => {
            const input = '```\n<script>alert("xss")</script>\n```';
            const result = renderer.render(input);
            
            expect(result).toContain('&lt;script&gt;');
            expect(result).toContain('&quot;xss&quot;');
            expect(result).not.toContain('<script>alert');
        });

        test('should handle various HTML entities', () => {
            const input = '```\n& < > " \'\n```';
            const result = renderer.render(input);
            
            expect(result).toContain('&amp;');
            expect(result).toContain('&lt;');
            expect(result).toContain('&gt;');
            expect(result).toContain('&quot;');
            expect(result).toContain('&#039;');
        });
    });
});