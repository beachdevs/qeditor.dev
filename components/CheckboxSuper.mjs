class CheckboxSuper extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <input type="checkbox">
        `;
        this.checkbox = this.querySelector('input[type="checkbox"]');
    }

    get value() {
        return this.checkbox.checked;
    }

    set value(val) {
        this.checkbox.checked = val;
    }
}

customElements.define('checkbox-super', CheckboxSuper);
export default CheckboxSuper;
