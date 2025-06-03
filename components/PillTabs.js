import DHTMLElement from '../base-classes/DHTMLElement.js';
class PillTabs extends DHTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.classList.add('pill-tabs-wrapper');
    const tabs = Array.from(this.querySelectorAll('.tab'));
    const container = document.createElement('div');
    container.classList.add('tab-container');

    tabs.forEach((tab, index) => {
      tab.classList.add('tab');
      tab.addEventListener('click', () => {
        Base.dispatch('pill-tab-clicked', tab.textContent);
      });
      container.appendChild(tab);
    });

    this.innerHTML = '';
    this.appendChild(container);
  }
}
export default PillTabs;
customElements.define('pill-tabs', PillTabs);
