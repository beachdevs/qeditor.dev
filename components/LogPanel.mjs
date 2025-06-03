class LogPanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div id="log-panel">
        <div id="log-header">
          <button class="close-btn" onclick="this.closest('log-panel').togglePanel()">X</button>
        </div>
        <div id="log-content"></div>
      </div>
      <button id="log-toggle" onclick="this.closest('log-panel').togglePanel()">
        <i class="fas fa-list-alt"></i>
      </button>
    `;
  }

  onNodeResult(result) {
    this.log(result);
  }
  onTriggerRunning(trigger) {
    this.log(trigger);
  }

  togglePanel() {
    const logPanel = $id('log-panel');
    logPanel.classList.toggle('open');
  }

  log(message, type = 'info') {
    if(typeof message !== 'string') {
      message = JSON.stringify(message);
    }
    const logContent = $id('log-content');

    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    
    // Escape HTML in the message
    const escapedMessage = this.escapeHtml(message);
    
    if (type === 'error') {
      entry.style.color = 'red';
    }
    entry.innerHTML = `
      <span class="log-timestamp">[${timestamp}]</span>
      <span class="log-message">${escapedMessage}</span>
    `;
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
  }
  
  escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
      return String(unsafe);
    }
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
export default LogPanel; 
customElements.define('log-panel', LogPanel);

window.LogPanel = document.body.appendChild(new LogPanel());