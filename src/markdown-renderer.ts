import MarkdownIt from 'markdown-it';

export class MarkdownRenderer {
    private md: MarkdownIt;

    constructor() {
        this.md = new MarkdownIt({
            html: true,
            linkify: true,
            typographer: true,
            breaks: false,
            highlight: (str, lang) => {
                // Basic syntax highlighting markup for Prism.js
                if (lang && lang.trim()) {
                    return `<pre class="language-${lang}"><code class="language-${lang}">${this.escapeHtml(str)}</code></pre>`;
                }
                return `<pre><code>${this.escapeHtml(str)}</code></pre>`;
            }
        });
    }

    private escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    render(content: string): string {
        try {
            return this.md.render(content);
        } catch (error) {
            console.error('Error rendering markdown:', error);
            return `<div class="error">Error rendering markdown: ${error}</div>`;
        }
    }

    renderInline(content: string): string {
        try {
            return this.md.renderInline(content);
        } catch (error) {
            console.error('Error rendering inline markdown:', error);
            return content;
        }
    }
}