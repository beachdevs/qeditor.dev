class SetGlobals extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
        <label class="set-globals-label">Name:</label>
        <input type="text" placeholder="Global name" class="propvalue set-globals-input" propname="name">
        <u-box class="propvalue" propname="value" no-new-entries="true"></u-box>
        <select class="propvalue set-globals-select" propname="operation">
          <option value="set" selected>Set Value</option>
          <option value="increment">Increment Number</option>
          <option value="remove">Remove Value</option>
        </select>
    `;
  }
}

export default SetGlobals;
customElements.define('set-globals', SetGlobals);
