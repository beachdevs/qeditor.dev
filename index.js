const editor = document.getElementById('editor');
const highlightingCodeEl = document.getElementById('highlighting-code');
const previewFrame = document.getElementById('preview-frame');
const editorWrapper = document.getElementById('editor-wrapper'); // For scroll sync
const useBaseElementBtn = document.getElementById('use-base-element');

async function updatePreview(code) {
    // Clear previous content
    previewFrame.innerHTML = '';
    
    // Extract scripts from code - handle both inline and external scripts
    const scriptRegex = /<script(\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
    const scripts = [];
    let htmlContent = code.replace(scriptRegex, (match, attributes, scriptContent) => {
        scripts.push({ attributes: attributes || '', content: scriptContent || '' });
        return '';
    });
    
    // Set HTML content
    previewFrame.innerHTML = htmlContent;
    
    // Execute scripts sequentially (wait for external scripts to load)
    // Use setTimeout to ensure DOM is updated
    await new Promise(resolve => setTimeout(resolve, 0));
    
    for (const { attributes, content } of scripts) {
            try {
                const script = document.createElement('script');
                
                // Parse attributes (like src, type, etc.)
                let hasSrc = false;
                if (attributes) {
                    const srcMatch = attributes.match(/src=['"]([^'"]+)['"]/i);
                    if (srcMatch) {
                        script.src = srcMatch[1];
                        hasSrc = true;
                    }
                    
                    const typeMatch = attributes.match(/type=['"]([^'"]+)['"]/i);
                    if (typeMatch) {
                        script.type = typeMatch[1];
                    }
                }
                
                // Set content if it's an inline script
                if (content.trim()) {
                    script.textContent = content;
                }
                
                // Wait for external scripts to load before continuing
                if (hasSrc) {
                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = () => reject(new Error(`Failed to load script: ${script.src}`));
                        previewFrame.appendChild(script);
                    });
                } else {
                    previewFrame.appendChild(script);
                    // Small delay to ensure inline scripts execute
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            } catch (e) {
                const errorDisplay = document.createElement('div');
                errorDisplay.style.cssText = 'color: red; font-family: monospace; white-space: pre-wrap; padding: 10px; border-bottom: 1px solid red;';
                errorDisplay.textContent = `JavaScript Error:\n${e.message}`;
                previewFrame.insertBefore(errorDisplay, previewFrame.firstChild);
                console.error("Error in preview:", e);
            }
        }
    
    // Listen for state updates
    previewFrame.addEventListener('state-update', (e) => {
        const { prop, value } = e.detail;
        previewFrame.querySelectorAll(`[data="${prop}"]`)
            .forEach(el => el.textContent = value);
    });
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

// Compression/decompression using CompressionStream API with fallback
async function compressCode(str) {
    if (typeof CompressionStream === 'undefined') {
        // Fallback: simple base64 encoding
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16))));
    }
    try {
        const encoder = new TextEncoder();
        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        writer.write(encoder.encode(str));
        writer.close();
        const compressed = await new Response(stream.readable).arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(compressed)));
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    } catch (e) {
        console.error('Compression error:', e);
        // Fallback
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16))));
    }
}

async function decompressCode(compressed) {
    try {
        if (typeof DecompressionStream === 'undefined') {
            // Fallback: simple base64 decoding
            return decodeURIComponent(atob(compressed).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        }
        const base64 = compressed.replace(/-/g, '+').replace(/_/g, '/');
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        writer.write(bytes);
        writer.close();
        const decompressed = await new Response(stream.readable).arrayBuffer();
        return new TextDecoder().decode(decompressed);
    } catch (e) {
        console.error('Decompression error:', e);
        // Fallback
        try {
            return decodeURIComponent(atob(compressed).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        } catch (e2) {
            return null;
        }
    }
}

// Default editor content
const defaultContent = `<script src='https://unpkg.com/enigmatic'></script>
<script>
  custom.hw = ()=>'Hello world!'
</script>
<hw></hw>`;

// Load from URL hash first, then localStorage, then default
const hash = window.location.hash.slice(1); // Remove #
if (hash) {
    decompressCode(hash).then(decompressed => {
        if (decompressed) {
            editor.value = decompressed;
            editor.dispatchEvent(new Event('input'));
        } else {
            const saved = localStorage.getItem(storeKey);
            if (saved != null) {
                editor.value = saved;
                editor.dispatchEvent(new Event('input'));
            } else {
                editor.value = defaultContent;
                editor.dispatchEvent(new Event('input'));
            }
        }
    });
} else {
    const saved = localStorage.getItem(storeKey);
    if (saved != null) {
        editor.value = saved;
        editor.dispatchEvent(new Event('input'));
    } else {
        editor.value = defaultContent;
        editor.dispatchEvent(new Event('input'));
    }
}

// Update URL and localStorage when content changes
let updateTimeout;
editor.addEventListener('input', () => {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(async () => {
        const code = editor.value;
        localStorage.setItem(storeKey, code);
        
        // Compress and update URL hash
        const compressed = await compressCode(code);
        if (compressed) {
            window.location.hash = compressed;
        } else {
            window.location.hash = '';
        }
    }, 1000);
});

// Listen for hash changes (back/forward navigation)
window.addEventListener('hashchange', async () => {
    const hash = window.location.hash.slice(1);
    if (hash) {
        const decompressed = await decompressCode(hash);
        if (decompressed && decompressed !== editor.value) {
            editor.value = decompressed;
            editor.dispatchEvent(new Event('input'));
        }
    }
});
