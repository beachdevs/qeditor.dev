import EditorNode from './EditorNode.mjs';
import ConnectionManager from '../base-classes/ConnectionManager.mjs';
import BaseElement from 'https://tinyurl.com/dpBaseElement';

class EditorParent extends BaseElement {
    constructor() {
        super();
        this.connectionManager = new ConnectionManager();
        this.innerHTML = `
            <div class="grid"></div>
        `;
        this.gridElement = this.querySelector('.grid');
        this.clear();
        window.editor = this;
    }

    get nodes() {
        return Array.from(this.gridElement.querySelectorAll('editor-node'));
    }
    get selectedNode() {
        let sel = null;
        this.nodes.forEach(node => {
            if(node.selected) {
                sel = node;
            }
        });
        return sel;
    }
    get value() {
        return document.querySelector('#ubox').value;
    }
    set value(value) {
        document.querySelector('#ubox').value = value;
    }
    get scale() {
        return editor.style.transform.replace('scale(', '').replace(')', '');
    }
    // Events
    onContextMenuClick(detail) {
        if(detail.label === 'New Node') this.addNode();
        if(detail.label === 'New Box') document.querySelector('box-editor').addBox();
        if(detail.label === 'Export Workflow') Base.dispatch('onExportWorkflow');
    }

    _loadNode(nodeDef) {
        const node = new EditorNode(nodeDef);
        this.gridElement.appendChild(node);
      
        node.setPosition(nodeDef.x, nodeDef.y);
        node.data = { ...node.data, x: nodeDef.x, y: nodeDef.y, name: nodeDef.name };
      
        nodeDef.inputs.forEach(inputId => {
          const prevNode = editor.getNode(inputId);
          this.connectionManager.connect(prevNode, node, true);
        });
      }
      
      _loadBoxes(boxDefs) {
        const boxMgr = document.querySelector('box-editor');
        boxDefs.forEach(({ x, y, w, h, c, html }) => {
          boxMgr.addBox(
            null,
            x.replace('px', ''),
            y.replace('px', ''),
            w.replace('px', ''),
            h.replace('px', ''),
            c,
            html
          );
        });
      }
      
      _applyZoom(zoomValue) {
        editor.style.transform = zoomValue;
        $('box-editor')
          .querySelectorAll('.box-editor-box')
          .forEach(el => (el.style.transform = zoomValue));
      
        const numScale = parseFloat(zoomValue.replace('scale(', '').replace(')', ''));
        document.addEventListener('DOMContentLoaded', () => {
            $('zoom-zoom').setScale(numScale);
        });
      }

    // Functions
    load(/*string*/def) /*object*/{
        if(typeof def === 'string') def = JSON.parse(def);
        if(def.def) def = def.def;
        editor.clear();
        // Load each node
        Object.keys(def).forEach(key => {
            const value = def[key];
            if (key.startsWith('node')) this._loadNode(value);
            if (key === 'boxes') this._loadBoxes(value);
            if (key === 'zoom' && value) this._applyZoom(value);
        });
        this.connectionManager.redrawConnections();
        return def;
    }
    clear() {
        this.connectionManager.removeAllConnections();
        const nodes = this.nodes;
        nodes.forEach(node => {
            node.remove();
        });
        const editr = $('box-editor');
        if(editr) editr.innerHTML = '';
        EditorNode.counter = 0;
    }
    addNode() {
        const node = new EditorNode();
        this.gridElement.appendChild(node);

        // Position the node
        const prev = this.nodes.at(-2);
        const x = prev ? prev.x + 150 : 200;
        const y = prev ? prev.y : 200;

        if(node.isOffscreen(x, y)) {
            x = 200;
            y = 200;
        }

        node.setPosition(x, y);
        node.data.x = x;
        node.data.y = y;

        // Connect the node to the previous node
        if (prev) {
            const from = this.getSelectedNode() || prev;
            this.connectionManager.connect(from, node);
        }

        Base.dispatch('onNodeAdded', node);
        return node;
    }
    clearAllSelected() {
        this.nodes.forEach(node => {
            node.setSelected(false);
        });
    }
    getNode(/*string*/id) {
        return this.gridElement.querySelector(`editor-node[id="${id}"]`);
    }
    getSelectedNode() {
        return this.nodes.find(node => node.selected);
    }
    deleteSelectedNode() {
        this.nodes.forEach(node => {
            if(node.selected) {
                console.log('deleteSelectedNode', node);
                node.remove();
            }
        });
        this.connectionManager.cleanupConnections();
        Base.dispatch('onNodeRemoved');
    }
    export() { /*string*/
        const json = {Name: this.value, Globals: this.Globals};
        for(const node of this.nodes) {
            json[node.id] = node.data;
        }
        const boxes = [];
        document.querySelectorAll('.box-editor-box').forEach(box => {
            boxes.push({
                x: box.style.left,
                y: box.style.top,
                w: box.style.width,
                h: box.style.height,
                c: box.style.backgroundColor,
                html: box.querySelector('mini-html-editor')?.value
            });
        });
        json.boxes = boxes;
        json.zoom = editor.style.transform;
        try {
            return json;
        } catch (error) {
            console.error('Error serializing workflow:', error);
            return null;
        }
    }
}
customElements.define('editor-parent', EditorParent);
export default EditorParent;

document.body.appendChild(new EditorParent());
window.editor = $('editor-parent');

// Background
const bg = document.createElement('div');
bg.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.10) 1px, transparent 0);
  background-size: 14px 14px;
  background-repeat: repeat;
  background-position: center;
  pointer-events: none;
  z-index: 1;
`;
document.body.appendChild(bg);
