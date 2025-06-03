import ModalGeneric from './ModalGeneric.js';
import { NodeTypes } from '../base-classes/NodeTypes.mjs';

class PropertiesBox extends ModalGeneric {
  doEvents(e) {
    this.addEventListener('keydown', (e) => { e.stopPropagation();});
  }
  // SAVE VALUES
  onModalClose({id}) {
    if(id != this.id) return;
    let values = {};
    // Validate values TODO: add validation
    if(this.querySelector('.propvalue.bad-value')) return false;
    this.querySelectorAll('.propvalue').forEach(element => {
        values[element.getAttribute('propname')] = element.value;
    });
    const nodeId = `node-${parseInt(id)}`;
    const node = editor.nodes.find(n => n.id == nodeId);
    if(!node || !node.data) throw new Error('Node not found or no data object');
    node.data.settings = values;
  }
  getAllKeys(obj, prefix = '$') {
      let keys = [];
      for (const key in obj) {
        const fullKey = prefix === '$' ? `${prefix}${key}` : `${prefix}.${key}`;
        keys.push(fullKey);
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          keys = keys.concat(this.getAllKeys(obj[key], fullKey));
        }
      }
      return keys;
  }
  show(node) {
    const content = NodeTypes[node.data.type.name].propertiesHTML;
    const load = NodeTypes[node.data.type.name].load;
    const uiReady = NodeTypes[node.data.type.name].uiReady;

    if(content) this.setContent(content);
    if(load) load(node, this);
    if(uiReady) uiReady(this);

    // Populate properties box with node settings
    if(node.data.settings) {
      Object.entries(node.data.settings).forEach(([key, value]) => {
          const eid = this.querySelector(`[propname="${key}"]`) || this.querySelector(`#${key}`);
          if(eid) eid.value = value;
      });
    }
    // Populate API box / UBox with node inputs
    const inputs = node.getInputKeys();
    this.querySelectorAll('u-box').forEach(ub => {
      let temp = '';
      if(ub.value) temp = ub.value;
      ub.setItems(inputs);
      if(temp) ub.value = temp;
    });
  }
}

export default PropertiesBox;
customElements.define('properties-box', PropertiesBox);
