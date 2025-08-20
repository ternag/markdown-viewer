#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy HTML and CSS files
const srcDir = path.join(__dirname, 'src');
const filesToCopy = ['index.html', 'styles.css'];

filesToCopy.forEach(file => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${file} to dist/`);
    } else {
        console.warn(`Warning: ${file} not found in src/`);
    }
});

console.log('Frontend build completed!');