class XRouterLink extends HTMLElement {
    connectedCallback() {
      this.style.cursor = 'pointer';
      this.style.color = 'white';
      this.addEventListener('click', this.#onClick);
      window.addEventListener('popstate', this.#onPopState);
      this.#checkMatch();
    }
  
    disconnectedCallback() {
      this.removeEventListener('click', this.#onClick);
      window.removeEventListener('popstate', this.#onPopState);
    }
  
    #onClick = () => {
      const target = this.getAttribute('x-target');
      if (target) {
        history.pushState({}, '', target);
        this.#checkMatch();
      }
    }
  
    #onPopState = () => {
      this.#checkMatch();
    }
  
    #checkMatch() {
      const current = location.pathname;
      const target = this.getAttribute('x-target');
      const command = this.getAttribute('x-command');
  
      if (target === current && command) {
        try {
          // Use Function to avoid `eval`
          new Function(command)();
        } catch (e) {
          console.error('Command error:', e);
        }
      }
    }
  }
  
  customElements.define('x-router-link', XRouterLink);
  