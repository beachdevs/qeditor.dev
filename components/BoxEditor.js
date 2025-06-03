class BoxEditor extends HTMLElement {
  selectedBox = null;

  connectedCallback() {
    // Change color of selected box
    this.addEventListener('dblclick', (e) => {
      $id('color_picker_box_editor')?.remove();
      const color_picker = document.createElement('input');
      color_picker.type = 'color';
      color_picker.id = 'color_picker_box_editor';
      color_picker.value = '#ff0000';
      color_picker.style.opacity = '1';
      this.selectedBox.appendChild(color_picker);
      color_picker.addEventListener('change', (e) => {
        this.selectedBox.style.backgroundColor = e.target.value;
        this.selectedBox.style.zIndex = '1000';
        this.selectedBox.style.backgroundColor = this.#hexToRgba(e.target.value, 0.25);
        this.selectedBox.querySelector('#color_picker_box_editor')?.remove();
      });
      document.addEventListener('click', (e) => {
       $id('color_picker_box_editor')?.remove();
      });
    });
    this.addEventListener('click', (e) => {
       editor.clearAllSelected();
    });
  }

  setPosition(box, x, y, w, h, c) {
    box.style.left = x;
    box.style.top = y;
    box.style.width = w;
    box.style.height = h;
    box.style.backgroundColor = c;
  }

  addBox(e, x = 100, y = 100, w = 200, h = 100, c = 'var(--box-color)', html = 'New box') {
     // Create box at click position
    const box = document.createElement('div');
    box.className = 'box-editor-box';
    box.style.left = `${x}px`;
    box.style.top = `${y}px`;
    box.style.width = `${w}px`;
    box.style.height = `${h}px`;
    box.style.backgroundColor = c;
    box.style.zIndex = '1000';
    box.style.opacity = '0.35';
    box.tabIndex = 0;  // Make box focusable

    // HTML box
    const htmle = document.createElement('mini-html-editor');
    box.appendChild(htmle);
    htmle.addEventListener('mouseup', (e) => {
      $id('color_picker_box_editor')?.remove();
      const color_picker = document.createElement('input');
      color_picker.type = 'color';
      color_picker.id = 'color_picker_box_editor';
      color_picker.value = '#ff0000';
      this.selectedBox?.appendChild(color_picker);
      color_picker.addEventListener('change', (e) => {
        this.selectedBox.style.backgroundColor = e.target.value;
        this.selectedBox.style.zIndex = '1000';
        this.selectedBox.style.backgroundColor = this.#hexToRgba(e.target.value, 0.25);
        this.selectedBox.querySelector('#color_picker_box_editor').remove();
      });
    });

    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    box.appendChild(resizer);
    this.appendChild(box);

    // Add event listeners to the new box
    box.addEventListener('mousedown', (e) => {
      if (e.target === resizer || e.target.closest('mini-html-editor')) return;
      this.#selectBox(box);
      this.#startDrag(e, box);
      e.stopPropagation();
    });

    box.addEventListener('keydown', async (e) => {
      if (e.key === 'Backspace' && await ModalConfirmation.show('Are you sure you want to delete this box?')) {
        this.selectedBox.remove();
        this.selectedBox = null;
        Base.dispatch('onBoxDelete', { box: box });
      }
    });

    resizer.addEventListener('mousedown', (e) => {
      this.#selectBox(box);
      this.#startResize(e, box);
      e.stopPropagation();
    });

    setTimeout(()=> {
      box.querySelector('.editor').innerHTML = html;
      box.querySelector('.editor').addEventListener('paste', (e) => {
        const text = e.clipboardData.getData('text');
        alert(text);
      });
    }, 50);
    
    return box;
  }

  #hexToRgba(hex, alpha = 1) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  #selectBox(box) {
    if (this.selectedBox) this.selectedBox.classList.remove('selected');
    this.selectedBox = box;
    box.classList.add('selected');
    this.focus();
  }

  #handleKeyDown(e) {
    if (e.key === 'Delete' && this.selectedBox) {
      this.selectedBox.remove();
      this.selectedBox = null;
      e.preventDefault();
      e.stopPropagation();
    }
  }

  #startDrag(e, box) {
    const startX = e.pageX;
    const startY = e.pageY;
    const offsetX = startX - box.offsetLeft;
    const offsetY = startY - box.offsetTop;

    const move = evt => {
      box.style.left = `${evt.pageX - offsetX}px`;
      box.style.top = `${evt.pageY - offsetY}px`;
    };

    const stop = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', stop);
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', stop);
  }

  #startResize(e, box) {
    const startX = e.pageX;
    const startY = e.pageY;
    const startW = box.offsetWidth;
    const startH = box.offsetHeight;

    const move = evt => {
      box.style.width = `${startW + (evt.pageX - startX)}px`;
      box.style.height = `${startH + (evt.pageY - startY)}px`;
    };

    const stop = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', stop);
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', stop);
  }
}

export default BoxEditor;
customElements.define('box-editor', BoxEditor);

document.body.appendChild(new BoxEditor());