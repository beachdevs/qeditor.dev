import UBox from "./UBox.mjs";
import APIDEF from "../base-classes/APIDEF.js";

class APIBox extends UBox {
  connectedCallback() {
    this.setAttribute('no-new-entries', true);
    this.classList.add('propvalue');
    this.setAttribute('propname', 'api');
    this.setItems(Object.keys(APIDEF));
    this.style.backgroundColor = 'var(--light-color)';
    this.selected(this.input.value);
  }
  get value() {
    const obj = { apitype: this.input.value };
    this.querySelectorAll('.propvalue2').forEach(e => obj[e.getAttribute('propname')] = e.value);
    return obj;
  }
  set value(val) {
    this.input.value = val.apitype;
    this.selected(val.apitype);
    delete val.apitype;
    Object.entries(val).forEach(([key, value]) => {
      const e = this.querySelector(`[propname="${key}"]`);
      if(e) e.value = value;
    });
  }
  selected(item) {
    this.querySelector('#contain')?.remove();
    const contain = document.createElement('DIV');
    contain.id = 'contain';
    this.appendChild(contain);
    
    this.input.placeholder = 'Select API Type';
    this.input.value = item;
    
    if(!item) return;
    
    const matchvars = api.getDef(item).params;
    matchvars.forEach(varname => {
      const div = document.createElement('divs');
      div.innerHTML = varname.replace('$','');
      contain.appendChild(div);
      
      const ub = new UBox();
      ub.classList.add('propvalue2');
      ub.setAttribute('propname', varname.replace('$',''));
      ub.setAttribute('no-new-entries', true);
      ub.setAttribute('no-icons', true);
      
      const nodeid = this.closest('properties-box').id.match(/\d/)[0];
      const node = editor.getNode(`node-${nodeid}`);
      if(node) {
        ub.setItems(node.getInputKeys());
        contain.appendChild(ub);
      }
    });
  }
}
export default APIBox;
customElements.define('api-box', APIBox);
