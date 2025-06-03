class MiniHTMLEditor extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="editor-container">
        <div class="editor" contenteditable="true">Edit this text...</div>
        <div class="toolbar">
          <button data-cmd="bold"><b>B</b></button>
          <button data-cmd="italic"><i>I</i></button>
          <button data-cmd="underline"><u>U</u></button>
          <button class="color-btn"><span class="color-button"></span></button>
          <input type="color" class="color-picker" />
          <select class="font-family" title="Font Family">
            <option value="">Font</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="Tahoma, sans-serif">Tahoma</option>
            <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
            <option value="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif">System UI</option>
          </select>
          <select class="font-size" title="Font Size">
            <option value="">Size</option>
            <option value="1">10px</option>
            <option value="2">13px</option>
            <option value="3">16px</option>
            <option value="4">18px</option>
            <option value="5">24px</option>
            <option value="6">32px</option>
            <option value="7">48px</option>
          </select>
        </div>
      </div>
    `;

    this._editor = this.querySelector('.editor');
    const toolbar = this.querySelector('.toolbar');
    const colorBtn = this.querySelector('.color-btn');
    const colorBox = this.querySelector('.color-button');
    const colorPicker = this.querySelector('.color-picker');
    const fontSizeSelect = this.querySelector('.font-size');
    const fontFamilySelect = this.querySelector('.font-family');

    const exec = (cmd, val = null) => {
      document.execCommand(cmd, false, val);
      hideToolbar();
    };

    const showToolbar = (x, y) => {
      const box = this.closest('.box-editor-box');
      if (box) {
        const boxRect = box.getBoundingClientRect();
        toolbar.style.left = `${x - boxRect.left}px`;
        toolbar.style.top = `${y - boxRect.top - 50}px`;
      } else {
        toolbar.style.left = `${x}px`;
        toolbar.style.top = `${y - 50}px`;
      }
      toolbar.style.display = 'block';
    };

    const hideToolbar = () => {
      toolbar.style.display = 'none';
    };

    this.addEventListener('keydown', (e) => {
      if(e.key === 'Backspace') {
        e.stopPropagation();
      }
    });

    document.addEventListener('selectionchange', () => {
      const sel = window.getSelection();
      if (
        !sel.rangeCount ||
        sel.isCollapsed ||
        !this._editor.contains(sel.anchorNode)
      ) {
        hideToolbar();
        return;
      }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (!rect || (rect.width === 0 && rect.height === 0)) {
        hideToolbar();
        return;
      }
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      showToolbar(rect.left + scrollX, rect.top + scrollY);
    });

    toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-cmd]');
      if (btn) {
        exec(btn.getAttribute('data-cmd'));
      }
    });

    colorBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setTimeout(() => colorPicker.click(), 0);
    });

    colorPicker.addEventListener('change', () => {
      const color = colorPicker.value;
      colorBox.style.background = color;
      document.execCommand('insertHTML', false, `<span style="color: ${color}">${window.getSelection().toString()}</span>`);
    });

    fontSizeSelect.addEventListener('change', () => {
      const val = fontSizeSelect.value;
      if (val) exec('fontSize', val);
    });

    fontFamilySelect.addEventListener('change', () => {
      const val = fontFamilySelect.value;
      if (val) exec('fontName', val);
    });
  }

  get value() {
    return this.querySelector('.editor')?.innerHTML;
  }

  set value(html) {
    const e = this.querySelector('.editor');
    if(e && html) e.innerHTML = html;
  }
}

customElements.define('mini-html-editor', MiniHTMLEditor);
export default MiniHTMLEditor;