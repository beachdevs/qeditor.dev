const editor = document.getElementById('editor');
const highlightingCodeEl = document.getElementById('highlighting-code');
const previewFrame = document.getElementById('preview-frame');
const editorWrapper = document.getElementById('editor-wrapper'); // For scroll sync
const useBaseElementBtn = document.getElementById('use-base-element');

function updatePreview(code) {
    const iframeContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <script>
                window.onerror = function(message, source, lineno, colno, error) {
                    const errorDisplay = document.createElement('div');
                    errorDisplay.style.color = 'red';
                    errorDisplay.style.fontFamily = 'monospace';
                    errorDisplay.style.whiteSpace = 'pre-wrap';
                    errorDisplay.style.padding = '10px';
                    errorDisplay.style.borderBottom = '1px solid red';
                    errorDisplay.textContent = \`JavaScript Error:\\n\${message}\n(Line: \${lineno}, Column: \${colno})\`;
                    if (document.body) {
                        document.body.insertBefore(errorDisplay, document.body.firstChild);
                    } else {
                        document.documentElement.prepend(errorDisplay);
                    }
                    // So error is also visible in browser console for more details
                    console.error("Error in preview:", message, "at", source, lineno, colno, error);
                    return true; // Prevent default browser error handling in preview
                };
            <\/script>
        </head>
        <body>
            ${code}
        </body>
        </html>
    `;
    previewFrame.srcdoc = iframeContent;
}

// Renamed from formatJS to formatCode for clarity
async function formatCode(code) {
    try {
        // Added plugins: prettierPlugins
        return await prettier.format(code, {
            parser: "html",
            plugins: prettierPlugins, // Crucial for making parsers available
            printWidth: 120,
            tabWidth: 2,
            useTabs: false,
            singleQuote: true,
            bracketSameLine: true,
            htmlWhitespaceSensitivity: 'ignore',
            embeddedLanguageFormatting: 'auto'
        });
    } catch (err) {
        console.error("Formatting error:", err);
        return code; // Return original code on error
    }
}

function syncScroll() {
    const pre = document.getElementById('highlighting-pre');
    pre.scrollTop = editor.scrollTop;
    pre.scrollLeft = editor.scrollLeft;
}

editor.addEventListener('input', () => {
    const code = editor.value;
    const hcode = code.endsWith('\n') ? code + ' ' : code;
    highlightingCodeEl.textContent = hcode;
    Prism.highlightElement(highlightingCodeEl);
    updatePreview(code);
    syncScroll(); // Sync scroll on input
});

editor.addEventListener('scroll', syncScroll); // Sync scroll on textarea scroll

window.addEventListener("keydown", async e => {
    const isMac = navigator.platform.includes("Mac");
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
    if (cmdOrCtrl && e.shiftKey && e.key.toUpperCase() === "F") {
        e.preventDefault();

        // Wait for Prettier and plugins to load
        if (typeof prettier === "undefined" || typeof prettierPlugins === "undefined") {
            alert("Prettier is still loading... Please wait a moment and try again.");
            return;
        }

        try {
            // Call the renamed function formatCode
            const formatted = await formatCode(editor.value);
            editor.value = formatted;
            editor.dispatchEvent(new Event("input")); // update preview + highlight
        } catch (err) {
            console.error("Prettier formatting failed:", err);
            alert("Formatting failed. Check console for details.");
        }
    }
});

const storeKey = 'qeditor-content';

// UTF-8 safe base64 encoding/decoding
function base64Encode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16))));
}

function base64Decode(str) {
    return decodeURIComponent(atob(str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
}

// Load from URL first, then localStorage
const urlParams = new URLSearchParams(window.location.search);
const urlCode = urlParams.get('code');
if (urlCode) {
    try {
        editor.value = base64Decode(urlCode);
    } catch (e) {
        console.error('Failed to decode URL code:', e);
        const saved = localStorage.getItem(storeKey);
        if (saved != null) editor.value = saved;
    }
} else {
    const saved = localStorage.getItem(storeKey);
    if (saved != null) editor.value = saved;
}

editor.dispatchEvent(new Event('input'));

// Update URL and localStorage when content changes
let updateTimeout;
editor.addEventListener('input', () => {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
        const code = editor.value;
        localStorage.setItem(storeKey, code);
        
        // Update URL without page reload
        const encoded = base64Encode(code);
        const newUrl = new URL(window.location);
        if (encoded) {
            newUrl.searchParams.set('code', encoded);
        } else {
            newUrl.searchParams.delete('code');
        }
        window.history.replaceState({}, '', newUrl);
    }, 1000);
});
