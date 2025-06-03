import Ubox from "./UBox.mjs";

class UBoxWorkflows extends Ubox {
  constructor() {
    super();
  }
  connectedCallback() {
    super.connectedCallback();

    // Load the workflow list
    const arr = [];
    const workflows = storage.get('Workflows', '*');
    for(const workflow of workflows) {
      arr.push(workflow.name);
    }
    this.setItems(arr);
  }
  onLoadWorkflowList(/*Array<string>*/data) {
    this.setItems(data.detail);
  }
  setValue(value) {
    this.input.value = value;
  }
  get value() {
    return this.input.value;
  }
  set value(value) {
    this.input.value = value;
  }
}
customElements.define('u-box-workflows', UBoxWorkflows);