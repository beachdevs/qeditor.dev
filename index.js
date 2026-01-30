const editor = document.getElementById('editor');
const highlightingCodeEl = document.getElementById('highlighting-code');
const previewFrame = document.getElementById('preview-frame');

async function updatePreview(code) {
    previewFrame.innerHTML = '';
    const scriptRegex = /<script(\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
    const scripts = [];
    let htmlContent = code.replace(scriptRegex, (match, attributes, scriptContent) => {
        scripts.push({ attributes: attributes || '', content: scriptContent || '' });
        return '';
    });
    previewFrame.innerHTML = htmlContent;
    await new Promise(r => setTimeout(r, 0));
    for (const { attributes, content } of scripts) {
            try {
                const script = document.createElement('script');
                let hasSrc = false;
                if (attributes) {
                    const srcMatch = attributes.match(/src=['"]([^'"]+)['"]/i);
                    if (srcMatch) {
                        script.src = srcMatch[1];
                        hasSrc = true;
                    }
                    
                    const typeMatch = attributes.match(/type=['"]([^'"]+)['"]/i);
                    if (typeMatch) script.type = typeMatch[1];
                }
                if (content.trim()) {
                    script.textContent = content;
                }
                if (hasSrc) {
                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = () => reject(new Error(`Failed to load script: ${script.src}`));
                        previewFrame.appendChild(script);
                    });
                } else {
                    previewFrame.appendChild(script);
                    await new Promise(r => setTimeout(r, 0));
                }
            } catch (e) {
                const errorDisplay = document.createElement('div');
                errorDisplay.style.cssText = 'color: red; font-family: monospace; white-space: pre-wrap; padding: 10px; border-bottom: 1px solid red;';
                errorDisplay.textContent = `JavaScript Error:\n${e.message}`;
                previewFrame.insertBefore(errorDisplay, previewFrame.firstChild);
                console.error("Error in preview:", e);
            }
        }
    
}

async function formatCode(code) {
    try {
        return await prettier.format(code, {
            parser: "html",
            plugins: prettierPlugins,
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
        return code;
    }
}

function syncScroll() {
    const pre = document.getElementById('highlighting-pre');
    pre.scrollTop = editor.scrollTop;
    pre.scrollLeft = editor.scrollLeft;
}

function toBase64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
}
function fromBase64(str) {
    return decodeURIComponent(atob(str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
}

let updateTimeout;
editor.addEventListener('input', () => {
    const code = editor.value;
    const hcode = code.endsWith('\n') ? code + ' ' : code;
    highlightingCodeEl.textContent = hcode;
    Prism.highlightElement(highlightingCodeEl);
    updatePreview(code);
    syncScroll();
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(async () => {
        localStorage.setItem(storeKey, code);
        const compressed = await compressCode(code);
        window.location.hash = compressed || '';
    }, 1000);
});

previewFrame.addEventListener('state-update', (e) => {
    const { prop, value } = e.detail;
    previewFrame.querySelectorAll(`[data="${prop}"]`).forEach(el => { el.textContent = value; });
});

editor.addEventListener('scroll', syncScroll);

window.addEventListener("keydown", async e => {
    const isMac = navigator.platform.includes("Mac");
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
        if (cmdOrCtrl && e.shiftKey && e.key.toUpperCase() === "F") {
        e.preventDefault();
        if (typeof prettier === "undefined" || typeof prettierPlugins === "undefined") {
            alert("Prettier is still loading... Please wait a moment and try again.");
            return;
        }

        try {
            const formatted = await formatCode(editor.value);
            editor.value = formatted;
            editor.dispatchEvent(new Event("input"));
        } catch (err) {
            console.error("Prettier formatting failed:", err);
            alert("Formatting failed. Check console for details.");
        }
    }
});

const storeKey = 'qeditor-content';

async function compressCode(str) {
    if (typeof CompressionStream === 'undefined') return toBase64(str);
    try {
        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        writer.write(new TextEncoder().encode(str));
        writer.close();
        const buf = await new Response(stream.readable).arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    } catch (e) {
        console.error('Compression error:', e);
        return toBase64(str);
    }
}

async function decompressCode(compressed) {
    if (typeof DecompressionStream === 'undefined') {
        try { return fromBase64(compressed); } catch { return null; }
    }
    try {
        const base64 = compressed.replace(/-/g, '+').replace(/_/g, '/');
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        writer.write(bytes);
        writer.close();
        const buf = await new Response(stream.readable).arrayBuffer();
        return new TextDecoder().decode(buf);
    } catch (e) {
        console.error('Decompression error:', e);
        try { return fromBase64(compressed); } catch { return null; }
    }
}

const defaultContent = `<script src='https://unpkg.com/enigmatic'></script>
<script>
  custom.hw = (name)=>\`Hello ${name}\`
  state.name = "World"
</script>
<hw data="name"></hw>`;

function setContent(val) {
    editor.value = val;
    editor.dispatchEvent(new Event('input'));
}
const hash = window.location.hash.slice(1);
if (hash) {
    decompressCode(hash).then(d => setContent(d || localStorage.getItem(storeKey) || defaultContent));
} else {
    setContent(localStorage.getItem(storeKey) || defaultContent);
}

// Hash changes (back/forward)
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
