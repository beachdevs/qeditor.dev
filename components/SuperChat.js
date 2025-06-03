import WebAPI from '../base-classes/API.js';

class SuperChat extends HTMLElement {
    constructor(def) {
        super();
        this.webapi = new WebAPI();
        this.apidef = def || this.getAttribute('def');
        this.input = Object.assign(document.createElement('input'), {
            type: 'text',
            placeholder: 'Type a message...',
            style: 'width: 200px;'
        });
        this.append(this.input);
        this.setupEvents();
    }

    setupEvents() {
        this.input.addEventListener('keydown', e => e.key === 'Enter' && this.send());
        this.input.addEventListener('focus', () => this.input.style.width = '300px');
        this.input.addEventListener('blur', () => this.input.style.width = '200px');
    }

    static get observedAttributes() { return ['def', 'key']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'apidef') this.apidef = apidefs[this.getAttribute('apidef')];
        if (name === 'key') this.key = newValue;
    }

    setKey(key) { this.key = key; }

    async send() {
        const msg = { [this.key]: this.input.value };
        const parsed = this.webapi.parse(this.apidef, msg);
        const resp = await this.webapi.fetch(parsed.url, parsed);
        Base.dispatch('chat-response', resp);
    }
}

export default SuperChat;
customElements.define('super-chat', SuperChat);