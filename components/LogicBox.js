class LogicBox extends HTMLElement {
    connectedCallback() {
        this.node = document.getElementById(`node-${parseInt(this.closest('properties-box').id)}`);
        this.setAttribute('propname', 'logic');
        this.classList.add('propvalue');
      this.innerHTML = `
        <style>
          .logic-row {
            display: flex;
            gap: 0.5em;
            margin-bottom: 0.5em;
            align-items: center;
          }
          .logic-container {
            display: flex;
            flex-direction: column;
          }
          .run-when-label {
            margin-top: 1em;
            font-weight: bold;
          }
          #addButton {
            background-color: var(--light-color);
            color: var(--dark-color);
            border: none;
            cursor: pointer;
          }
        </style>

          <!-- Run When -->
          <label class="run-when-label" for="runWhenSelect">Run when</label>
          <select id="runWhenSelect" class="propvalue" propname="runWhen" validity=".">
            <option value="first" selected>First Input is Complete</option>
            <option value="every">Every Input is Complete</option>
          </select>

          <!-- Logic Container -->
          <div id="logicContainer" class="node-content" style="display: flex; flex-direction: column; gap: 10px; padding: 10px; min-width: 500px; min-height: 60px;"></div>

          <!-- Add Button -->
          <button id="addButton">Add Condition</button>
      `;
  
      this.querySelector('#addButton').addEventListener('click', () => this.addLogicRow());
      //this.addLogicRow(); // Initial row
    }

    addLogicRow() {
      // Check for output options
      if((this.node?.data?.outputs || []).length === 0) {
        ToolTip.show('Connect an output to this node before adding a condition', 4000)
        return;
      }
      const container = this.querySelector('#logicContainer');
      const row = document.createElement('div');
      row.className = 'logic-row';
  
      const outputOptions = (this.node?.data?.outputs || []).map(
        val => `<option value="${val}">${val}</option>`
      ).join('');

      row.innerHTML = `
      <div class="logic-row-container" style="display: flex; gap: 0.5em; margin-bottom: 0.5em; align-items: center;">
        When
        <u-box class="propvalue" no-new-entries="true" no-icons="true" propname2="logic1" style="background-color: var(--light-color) !important;"></u-box>
        <select class="propvalue" propname2="operator">
          <option value="IS" selected>IS</option>
          <option value="IS NOT">IS NOT</option>
          <option value="CONTAINS">CONTAINS</option>
        </select>
        <u-box class="propvalue" propname2="logic2" no-new-entries="true" no-icons="true" style="background-color: var(--light-color) !important;"></u-box>
        Then
        <select class="propvalue" propname2="targetNode">
          ${outputOptions}
        </select>
        <button class="remove-button" style="margin-left: auto; background: none; border: none; color: red; font-weight: bold; cursor: pointer;">✕</button>
      </div>
    `;
    
      row.querySelector('.remove-button').addEventListener('click', () => row.remove());
      container.appendChild(row);
    }

    get value() {
        const rows = [...this.querySelectorAll('.logic-row')];
        const conditions = rows.map(row => {
          const container = row.querySelector('.logic-row-container');
          const logic1 = container.querySelector('[propname2="logic1"]')?.value || '';
          const operator = container.querySelector('[propname2="operator"]')?.value || '';
          const logic2 = container.querySelector('[propname2="logic2"]')?.value || '';
          const targetNode = container.querySelector('[propname2="targetNode"]')?.value || '';
      
          return { logic1, operator, logic2, targetNode };
        });
      
        const runWhen = this.querySelector('#runWhenSelect')?.value || 'first';
        return { runWhen, conditions };
      }

      set value(data) {
        const { runWhen, conditions } = data || {};
        this.querySelector('#runWhenSelect').value = runWhen || 'first';
      
        const container = this.querySelector('#logicContainer');
        container.innerHTML = ''; // Clear existing rows
      
        (conditions || []).forEach(cond => {
          this.addLogicRow();
          const row = container.lastElementChild;
          const logic1 = row.querySelector('[propname2="logic1"]');
          const operator = row.querySelector('[propname2="operator"]');
          const logic2 = row.querySelector('[propname2="logic2"]');
          const targetNode = row.querySelector('[propname2="targetNode"]');
   
          setTimeout(() => {
            if (logic1) logic1.value = cond.logic1 || '';
            if (operator) operator.value = cond.operator || 'IS';
            if (logic2) logic2.value = cond.logic2 || '';
            if (targetNode) targetNode.value = cond.targetNode || '';
          }, 100);

        });
      }
  }
  export default LogicBox;
  customElements.define('logic-box', LogicBox);