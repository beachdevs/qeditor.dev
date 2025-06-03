class TwoColInputs extends HTMLElement {
    connectedCallback() {
      //const shadow = this.attachShadow({ mode: 'open' });
      // Template HTML
      this.innerHTML = `
        <style>
          .container {
            display: flex;
            flex-direction: column;
            gap: 0.1rem;
            max-width: 500px;
            font-family: sans-serif;
          }

          .row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 0.1rem;
          }

          .add-wrapper {
            display: flex;
            justify-content: center;
            margin-top: 0.5rem;
          }

          .add-button {
            font-size: 0.5rem;
            padding: 0.1rem 0.1rem;
            cursor: pointer;
          }
        </style>

        <div class="container">
          <div class="row">
          <input type="text" placeholder="${this.getAttribute('placeholder1')}">
          <input type="text" placeholder="${this.getAttribute('placeholder2')}">
          </div>
          <div class="add-wrapper">
            <button class="add-button">➕</button>
          </div>
        </div>
      `;

      this.container = this.querySelector('.container');
      this.addBtn = this.querySelector('.add-button');

      this.addBtn.addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'row';
        row.innerHTML = `
          <input type="text" placeholder="${this.getAttribute('placeholder1')}">
          <input type="text" placeholder="${this.getAttribute('placeholder2')}">
          <div onclick='this.parentElement.remove()' class="remove-button" style="cursor: pointer; color: red;">❌</div>
          
        `;
        this.container.insertBefore(row, this.addBtn.closest('.add-wrapper'));
      });
    }

    get value() {
      return [...this.querySelectorAll('input')].map(input => input.value).join(',');
    }
  }
export default TwoColInputs;
customElements.define('two-col-inputs', TwoColInputs);
