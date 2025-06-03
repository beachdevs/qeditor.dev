import BaseElement from 'https://tinyurl.com/dpBaseElement';
globalThis.ToolTip ??= class ToolTip extends BaseElement {
  static show(message, duration = 3000, left = 200, top = 150) {
    $$('tool-tip')?.forEach(tip => { tip.remove() });
    const tip = document.createElement('tool-tip');
    document.body.appendChild(tip);
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
    tip.style.display = 'block';
    tip.style.zIndex = '10000';
    tip.textContent = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
    
    // Auto-hide after duration
    setTimeout(() => {
      tip.remove();
    }, duration);
  }
};

customElements.define('tool-tip', globalThis.ToolTip);
