import DHTMLElement from '../base-classes/DHTMLElement.js';

class UBox extends DHTMLElement {
  static get observedAttributes() {
    return ['size', 'default'];
  }

  html() {
    return `
      <div class="autocomplete">
        <div class="input-wrapper">
          <input type="text" class="input" />
        </div>
      </div>
      <div class="suggestions"></div>
    `;
  }

  constructor() {
    super(true);
    this.input = this.querySelector('.input');
    this.input.placeholder = this.getAttribute('default') || '';
    this.suggestions = this.querySelector('.suggestions');
    this.data = [];
    this.setupEventListeners();
  }

  connectedCallback() {
    this.updateSize();
    if(this.getAttribute('default-value')) {
      this.input.value = this.getAttribute('default-value');
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'size') {
      this.updateSize();
    }
    if(name === 'default-value') {
      this.input.value = this.getAttribute('default-value');
    }
  }

  updateSize() {
    const size = this.getAttribute('size') || '180';
    this.style.setProperty('--ubox-size', `${size}px`);
  }

  setupEventListeners() {
    this.input.addEventListener('input', this.handleInput.bind(this));
    this.input.addEventListener('focus', () => this.showSuggestions());
    this.input.addEventListener('blur', () => setTimeout(() => this.hideSuggestions(), 200));
    this.input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        const value = this.input.value.trim();
        if (value && !this.data.includes(value)) {
          this.createNewEntry(value);
        }
      }
    });
  }

  handleInput(e) {
    const value = e.target.value.toLowerCase();
    const filtered = this.data.filter(item => {
      return item?.toLowerCase().includes(value);
    });
    this.showSuggestions(filtered, value);
  }

  showSuggestions(filteredData = this.data, searchTerm = '') {
    this.suggestions.innerHTML = '';
    const value = this.input.value.trim();
    const noNewEntries = this.getAttribute('no-new-entries') || this.noNewEntries || false;
    const noIcons = this.hasAttribute('no-icons');

    if (!noNewEntries && value && !filteredData.includes(value)) {
      const createNewDiv = document.createElement('div');
      createNewDiv.className = 'suggestion-item create-new-item';
      createNewDiv.innerHTML = !noIcons ? `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        <span>Create new workflow as "${value}"</span>
      ` : `<span>Create new workflow as "${value}"</span>`;
      createNewDiv.addEventListener('click', () => this.createNewEntry(value));
      this.suggestions.appendChild(createNewDiv);
    }

    if (filteredData.length === 0 && !value) {
      this.suggestions.innerHTML = '<div class="no-results">None</div>';
    } else {
      filteredData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = !noIcons ? `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 12h16M12 4v16M8 8l8 8M16 8l-8 8"/>
          </svg>` : '';

        const textSpan = document.createElement('span');
        if (searchTerm) {
          const regex = new RegExp(`(${searchTerm})`, 'gi');
          textSpan.innerHTML = item.replace(regex, '<span class="highlight">$1</span>');
        } else {
          textSpan.textContent = item;
        }

        div.appendChild(textSpan);
        div.addEventListener('click', () => this.selected(item));
        this.suggestions.appendChild(div);
      });
    }

    this.suggestions.classList.add('visible');
  }

  hideSuggestions() {
    this.suggestions.classList.remove('visible');
  }

  get value() {
    return this.input.value;
  }

  setValue(value) {
    this.input.value = value;
  }
  
  set value(value) {
    this.input.value = value;
  }

  getSelected() {
    return this.input.value;
  }

  selected(item) {
    this.input.value = item;
    this.hideSuggestions();
    Base.dispatch('onUboxItemSelected', { id: this.id, etype: this.constructor.name, value: item, items: this.data });
  }

  setItems(items) {
    if (!Array.isArray(items)) {
      console.error('setItems expects an array');
      return;
    }
    if(this.getAttribute('filter')) {
      this.data = items.filter(item => item.match(this.getAttribute('filter')));
    } else {
      this.data = items;
    }
    this.input.value = '';
    this.hideSuggestions();
  }

  extractKeys(obj, prefix = '') {
    const keys = [];
  
    for (const key in obj) {
      const value = obj[key];
      const path = prefix ? `${prefix}.${key}` : key;

      if (Array.isArray(value)) {
        keys.push(`$${path}[]`);
      } else if (value && typeof value === 'object') {
        keys.push(`$${path} (object)`);
        keys.push(...this.extractKeys(value, path)); // recurse into nested object
      } else {
        keys.push(`$${path}`);
      }
    }
    return keys;
  }

  setItemsWithChoices() {
    let keys = [];
    const parentNodeId = `node-${this.closest('properties-box').id.replace('-properties','')}`;
    Engine.executions.at(-1)?.steps.forEach(step => {
      if (step.outputs?.includes(parentNodeId) && step.result) {
        keys = this.extractKeys(step.result);
      }
    });
    if (Engine.executions.at(-1)?.globals) {
      keys = [...keys, ...Object.keys(Engine.executions.at(-1).globals)];
    }
    this.setItems(keys);
  }

  createNewEntry(value) {
    if (value && !this.data.includes(value)) {
      this.finalizeNewEntry(value);
    }
  }

  finalizeNewEntry(value) {
    this.data.push(value);
    this.input.value = value;
    this.hideSuggestions();
    Base.dispatch('onUboxCreateNewEntry', { id: this.id, etype: this.constructor.name, value: value, items: this.data });
  }
}

export default UBox;
customElements.define('u-box', UBox);
