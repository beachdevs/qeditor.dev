// Base class for DOM elements with shadow DOM
class DHTMLElement extends HTMLElement {
    constructor(noShadow = false) {
      super();
      let shadow = this;
      if(!noShadow) shadow = this.attachShadow({ mode: 'open' });
      shadow.innerHTML = this.html();
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
      const that = this;
      setTimeout(() => {
        methods.forEach(method => {
          //if (method.startsWith('on')) listen(method, this[method].bind(that));
        });
      }, 1000);
    }
    hide() {
      this.style.display = 'none';
    }
    show() {
      this.style.display = 'block';
    }
}
export default DHTMLElement;