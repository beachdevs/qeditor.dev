// Generic Modal Component
class ModalGeneric extends BaseElement {
  html() {
      return `
          <div class="modal-generic">
              <div class="modal-content">
                  <span class="close-btn">&times;</span>
                  <div class="modal-body"></div>
              </div>
          </div>
      `;
  }

  connectedCallback() {
      this.closeBtn = this.querySelector('.close-btn');
      this.closeBtn.addEventListener('click', () => this.hide());
  }

  setContent(html) {
      this.querySelector('.modal-body').innerHTML = html;
  }

  getContent() {
      return this.querySelector('.modal-body').innerHTML;
  }

  get value() {
      return this.querySelector('.modal-body').innerHTML;
  }

  set value(html) {
      if(html) {
          this.querySelector('.modal-body').innerHTML = html;
      }
  }

  show() {
      return new Promise((resolve) => {
          const editorParent = this.closest('editor-parent');
          if (editorParent) {
              const rect = editorParent.getBoundingClientRect();
              this.style.width = rect.width + 'px';
              this.style.height = rect.height + 'px';
          }
          
          this.classList.add('show');
          
          const handleClose = () => {
              this.removeEventListener('close', handleClose);
              resolve();
          };
          
          this.addEventListener('close', handleClose);
      });
  }

  hide() {
      this.classList.remove('show');
      this.remove();
  }
}

// Confirmation Modal Component
globalThis.ModalConfirmation = class ModalConfirmation extends BaseElement {
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
      this.style.zIndex = 20000;
  }

  static show(message) {
      return new Promise((resolve) => {
          const modal = new ModalConfirmation();
          document.body.appendChild(modal);
          modal.messageEl.innerHTML = message;
          modal.classList.add('show');
          
          const handleResult = (result) => {
              const values = modal.value || null;
              modal.remove();
              resolve(values);
          };
          
          modal.confirmBtn.addEventListener('click', () => {
              modal.hide(true);
              handleResult(true);
          });
          
          modal.cancelBtn.addEventListener('click', () => {
              modal.hide(false);
              resolve(null);
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

  get value() {
      const values = {};
      this.querySelectorAll('.propvalue').forEach(el => {
        values[el.getAttribute('propname')] = el.value || el.textContent;
      });
      return values;
  }
}

class Modal extends HTMLElement {
  constructor() {
    super();
    this.style.zIndex = 20000;
    this.innerHTML = `
        <div class="modal-content">
            <div class="close-btn ok">&times;</div>
            <div class="modal-body"></div>
        </div>`;
  }
  static show(message, data = {}) {
    return new Promise(resolve => {
      const modal = new Modal();
      modal.querySelector('.modal-body').innerHTML = message;
      document.body.appendChild(modal);
      // Set vals if provided
      Object.keys(data).forEach(key => {
        const e = modal.querySelector(`[propname="${key}"]`);
        if(e) e.value = data[key];
      });
      modal.querySelector('.ok').addEventListener('click', () => {
        resolve(getVals(modal));
        modal.remove();
      });
    });
  }
}
customElements.define('modal-gen', Modal);  


// Register components
customElements.define('modal-generic', ModalGeneric);
customElements.define('modal-confirmation', globalThis.ModalConfirmation);

// Global exports
globalThis.ModalGeneric = ModalGeneric;
globalThis.Modal = Modal;

const ModalConfirmationExport = globalThis.ModalConfirmation;
export { ModalGeneric, ModalConfirmationExport as ModalConfirmation };
export default { ModalGeneric, ModalConfirmation: globalThis.ModalConfirmation };