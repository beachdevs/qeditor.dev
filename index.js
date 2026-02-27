const editor = document.getElementById('editor');
const editorView = document.getElementById('editor-view');
const previewFrame = document.getElementById('preview-frame');
const toggleCodeBtn = document.getElementById('toggle-code-btn');
const MARKDOWN_SENTINEL = '<!-- markdown -->';
const md = typeof window.markdownit === 'function'
    ? window.markdownit({
        html: false,
        linkify: true,
        typographer: true,
        breaks: true
    })
    : null;
let lastAceMode = null;
const aceEditor = window.ace && editorView
    ? window.ace.edit(editorView, {
        mode: 'ace/mode/html',
        theme: 'ace/theme/tomorrow_night_eighties',
        fontSize: '11px',
        fontFamily: "'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        showPrintMargin: false,
        tabSize: 2,
        useSoftTabs: true,
        wrap: false
    })
    : null;

if (aceEditor) {
    aceEditor.session.setUseWorker(false);
}
document.body.classList.toggle('ace-unavailable', !aceEditor);

const CODE_FRAME_HIDDEN_KEY = 'qeditor-code-frame-hidden';

function setCodeFrameHidden(hidden) {
    document.body.classList.toggle('code-frame-hidden', hidden);
    if (!toggleCodeBtn) return;
    toggleCodeBtn.textContent = hidden ? 'Show Code' : 'Hide Code';
    toggleCodeBtn.setAttribute('aria-expanded', String(!hidden));
}

if (toggleCodeBtn) {
    const saved = localStorage.getItem(CODE_FRAME_HIDDEN_KEY) === '1';
    setCodeFrameHidden(saved);
    toggleCodeBtn.addEventListener('click', () => {
        const willHide = !document.body.classList.contains('code-frame-hidden');
        setCodeFrameHidden(willHide);
        localStorage.setItem(CODE_FRAME_HIDDEN_KEY, willHide ? '1' : '0');
    });
}

const PREVIEW_CSP = [
    "default-src 'none'",
    "script-src 'unsafe-inline' 'unsafe-eval' https: blob:",
    "style-src 'unsafe-inline' https:",
    "img-src https: data: blob:",
    "font-src https: data:",
    "connect-src https: wss:",
    "media-src https: data: blob:",
    "frame-src https:",
    "worker-src blob:",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action https: http:"
].join('; ');

function sanitizePreviewHead(headHtml = '') {
    const template = document.createElement('template');
    template.innerHTML = headHtml;
    template.content.querySelectorAll('meta[http-equiv], base').forEach(el => el.remove());
    return template.innerHTML;
}

function isMarkdownDocument(code = '') {
    const firstLine = (code || '').split(/\r?\n/, 1)[0].trim();
    return firstLine === MARKDOWN_SENTINEL;
}

function stripMarkdownSentinel(code = '') {
    if (!isMarkdownDocument(code)) return code || '';
    return (code || '').replace(/^.*(?:\r?\n|$)/, '');
}

