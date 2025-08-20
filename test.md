# Markdown Viewer Test Document

This is a test document to demonstrate the functionality of the Markdown Viewer MVP.

## Features Tested

### Text Formatting

**Bold text** and *italic text* work correctly.

You can also use ~~strikethrough~~ text.

### Code Blocks

Here's some TypeScript code:

```typescript
interface User {
    name: string;
    age: number;
    isActive: boolean;
}

function greetUser(user: User): string {
    return `Hello, ${user.name}! You are ${user.age} years old.`;
}

const user: User = {
    name: "Alice",
    age: 30,
    isActive: true
};

console.log(greetUser(user));
```

And some Python:

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Generate first 10 fibonacci numbers
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
```

Inline code: `const value = 42;`

### Lists

#### Unordered List
- Item one
- Item two
  - Nested item
  - Another nested item
- Item three

#### Ordered List
1. First item
2. Second item
   1. Nested ordered item
   2. Another nested ordered item
3. Third item

### Links and Images

[Visit the Tauri website](https://tauri.app)

### Tables

| Feature | Status | Notes |
|---------|--------|-------|
| File Opening | ✅ | Works via dialog and CLI |
| Markdown Rendering | ✅ | Using markdown-it |
| Syntax Highlighting | ✅ | Using Prism.js |
| Text Selection | ✅ | Native browser selection |
| Cross-platform | ✅ | Tauri handles this |

### Blockquotes

> This is a blockquote.
> 
> It can span multiple lines and contains **formatted text**.

### Horizontal Rule

---

## Keyboard Shortcuts

- **Ctrl/Cmd+O**: Open file
- **F5**: Reload current file  
- **Shift+?**: Show/hide shortcuts

## Technical Details

This application is built with:
- **Backend**: Rust + Tauri
- **Frontend**: TypeScript + Vanilla JS
- **Markdown Parser**: markdown-it
- **Syntax Highlighter**: Prism.js

The app successfully demonstrates all MVP requirements:
1. ✅ Open and display markdown files
2. ✅ Cross-platform compatibility 
3. ✅ Basic markdown rendering with syntax highlighting
4. ✅ Single instance per file enforcement
5. ✅ Text selection functionality