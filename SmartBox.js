class SmartBox extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
      :host {
        --bg: #252526;
        --bg-elev: #2d2d30;
        --bg-input: #1f1f1f;
        --border: #3c3c3c;
        --text: #d4d4d4;
        --muted: #9da0a6;
        --accent: #0e639c;
        --accent-hover: #1177bb;
        --accent-active: #0b4f7c;
        --danger: #f48771;
        display: block;
        width: 100%;
        max-width: 380px;
        font-family: 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif;
        border: 1px solid var(--border);
        border-radius: 14px;
        overflow: hidden;
        color: var(--text);
        background: linear-gradient(180deg, #2a2a2d 0%, var(--bg) 100%);
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.03);
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-bottom: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.02);
      }
      .header-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .title {
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: 700;
        color: var(--muted);
      }
      .hint {
        font-size: 11px;
        color: var(--muted);
      }
      .toggle-response {
        border: 1px solid var(--border);
        border-radius: 7px;
        background: var(--bg-input);
        color: var(--text);
        font-size: 11px;
        line-height: 1;
        padding: 6px 8px;
        cursor: pointer;
      }
      .toggle-response:hover {
        border-color: #4b5563;
      }
      .toggle-response.active {
        border-color: var(--accent);
        box-shadow: 0 0 0 1px rgba(14, 99, 156, 0.3) inset;
      }
      .toggle-response:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .container {
        display: flex;
        flex-direction: column;
        padding: 12px;
        gap: 10px;
      }
      .output {
        position: relative;
        padding: 12px;
        padding-bottom: 40px;
        border: 1px solid var(--border);
        background: var(--bg-elev);
        font-size: 13px;
        white-space: pre-wrap;
        word-wrap: break-word;
        border-radius: 10px;
        min-height: 52px;
        color: var(--text);
        line-height: 1.5;
        max-height: 300px;
        overflow: hidden;
      }
      .output-content {
        max-height: 238px;
        overflow-y: auto;
        padding-right: 8px;
      }
      .output-content::-webkit-scrollbar {
        width: 8px;
      }
      .output-content::-webkit-scrollbar-thumb {
        background: #4d4d50;
        border-radius: 999px;
      }
      .output.hidden { display: none !important; }
      .input-row {
        display: flex;
        gap: 8px;
      }
      input[type="text"] {
        flex: 1;
        width: 100%;
        box-sizing: border-box;
        padding: 10px 12px;
        font-size: 14px;
        color: var(--text);
        border: 1px solid var(--border);
        background: var(--bg-input);
        border-radius: 10px;
        transition: border-color 0.18s, box-shadow 0.18s;
      }
      input[type="text"]::placeholder {
        color: var(--muted);
      }
      input[type="text"]:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 2px rgba(14, 99, 156, 0.35);
        outline: none;
      }
      .send-button {
        padding: 0 12px;
        min-width: 64px;
        border: 1px solid transparent;
        border-radius: 10px;
        background: var(--accent);
        color: #fff;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.03em;
      }
      .send-button:hover {
        background: var(--accent-hover);
      }
      .send-button:active {
        background: var(--accent-active);
      }
      .send-button:disabled,
      input[type="text"]:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
      .status-message .output-content {
        font-style: italic;
        color: var(--muted);
      }
      .error-message .output-content {
        color: var(--danger);
        font-weight: 600;
      }
      .copy-button {
        position: absolute;
        bottom: 8px;
        right: 8px;
        padding: 5px 9px;
        background: var(--accent);
        color: #fff;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 600;
        display: none;
      }
      .copy-button.visible { display: block; }
    `;

    const header = document.createElement("div");
    header.classList.add("header");

    const title = document.createElement("div");
    title.classList.add("title");
    title.textContent = "Ask Assistant";

    const hint = document.createElement("div");
    hint.classList.add("hint");
    hint.textContent = "Enter to send";

    this.toggleResponseBtn = document.createElement("button");
    this.toggleResponseBtn.type = "button";
    this.toggleResponseBtn.classList.add("toggle-response");
    this.toggleResponseBtn.textContent = "Show";
    this.toggleResponseBtn.disabled = true;
    this.toggleResponseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.responseExpanded = !this.responseExpanded;
      this.updateButtonVisibility();
    });

    const headerRight = document.createElement("div");
    headerRight.classList.add("header-right");
    headerRight.appendChild(hint);
    headerRight.appendChild(this.toggleResponseBtn);

    header.appendChild(title);
    header.appendChild(headerRight);

    const container = document.createElement("div");
    container.classList.add("container");

    this.output = document.createElement("div");
    this.output.classList.add("output", "hidden");
    this.output.setAttribute('aria-live', 'polite');

    this.outputContent = document.createElement("div");
    this.outputContent.classList.add("output-content");
    this.output.appendChild(this.outputContent);

    const copyButton = document.createElement("button");
    copyButton.classList.add("copy-button");
    copyButton.textContent = "Copy to Editor";
    copyButton.addEventListener("click", () => {
      const editor = document.getElementById("editor");
      const generated = this.outputContent.textContent || "";
      const code = this.normalizeGeneratedCode(generated);
      editor.value = code.trim();
      editor.dispatchEvent(new Event("input"));
    });
    this.output.appendChild(copyButton);
    this.copyButton = copyButton;

    this.inputRow = document.createElement("div");
    this.inputRow.classList.add("input-row");

    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.placeholder = "";
    this.input.setAttribute('aria-label', 'Ask assistant');
    this.input.addEventListener("keydown", (e) => {
      this.stopTypingDemo();
      if (e.isComposing) return;

      if (e.key === "Enter") {
        e.preventDefault();
        if (this.input.value.trim()) this.queryFromInput();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        this.responseExpanded = false;
        this.updateButtonVisibility();
        this.input.value = "";
      }
    });
    this.input.addEventListener("focus", () => this.stopTypingDemo());
    this.input.addEventListener("input", () => {
      if (this.input.value) this.stopTypingDemo();
    });

    this.sendButton = document.createElement("button");
    this.sendButton.classList.add("send-button");
    this.sendButton.type = "button";
    this.sendButton.textContent = "Ask";
    this.sendButton.addEventListener("click", () => this.queryFromInput());

    this.inputRow.appendChild(this.input);
    this.inputRow.appendChild(this.sendButton);

    container.appendChild(this.output);
    container.appendChild(this.inputRow);

    shadowRoot.appendChild(style);
    shadowRoot.appendChild(header);
    shadowRoot.appendChild(container);
    this.isLoading = false;
    this.responseExpanded = false;

    container.addEventListener("click", (e) => {
      const target = e.target;
      if (
        target !== this.input &&
        target !== this.sendButton &&
        target !== this.copyButton &&
        target !== this.toggleResponseBtn
      ) {
        this.input.focus();
      }
    });

    this.typingDemoStopped = false;
    this.typingPhrases = [
      "Make a Space Invaders game",
      "Make a Simon like game",
      "Make an Oregon Trail type game"
    ];
    this.placeholderFallback = this.typingPhrases[this.typingPhrases.length - 1];
    this.startTypingDemo();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stopTypingDemo() {
    this.typingDemoStopped = true;
    if (!this.input.value) {
      this.input.placeholder = this.placeholderFallback;
    }
  }

  canRunTypingDemo() {
    return !this.typingDemoStopped && !this.input.value && document.activeElement !== this.input;
  }

  async typePlaceholderText(text, speed = 42) {
    this.input.placeholder = "";
    for (let i = 0; i < text.length; i++) {
      if (!this.canRunTypingDemo()) return false;
      this.input.placeholder += text[i];
      await this.sleep(speed);
    }
    return true;
  }

  async startTypingDemo() {
    await this.sleep(200);
    if (!this.canRunTypingDemo()) return;

    for (let i = 0; i < this.typingPhrases.length; i++) {
      const ok = await this.typePlaceholderText(this.typingPhrases[i]);
      if (!ok) return;
      await this.sleep(500);
      if (i < this.typingPhrases.length - 1) {
        this.input.placeholder = "";
        await this.sleep(220);
      }
    }

    if (this.canRunTypingDemo()) {
      this.input.placeholder = this.placeholderFallback;
    }
  }

  normalizeGeneratedCode(text) {
    const blocks = this.extractCodeBlocks(text);
    let html = "";
    let js = "";
    let css = "";

    if (blocks.length) {
      for (const block of blocks) {
        const lang = block.lang.toLowerCase();
        if (lang === "html") {
          html += (html ? "\n\n" : "") + block.code;
        } else if (lang === "javascript" || lang === "js") {
          js += (js ? "\n\n" : "") + block.code;
        } else if (lang === "css") {
          css += (css ? "\n\n" : "") + block.code;
        } else if (!html) {
          html = block.code;
        }
      }
    } else {
      const raw = (text || "").trim();
      html = raw;
    }

    if (!html && css) {
      html = `<div></div>\n<style>\n${css}\n</style>`;
    } else if (html && css && !/<style[\s>]/i.test(html)) {
      html = `<style>\n${css}\n</style>\n${html}`;
    }

    const sanitized = this.sanitizeHtmlForPreview(html || "<div></div>");
    const scriptParts = sanitized.scripts.map(script => {
      if (script.src) {
        const typeAttr = script.type ? ` type="${script.type}"` : "";
        return `<script${typeAttr} src="${script.src}"></script>`;
      }
      const typeAttr = script.type ? ` type="${script.type}"` : "";
      return `<script${typeAttr}>\n${script.code}\n</script>`;
    });
    if (js.trim()) {
      scriptParts.push(`<script>\n${js.trim()}\n</script>`);
    }

    return [sanitized.html, ...scriptParts].filter(Boolean).join("\n\n").trim();
  }

  extractCodeBlocks(text) {
    const source = text || "";
    const blocks = [];
    const regex = /```([\w+-]*)\s*\n([\s\S]*?)```/g;
    for (const match of source.matchAll(regex)) {
      const lang = (match[1] || "").trim();
      const code = (match[2] || "").trim();
      if (!code) continue;
      blocks.push({ lang: lang || "plain", code });
    }
    return blocks;
  }

  sanitizeHtmlForPreview(htmlInput) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlInput || "", "text/html");
    const template = document.createElement("template");
    const headAssets = [];
    const scripts = [];
    const blockedTags = new Set([
      "iframe", "frame", "frameset", "object", "embed", "portal", "base",
      "meta", "title"
    ]);
    const urlAttrs = new Set(["src", "href", "xlink:href", "action", "formaction"]);

    doc.head.querySelectorAll("style, link[rel='stylesheet']").forEach(el => {
      if (el.tagName.toLowerCase() === "link") {
        const href = (el.getAttribute("href") || "").trim();
        if (!href || !this.isSafeUrl(href, { forScript: false })) return;
      }
      headAssets.push(el.outerHTML);
    });

    const bodyHtml = doc.body ? doc.body.innerHTML : (htmlInput || "");
    template.innerHTML = [headAssets.join("\n"), bodyHtml].filter(Boolean).join("\n");

    const elements = [...template.content.querySelectorAll("*")];
    for (const el of elements) {
      const tag = el.tagName.toLowerCase();

      if (tag === "script") {
        const src = (el.getAttribute("src") || "").trim();
        const type = this.normalizeScriptType(el.getAttribute("type") || "");
        if (src) {
          if (this.isSafeUrl(src, { forScript: true })) {
            scripts.push({ src, type: type || "" });
          }
        } else {
          const code = (el.textContent || "").trim();
          if (code) scripts.push({ code, type: type || "" });
        }
        el.remove();
        continue;
      }

      if (blockedTags.has(tag)) {
        el.remove();
        continue;
      }

      for (const attr of [...el.attributes]) {
        const name = attr.name.toLowerCase();
        const value = (attr.value || "").trim();
        if (name.startsWith("on")) {
          el.removeAttribute(attr.name);
          continue;
        }
        if (name === "srcdoc") {
          el.removeAttribute(attr.name);
          continue;
        }
        if (urlAttrs.has(name) && !this.isSafeUrl(value, { forScript: name === "src" && tag === "script" })) {
          el.removeAttribute(attr.name);
        }
      }
    }

    return {
      html: template.innerHTML.trim() || "<div></div>",
      scripts
    };
  }

  isSafeUrl(value, { forScript = false } = {}) {
    const raw = (value || "").trim();
    if (!raw) return false;
    const compact = raw.replace(/[\u0000-\u001F\u007F\s]+/g, "");
    const lower = compact.toLowerCase();
    if (
      lower.startsWith("javascript:") ||
      lower.startsWith("vbscript:") ||
      lower.startsWith("file:") ||
      lower.startsWith("data:text/html")
    ) {
      return false;
    }
    if (forScript && lower.startsWith("data:")) return false;
    return true;
  }

  normalizeScriptType(value) {
    const type = (value || "").trim().toLowerCase();
    if (!type) return "";
    return /^[a-z0-9.+/-]+$/.test(type) ? type : "";
  }

  queryFromInput() {
    if (this.isLoading) return;
    const prompt = this.input.value.trim();
    if (!prompt) return;

    const editor = document.getElementById("editor");
    const editorCode = editor ? editor.value.slice(0, 4000) : "";
    const context = editorCode ? `Current editor code:\n${editorCode}` : "";
    const requestText = [prompt, "Be brief.", context].filter(Boolean).join("\n\n");

    this.queryGemini(requestText);
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.input.disabled = loading;
    this.sendButton.disabled = loading;
    this.sendButton.textContent = loading ? "..." : "Ask";
  }

  updateButtonVisibility() {
    const hasContent = this.outputContent.textContent.trim();
    const isLoadingState = this.output.classList.contains("status-message");
    const isError = this.output.classList.contains("error-message");
    const canCopy = hasContent && !isLoadingState && !isError;
    const shouldShowOutput = hasContent && (isError || this.responseExpanded);

    this.output.classList.toggle('hidden', !shouldShowOutput);
    this.copyButton.classList.toggle('visible', shouldShowOutput && canCopy);
    this.toggleResponseBtn.classList.toggle('active', this.responseExpanded);
    this.toggleResponseBtn.disabled = !hasContent || isLoadingState;
    this.toggleResponseBtn.textContent = this.responseExpanded ? "Hide" : "Show";
  }

  async queryGemini(text) {
    this.responseExpanded = false;
    this.setLoading(true);
    this.output.classList.remove("error-message");
    this.output.classList.add("status-message");
    this.outputContent.textContent = "Thinking...";
    this.updateButtonVisibility();
    const instructions = [
      "You are QEditor's front-end code generator.",
      "Transform the user's request into working HTML, CSS, and JavaScript.",
      "Generate practical, complete code that runs immediately in a browser preview.",
      "",
      "Requirements:",
      "- Use vanilla HTML/CSS/JS unless the user explicitly asks for a library.",
      "- Keep code clean and production-minded: semantic HTML, readable CSS, and clear JS structure.",
      "- Build responsive layouts and include sensible defaults for spacing, typography, and states.",
      "- Prefer accessible patterns (labels, button semantics, keyboard-friendly interactions).",
      "- Do not include placeholders like TODO or pseudocode.",
      "",
      "Output format (strict):",
      "- Return exactly two fenced code blocks.",
      "- First block language: html.",
      "- Put all HTML and CSS in that html block (CSS must be inside a <style> tag).",
      "- Return an embeddable fragment only (no <!doctype>, <html>, <head>, or <body> wrappers).",
      "- Second block language: javascript.",
      "- Put only JavaScript statements in the javascript block (no <script> tags).",
      "- Do not return a separate css code block.",
      "- Do not include explanations before or after the two code blocks.",
      "",
      "Behavior:",
      "- If the prompt is under-specified, infer reasonable defaults and still return complete runnable code.",
      "- If animation or game behavior is requested, include the full loop/input logic.",
      "- If forms or user input are requested, include validation and user feedback."
    ].join("\\n");
    
    const API_URL = "https://digplan.app/llm/chat";
    const requestBody = {
      model: "openrouter/aurora-alpha",
      temperature: 0.2,
      messages: [
        { role: "system", content: instructions },
        { role: "user", content: text }
      ]
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let details = "";
        try {
          const errJson = await response.json();
          details = errJson?.error?.message || JSON.stringify(errJson);
        } catch {
          details = await response.text();
        }
        const trimmed = details ? details.slice(0, 220) : "";
        this.outputContent.textContent = `Error: ${response.status} ${response.statusText}${trimmed ? `. ${trimmed}` : ""}`;
        this.output.classList.remove("status-message");
        this.output.classList.add("error-message");
        this.updateButtonVisibility();
        console.error("API Error:", response.status, response.statusText, details);
        return;
      }

      const data = await response.json();
      let responseText = data?.choices?.[0]?.message?.content || data?.response || data?.gemini_response;
      if (responseText) {
        responseText = responseText.replace(/<think>[\s\S]*?<\/think>/gi, '');
        responseText = responseText.trim();
        
        this.output.classList.remove("status-message");
        this.output.classList.remove("error-message");
        this.outputContent.textContent = responseText;
        this.updateButtonVisibility();
        this.copyButton.click();
      } else {
        this.output.classList.remove("status-message");
        this.output.classList.remove("error-message");
        this.outputContent.textContent = "No response or unexpected format from API.";
        console.warn("Unexpected API response format:", data);
        this.updateButtonVisibility();
      }
    } catch (error) {
      this.output.classList.remove("status-message");
      const reason = error && error.message ? ` (${error.message})` : "";
      this.outputContent.textContent = `Failed to fetch response${reason}.`;
      this.output.classList.add("error-message");
      this.updateButtonVisibility();
      console.error("Query Model Error:", error);
    } finally {
      this.input.value = "";
      this.setLoading(false);
    }
  }
}

customElements.define("smart-box", SmartBox);
