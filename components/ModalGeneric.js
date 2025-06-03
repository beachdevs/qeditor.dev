import BaseElement from 'https://tinyurl.com/dpBaseElement';
class ModalGeneric extends BaseElement {
  html() {
    return `
      <div class="modal-generic">
        <div class="modal-content">
          <span onclick="Base.dispatch('onModalClose', {id: this.closest('properties-box')?.id || this.closest('modal-generic')?.id || ''}); this.closest('properties-box')?.remove(); this.closest('modal-generic')?.remove();" class="close-btn">&times;</span>
          <div class="modal-body"></div>
        </div>
      </div>
    `;
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
    //this.style.display = 'block';
    // Ensure the modal is positioned relative to editor-parent
    const editorParent = this.closest('editor-parent');
    if (editorParent) {
      const rect = editorParent.getBoundingClientRect();
      this.style.width = rect.width + 'px';
      this.style.height = rect.height + 'px';
    }
  }

}

customElements.define('modal-generic', ModalGeneric);
export default ModalGeneric;

window.ModalGeneric = ModalGeneric;