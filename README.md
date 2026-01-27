# QEditor

**QEditor** is a live HTML/JS editor designed for building and testing web components and interactive demos in real time.

## ✨ Features

- **Live Preview** - Real-time preview using divs (no iframes)
- **Syntax Highlighting** - Prism.js with line numbers
- **Code Formatting** - Prettier integration (⌘⇧F / Ctrl+Shift+F)
- **AI Assistant** - SmartBox component for AI-powered code generation
- **Shareable URLs** - Compressed code stored in URL hash for easy sharing
- **Local Storage** - Auto-saves your work
- **Enigmatic Support** - Built-in support for the enigmatic library
- **Zero Build Steps** - Runs entirely in the browser

## 🚀 Getting Started

The editor comes with a default example using enigmatic:

```html
<script src='https://unpkg.com/enigmatic'></script>
<script>
  custom.hw = (name)=>`Hello ${name}`
  state.name = "World"
</script>
<hw data="name"></hw>
```

## 📝 Usage

- **Format Code**: Press `⌘⇧F` (Mac) or `Ctrl+Shift+F` (Windows/Linux)
- **Reset**: Click the "Reset" button to clear localStorage and reload
- **Share**: Copy the URL - your code is automatically compressed and stored in the hash
- **AI Help**: Use the SmartBox in the bottom-right corner for AI assistance

## 🔗 URL Sharing

Your code is automatically compressed and stored in the URL hash. Share the URL to share your code!

Example: `https://yoursite.com/#compressedcode`

## 🛠️ Technologies

- Prism.js for syntax highlighting
- Prettier for code formatting
- Enigmatic for component framework
- CompressionStream API for URL compression
