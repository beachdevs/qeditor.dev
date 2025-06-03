class ExportModal extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="backdrop">
        <div class="modal">
          <div class="header">
            <div class="header-left">
              <h3 class="wfname">Export Workflow</h3>
            </div>
            <div class="action-buttons">
              <button class="action-btn copy-btn" title="Copy to clipboard">
                <i class="fas fa-copy"></i>
              </button>
              <button class="action-btn download-btn" title="Download">
                <i class="fas fa-download"></i>
              </button>
              <button class="action-btn share-btn" title="Share">
                <i class="fas fa-share-alt"></i>
              </button>
              <span class="close-btn" title="Close">&times;</span>
            </div>
          </div>
          <div class="content">
            <pre></pre>
          </div>
        </div>
      </div>
    `;

    // Get references to elements
    this.backdrop = this.querySelector('.backdrop');
    this.content = this.querySelector('pre');
    this.copyBtn = this.querySelector('.copy-btn');
    this.downloadBtn = this.querySelector('.download-btn');
    this.shareBtn = this.querySelector('.share-btn');
    this.closeBtn = this.querySelector('.close-btn');

    // Add event listeners
    this.closeBtn.addEventListener('click', () => this.close());
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });
    this.copyBtn.addEventListener('click', () => this.copyToClipboard());
    this.downloadBtn.addEventListener('click', () => this.downloadFile());
    this.shareBtn.addEventListener('click', () => this.shareFile());
  }

  open(title, message, isConfirmation = false) {
    if (this.content) {
      this.querySelector('.wfname').innerText = document.getElementById('ubox').value;
      this.content.textContent = message;
      this.backdrop.classList.add('show');
      
      if (isConfirmation) {
        // Show confirmation buttons
        this.actions.style.display = 'flex';
        this.confirmBtn.style.display = 'block';
        this.cancelBtn.style.display = 'block';
        this.copyBtn.style.display = 'none';
        this.downloadBtn.style.display = 'none';
        this.shareBtn.style.display = 'none';
      }
    } else {
      console.error('Content element not found in modal');
    }
  }
  close() {
    this.backdrop.classList.remove('show');
  }
  
  async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this.content.textContent);
      const originalIcon = this.copyBtn.innerHTML;
      this.copyBtn.innerHTML = '<i class="fas fa-check" style="color: #10B981;"></i>';
      setTimeout(() => {
        this.copyBtn.innerHTML = originalIcon;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  downloadFile() {
    const content = this.content.textContent;
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async shareFile() {
    const content = this.content.textContent;
    const blob = new Blob([content], { type: 'application/json' });
    const file = new File([blob], 'workflow.json', { type: 'application/json' });
    
    try {
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Workflow Export',
          text: 'Check out my workflow!'
        });
      } else {
        this.downloadFile();
      }
    } catch (err) {
      console.error('Error sharing file:', err);
      this.downloadFile();
    }
  }
}
export default ExportModal;
customElements.define('export-modal', ExportModal);
document.body.appendChild(new ExportModal());