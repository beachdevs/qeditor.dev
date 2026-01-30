class SmartBox extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
      :host { display: block; width: 100%; max-width: 350px; font-family: 'Inter', sans-serif;
        border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #fff; }
      .container { display: flex; flex-direction: column; padding: 16px; gap: 12px; }
      .output { position: relative; padding: 12px; padding-bottom: 36px; border: 1px solid #e0e0e0;
        background: #f9fafb; font-size: 0.9rem; white-space: pre-wrap; word-wrap: break-word;
        border-radius: 8px; min-height: 50px; color: #333; line-height: 1.5; max-height: 300px; overflow: hidden; }
      .output-content { max-height: 250px; overflow-y: auto; padding-right: 8px; }
      .output.hidden { display: none !important; }
      input[type="text"] { width: 100%; box-sizing: border-box; padding: 10px 12px; font-size: 1rem;
        border: 1px solid #ccc; border-radius: 8px; transition: border-color 0.2s, box-shadow 0.2s; }
      input[type="text"]:focus { border-color: #007bff; box-shadow: 0 0 0 2px rgba(0,123,255,0.25); outline: none; }
      .status-message { font-style: italic; color: #555; }
      .error-message { color: #d9534f; font-weight: 500; }
      .copy-button { position: absolute; bottom: 8px; right: 8px; padding: 4px 8px; background: #007bff;
        color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; display: none; }
      .copy-button.visible { display: block; }
    `;
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
      const text = this.outputContent.textContent;
      const blocks = [...text.matchAll(/```(html|javascript)\n([\s\S]*?)```/g)];
      let code = "";
      if (blocks.length) {
        for (const [, lang, b] of blocks) {
          code += lang === "javascript" ? `<script>\n${b}\n</script>\n` : b + "\n";
        }
      } else {
        code = text;
      }
      editor.value = code.trim();
      editor.dispatchEvent(new Event("input"));
    });
    this.output.appendChild(copyButton);
    this.copyButton = copyButton;
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.placeholder = "Ask me anything...";
    this.input.setAttribute('aria-label', 'Ask Gemini');
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && this.input.value.trim()) {
        this.queryGemini(this.input.value.trim() + '. be brief. ' + document.body.innerHTML);
      }
      if (e.key === "Escape") {
        this.output.classList.add("hidden");
        this.input.value = "";
      }
    });
    container.appendChild(this.output);
    container.appendChild(this.input);
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(container);
  }

  updateButtonVisibility() {
    const hasContent = this.outputContent.textContent.trim();
    if (hasContent) {
      this.output.classList.remove('hidden');
      this.copyButton.classList.add('visible');
    } else {
      this.output.classList.add('hidden');
      this.copyButton.classList.remove('visible');
    }
  }

  async queryGemini(text) {
    this.output.classList.remove("error-message");
    this.output.classList.add("status-message");
    this.outputContent.textContent = "Thinking...";
    this.updateButtonVisibility();
    const instructions = 'INSTRUCTIONS: When users request web components, use the window.custom system. ' +
      'Define components in window.custom object using kebab-case names. ' +
      'Components can be functions: window.custom["my-component"] = (data) => "<div>HTML</div>", ' +
      'or objects with render method: window.custom["my-component"] = { render: function(data) { return "<div>HTML</div>"; } }, ' +
      'or async functions for data fetching. ' +
      'Components automatically render when DOM loads. ' +
      'Use data="key" attribute to make components reactive to window.state[key] changes. ' +
      'Always return HTML strings. See examples at https://unpkg.com/enigmatic/public/custom.js';
    
    text = instructions + ' ' + text;
    const API_URL = `https://digplan-llm.deno.dev?prompt=${encodeURIComponent(text)}`;
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        const errorText = await response.text();
        this.outputContent.textContent = `Error: ${response.status} ${response.statusText}. ${errorText ? `Details: ${errorText.substring(0,100)}` : ''}`;
        this.output.classList.add("error-message");
        this.updateButtonVisibility();
        console.error("API Error:", response.status, response.statusText, errorText);
        return;
      }
      const data = await response.json();
      let responseText = data?.response || data?.gemini_response;
      if (responseText) {
        responseText = responseText.replace(/<think>[\s\S]*?<\/think>/gi, '');
        responseText = responseText.trim();
        
        this.output.classList.remove("status-message");
        this.outputContent.textContent = responseText;
        this.updateButtonVisibility();
        this.copyButton.click();
      } else {
        this.output.classList.remove("status-message");
        this.outputContent.textContent = "No response or unexpected format from API.";
        console.warn("Unexpected API response format:", data);
        this.updateButtonVisibility();
      }
    } catch (error) {
      this.outputContent.textContent = "Failed to fetch response. Check your connection or the console for details.";
      this.output.classList.add("error-message");
      this.updateButtonVisibility();
      console.error("Query Gemini Error:", error);
    } finally {
      this.input.value = "";
    }
  }
}

customElements.define("smart-box", SmartBox);
