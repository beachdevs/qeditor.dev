import BaseElement from 'https://tinyurl.com/dpBaseElement';
globalThis.ModalConfirmation ??= class ModalConfirmation extends BaseElement {
  html() {
    return `
      <div class="modal-content">
        <h3 class="modal-title"></h3>
        <div class="modal-message"></div>
        <div class="modal-actions">
          <button class="modal-btn cancel">Cancel</button>
          <button class="modal-btn confirm">Confirm</button>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    this.messageEl = this.querySelector('.modal-message');
    this.confirmBtn = this.querySelector('.modal-btn.confirm');
    this.cancelBtn = this.querySelector('.modal-btn.cancel');

    this.confirmBtn.addEventListener('click', () => this.hide(true));
    this.cancelBtn.addEventListener('click', () => this.hide(false));
  }

  static show(message) {
    return new Promise((resolve) => {
      const modal = new ModalConfirmation();
      document.body.appendChild(modal);
      modal.messageEl.textContent = message;
      modal.classList.add('show');
      
      const handleResult = (result) => {
        modal.remove();
        resolve(result);
      };
      
      modal.confirmBtn.addEventListener('click', () => {
        modal.hide(true);
        handleResult(true);
      });
      
      modal.cancelBtn.addEventListener('click', () => {
        modal.hide(false);
        handleResult(false);
      });
    });
  }

  hide(result) {
    this.classList.remove('show');
    this.parentElement?.modalResult?.(result);
    if (result) {
      this.dispatchEvent(new CustomEvent('confirm'));
    }
  }
}

customElements.define('modal-confirmation', ModalConfirmation);
export default ModalConfirmation;