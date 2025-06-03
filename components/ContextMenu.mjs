class ContextMenu extends HTMLElement {
  menu;
  items;

  connectedCallback() {
      this.innerHTML = `<div class="menu"></div>`;
      this.menu = this.querySelector('.menu');
      
      // Parse items from attribute if present
      const itemsAttr = this.getAttribute('items');
      if (itemsAttr) {
          try {
              this.setItems(JSON.parse(itemsAttr));
          } catch (e) {
              console.error('Invalid items JSON:', e);
          }
      }
      // Listen for contextmenu events on the document
      document.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.show(e.clientX, e.clientY);
      });
  }

  setItems(items) {
      this.items = items;
      this.menu.innerHTML = '';
      items.forEach(item => {
          const div = document.createElement('div');
          div.className = 'menu-item';
          div.innerHTML = `
              <i class="${item.icon}"></i>
              <div class="label">${item.label}</div>
          `;
          div.addEventListener('click', () => {
              if (typeof Base !== 'undefined') {
                  Base.dispatch('onContextMenuClick', {
                      label: item.label
                  });
              }
              this.hide();
          });
          this.menu.appendChild(div);
      });
  }

  show(x, y) {
      //if (this.items.length === 0) return;
      this.style.display = 'block';
      
      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Get menu dimensions
      const menuRect = this.menu.getBoundingClientRect();
      const menuWidth = menuRect.width;
      const menuHeight = menuRect.height;
      
      // Adjust position to stay within viewport
      let finalX = x;
      let finalY = y;
      
      if (x + menuWidth > viewportWidth) {
          finalX = viewportWidth - menuWidth;
      }
      
      if (y + menuHeight > viewportHeight) {
          finalY = viewportHeight - menuHeight;
      }
      
      this.style.left = `${finalX}px`;
      this.style.top = `${finalY}px`;
      
      // Hide when clicking outside
      const hideOnClick = (e) => {
          if (!this.contains(e.target)) {
              this.hide();
              document.removeEventListener('click', hideOnClick);
          }
      };
      document.addEventListener('click', hideOnClick);
  }

  hide() {
      this.style.display = 'none';
  }
}

customElements.define('context-menu', ContextMenu);

// Create menu instance
const menu = document.createElement('context-menu');
document.body.appendChild(menu);

export default ContextMenu;