function escapeHtml(str = '') {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderMarkdown(markdownSource = '') {
    if (md) return md.render(markdownSource);
    return `<pre>${escapeHtml(markdownSource)}</pre>`;
}

function syncEditorMode(code) {
    if (!aceEditor) return;
    const nextMode = isMarkdownDocument(code) ? 'ace/mode/markdown' : 'ace/mode/html';
    if (nextMode === lastAceMode) return;
    aceEditor.session.setMode(nextMode);
    lastAceMode = nextMode;
}

function buildPreviewSrcdoc(code) {
    if (isMarkdownDocument(code)) {
        const markdownSource = stripMarkdownSentinel(code);
        const markdownHtml = renderMarkdown(markdownSource);
        return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">
  <style>
    html, body {
      margin: 0;
      padding: 20px;
      min-height: 100%;
      box-sizing: border-box;
      background: #252526;
      color: #d4d4d4;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      scrollbar-color: #4b4b4d #1b1b1d;
    }
    html::-webkit-scrollbar,
    body::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    html::-webkit-scrollbar-track,
    body::-webkit-scrollbar-track {
      background: #1b1b1d;
    }
    html::-webkit-scrollbar-thumb,
    body::-webkit-scrollbar-thumb {
      background: #4b4b4d;
      border-radius: 8px;
      border: 2px solid #1b1b1d;
    }
    html::-webkit-scrollbar-thumb:hover,
    body::-webkit-scrollbar-thumb:hover {
      background: #616166;
    }
    .markdown-body {
      max-width: 900px;
      margin: 0 auto;
      line-height: 1.7;
      font-size: 16px;
    }
    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3,
    .markdown-body h4 {
      color: #f1f5f9;
      margin-top: 1.5em;
      margin-bottom: 0.55em;
      line-height: 1.25;
    }
    .markdown-body p,
    .markdown-body li,
    .markdown-body blockquote {
      color: #d4d4d4;
    }
    .markdown-body a {
      color: #8ab4f8;
      text-decoration: none;
    }
    .markdown-body a:hover {
      text-decoration: underline;
    }
    .markdown-body code {
      background: #1b1b1d;
      color: #f59e9e;
      border: 1px solid #343437;
      border-radius: 6px;
      padding: 0.15em 0.35em;
      font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, monospace;
      font-size: 0.92em;
    }
    .markdown-body pre {
      background: #1b1b1d;
      border: 1px solid #343437;
      border-radius: 10px;
      padding: 12px;
      overflow: auto;
    }
    .markdown-body pre code {
      background: transparent;
      border: 0;
      color: #e5e7eb;
      padding: 0;
    }
    .markdown-body blockquote {
      margin: 1em 0;
      padding: 0.1em 1em;
      border-left: 3px solid #4b5563;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 0 8px 8px 0;
    }
    .markdown-body hr {
      border: 0;
      border-top: 1px solid #343437;
      margin: 1.5em 0;
    }
    .markdown-body table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
    }
    .markdown-body th,
    .markdown-body td {
      border: 1px solid #343437;
      padding: 8px 10px;
      text-align: left;
    }
    .markdown-body th {
      background: #212224;
      color: #f1f5f9;
    }
  </style>
</head>
<body>
  <article class="markdown-body">
    ${markdownHtml}
  </article>
</body>
</html>`;
    }

    const parser = new DOMParser();
    const parsed = parser.parseFromString(code || '', 'text/html');
    const headHtml = sanitizePreviewHead(parsed.head ? parsed.head.innerHTML : '');
    const bodyHtml = parsed.body && parsed.body.innerHTML.trim()
        ? parsed.body.innerHTML
        : (code || '');

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">
  ${headHtml}
  <style>
    html, body {
      margin: 0;
      padding: 20px;
      min-height: 100%;
      box-sizing: border-box;
      background: #252526;
      color: #d4d4d4;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      scrollbar-color: #4b4b4d #1b1b1d;
    }
    html::-webkit-scrollbar,
    body::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    html::-webkit-scrollbar-track,
    body::-webkit-scrollbar-track {
      background: #1b1b1d;
    }
    html::-webkit-scrollbar-thumb,
    body::-webkit-scrollbar-thumb {
      background: #4b4b4d;
      border-radius: 8px;
      border: 2px solid #1b1b1d;
    }
    html::-webkit-scrollbar-thumb:hover,
    body::-webkit-scrollbar-thumb:hover {
      background: #616166;
    }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function updatePreview(code) {
    // Run untrusted editor code inside an isolated, sandboxed iframe.
    previewFrame.srcdoc = buildPreviewSrcdoc(code);
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

function toBase64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
}
function fromBase64(str) {
    return decodeURIComponent(atob(str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
}

function toPaddedBase64(str) {
    const normalized = (str || '').replace(/-/g, '+').replace(/_/g, '/');
    const paddingNeeded = (4 - (normalized.length % 4)) % 4;
    return normalized + '='.repeat(paddingNeeded);
}

let updateTimeout;
let syncingFromAce = false;
let syncingToAce = false;

if (aceEditor) {
    aceEditor.session.on('change', () => {
        if (syncingToAce) return;
        syncingFromAce = true;
        editor.value = aceEditor.getValue();
        editor.dispatchEvent(new Event('input'));
        syncingFromAce = false;
    });
}

editor.addEventListener('input', () => {
    const code = editor.value;
    syncEditorMode(code);
    if (aceEditor && !syncingFromAce && aceEditor.getValue() !== code) {
        syncingToAce = true;
        aceEditor.setValue(code, -1);
        syncingToAce = false;
    }
    updatePreview(code);
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(async () => {
        localStorage.setItem(storeKey, code);
        const compressed = await compressCode(code);
        window.location.hash = compressed || '';
    }, 1000);
});

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
            const source = aceEditor ? aceEditor.getValue() : editor.value;
            const formatted = await formatCode(source);
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
        try { return fromBase64(toPaddedBase64(compressed)); } catch { return null; }
    }
    try {
        const base64 = toPaddedBase64(compressed);
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

const defaultContent = `<style>
  .simon-wrap {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: radial-gradient(circle at 20% 10%, #263348 0%, #111827 45%, #090d16 100%);
    color: #e5e7eb;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: -20px;
    padding: 20px;
  }

  .simon-ui {
    width: min(420px, 92vw);
    text-align: center;
    transform: translateY(-16px);
  }

  .simon-title {
    margin: 0 0 12px;
    font-size: 30px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .simon-board {
    width: 100%;
    aspect-ratio: 1 / 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 12px;
    border-radius: 20px;
    background: #0f172a;
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }

  .pad {
    border: none;
    border-radius: 16px;
    cursor: pointer;
    opacity: 0.75;
    transform: scale(1);
    transition: transform 0.08s ease, opacity 0.1s ease, filter 0.12s ease;
  }

  .pad:active {
    transform: scale(0.98);
  }

  .pad.green { background: #22c55e; }
  .pad.red { background: #ef4444; }
  .pad.yellow { background: #f59e0b; }
  .pad.blue { background: #3b82f6; }

  .pad.active {
    opacity: 1;
    filter: brightness(1.3);
    box-shadow: 0 0 28px rgba(255, 255, 255, 0.35);
  }

  .simon-controls {
    margin-top: 14px;
    display: flex;
    gap: 10px;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }

  .simon-start {
    border: 1px solid #334155;
    border-radius: 10px;
    background: #0e639c;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    padding: 8px 16px;
    cursor: pointer;
  }

  .simon-round {
    border: 1px solid #334155;
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 13px;
    color: #cbd5e1;
    background: #0b1220;
  }

  .simon-status {
    margin: 12px 0 0;
    font-size: 13px;
    color: #94a3b8;
    min-height: 1.3em;
  }
</style>

<div class="simon-wrap">
  <div class="simon-ui">
    <div class="simon-board" aria-label="Simon board">
      <button class="pad green" data-pad="0" aria-label="Green pad"></button>
      <button class="pad red" data-pad="1" aria-label="Red pad"></button>
      <button class="pad yellow" data-pad="2" aria-label="Yellow pad"></button>
      <button class="pad blue" data-pad="3" aria-label="Blue pad"></button>
    </div>

    <div class="simon-controls">
      <button class="simon-start" id="simon-start">Start Game</button>
      <span class="simon-round" id="simon-round">Round 0</span>
    </div>

    <p class="simon-status" id="simon-status">Press Start Game to begin.</p>
  </div>
</div>

<script>
(() => {
  const pads = Array.from(document.querySelectorAll('.pad'));
  const startBtn = document.getElementById('simon-start');
  const roundEl = document.getElementById('simon-round');
  const statusEl = document.getElementById('simon-status');
  const tones = [261.63, 329.63, 392.0, 523.25];

  let sequence = [];
  let userStep = 0;
  let acceptingInput = false;
  let round = 0;
  let audioCtx = null;

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function updateRound() {
    roundEl.textContent = 'Round ' + round;
  }

  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playTone(freq, durationMs) {
    try {
      ensureAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.14, audioCtx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + durationMs / 1000 + 0.02);
    } catch (_) {
      // Audio can fail if blocked; game still works visually.
    }
  }

  function playBuzz(durationMs = 260) {
    try {
      ensureAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const start = audioCtx.currentTime;
      const end = start + durationMs / 1000;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, start);
      osc.frequency.exponentialRampToValueAtTime(72, end);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.2, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(end + 0.02);
    } catch (_) {
      // Ignore audio errors to keep gameplay responsive.
    }
  }

  async function playGameOverBuzz() {
    playBuzz(260);
    await sleep(120);
    playBuzz(300);
    if (navigator.vibrate) {
      navigator.vibrate([100, 60, 130]);
    }
  }

  function flashPad(index, duration = 330) {
    return new Promise(resolve => {
      const pad = pads[index];
      if (!pad) return resolve();
      pad.classList.add('active');
      playTone(tones[index], duration);
      setTimeout(() => {
        pad.classList.remove('active');
        resolve();
      }, duration);
    });
  }

  async function playSequence() {
    acceptingInput = false;
    setStatus('Watch the sequence...');
    await sleep(350);
    for (const step of sequence) {
      await flashPad(step, 360);
      await sleep(130);
    }
    userStep = 0;
    acceptingInput = true;
    setStatus('Your turn.');
  }

  async function nextRound() {
    round += 1;
    updateRound();
    sequence.push(Math.floor(Math.random() * 4));
    await playSequence();
  }

  async function startGame() {
    sequence = [];
    userStep = 0;
    round = 0;
    acceptingInput = false;
    updateRound();
    setStatus('Get ready...');
    await sleep(250);
    nextRound();
  }

  async function handlePadInput(index) {
    if (!acceptingInput) return;
    await flashPad(index, 180);

    if (index !== sequence[userStep]) {
      acceptingInput = false;
      await playGameOverBuzz();
      setStatus('Wrong move. Press Start Game to try again.');
      return;
    }

    userStep += 1;
    if (userStep < sequence.length) return;

    acceptingInput = false;
    if (round >= 12) {
      setStatus('You win. Incredible memory.');
      return;
    }

    setStatus('Nice! Next round...');
    await sleep(650);
    nextRound();
  }

  pads.forEach(pad => {
    pad.addEventListener('click', () => {
      const index = Number(pad.dataset.pad || '0');
      handlePadInput(index);
    });
  });

  startBtn.addEventListener('click', startGame);
})();
</script>`;

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
