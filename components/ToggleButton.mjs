class ToggleButton extends HTMLElement {
  static get observedAttributes() {
    return ['state'];
  }

  #state = false;

  get state() {
    return this.#state;
  }

  set state(value) {
    this.#state = value;
    this.updateState();
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        button {
          position: relative;
          width: 40px;
          height: 20px;
          border-radius: 20px;
          background: #ccc;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
          outline: none;
        }

        button::before {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          top: 2px;
          left: 2px;
          transition: all 0.3s ease;
        }

        button.active {
          background: green;
        }

        button.active::before {
          transform: translateX(20px);
        }

        button:focus {
          box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
        }
      </style>
      <button type="button" role="switch" aria-pressed="false">
        <span class="visually-hidden"></span>
      </button>
    `;
  }

  connectedCallback() {
    const button = this.shadowRoot.querySelector('button');
    button.addEventListener('click', () => this.toggle());
    
    // Initialize state from attribute if present
    const initialState = this.getAttribute('state');
    if (initialState !== null) {
      this.state = initialState === 'true';
    }
  }

  toggle() {
    this.state = !this.state;
    this.dispatchEvent(new CustomEvent('toggle', { 
      detail: { state: this.state },
      bubbles: true,
      composed: true
    }));
  }

  updateState() {
    const button = this.shadowRoot.querySelector('button');
    if (button) {
      button.classList.toggle('active', this.state);
      button.setAttribute('aria-pressed', this.state);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'state' && oldValue !== newValue) {
      this.state = newValue === 'true';
    }
  }
}

customElements.define('toggle-button', ToggleButton);
export default ToggleButton;