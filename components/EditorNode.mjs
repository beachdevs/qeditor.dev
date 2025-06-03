import { NodeTypes } from '../base-classes/NodeTypes.mjs';
import DraggableElement from './DraggableElement.mjs';
import PropertiesBox from './PropertiesBox.mjs';

class EditorNode extends DraggableElement {
    static counter = 0;
    active = true;
    isRunning = false;
    outgoingConnections = [];
    incomingConnections = [];
    defaultDescription = 'Node';
    type = 'Trigger';
    constructor(props = {
        name: 'Node',
        type: { name: 'Trigger' },
        inputs: [],
        outputs: [],
        settings: { "trigger_time": { type: 'now' } }
    }) {
        super();
        this.selectedConnectionLine = null;
        this.connectionPaths = [];
        this.data = props;
        this.nodeElement = this.querySelector('.editor-node');
        this.closeBtn = this.querySelector('.close-btn');
        // Show node type select box
        document.addEventListener("DOMContentLoaded", () => {
            this.type = this.data.type.name;
        });
    }
    html() {
        return `
            <div class='editor-node'>
                <div class="inputs">
                    <div class="input" data-port="0"></div>
                </div>
                <icon-box types="power,play,cog"></icon-box>
                <p contenteditable="true" class="node-name" onkeydown="event.stopPropagation();if(event.key === 'Enter'){ this.closest('editor-node').changeName(this.innerText);this.blur(); }"></p>
                <select class='elegant-select node-type' onchange="Base.dispatch('onNodeChangeType', {nodeId: this.parentElement.parentElement.id, type: this.value})">
                ${this.generateTypeOptions(this.type)}
                </select>
                <output-element></output-element>
            </div>
        `;
    }
    connectedCallback() {
        const { name, type, inputs, outputs } = this.data;
        const id = EditorNode.counter++;
        this.data.nodeId = this.id = `node-${id}`;
        this.querySelector('icon-box').nodeId = this.id;
        this.style.left = this.x + 'px';
        this.style.top = this.y + 'px';
        //this.querySelector('.node-type').value = type;
        this.type = type;

        if (!NodeTypes[this.data.type.name]) throw new Error(`Node type ${this.data.type.name} not found`);
        this.data.type = JSON.parse(JSON.stringify(NodeTypes[this.data.type.name]));

        // Set field values
        //this.querySelector('.elegant-select').value = type.name;
        this.querySelector('.node-type').value = '';
        this.querySelector('[contenteditable="true"]').innerText = name;
    }
    doEvents() {
        // Add click handler (select the node)
        this.addEventListener('click', () => {
            editor.clearAllSelected();
            editor.connectionManager.clearAllSelectedConnections();
            this.setSelected(true);
        });
        this.querySelector('.editor-node').addEventListener('mouseenter', () => {
            if(SettingsManager.get('HoverProps')) ToolTip.show({ nodeId: this.id, ...this.data }, 6000, 700, 100);
        });
        this.querySelector('.editor-node').addEventListener('mouseleave', () => {
           if(SettingsManager.get('HoverProps')) ToolTip.show('', 0)
        });
    }

    isOffscreen(x, y) {
        const { innerWidth, innerHeight } = window;
        return x < 0 || y < 0 || x > innerWidth || y > innerHeight;
    }

    onNodeResult(data) {
        if (data.nodeId != this.id) return;
        //this.nodeElement.classList.toggle('running', false);
        this.nodeElement.classList.toggle('animated-border', false);
        this.querySelector('icon-box').stop();
        this.isRunning = false;
    }
    onNodeRunStart(data) {
        if (data.nodeId != this.id) return;
        this.nodeElement.classList.toggle('running', true);
        //this.nodeElement.classList.toggle('animated-border', true);
        this.querySelector('icon-box').running();
        this.isRunning = true;
        editor.clearAllSelected();
    }
    onNodeResult(data) {
        if (data.nodeId != this.id) return;
        this.nodeElement.classList.toggle('running', false);
        //this.nodeElement.classList.toggle('animated-border', false);
        this.querySelector('icon-box').stop();
        this.isRunning = false;
    }
    setSelected(selected /*true/false*/) {
        if (selected && !this.active) return;
        this.selected = selected;
        this.nodeElement.classList.toggle('selected', selected);
    }
    onNodeChangeType(data) {
        this.data.type = NodeTypes[data.type];
        if (data.nodeId != this.id) return;
        this.onIconBoxProperties({nodeId: this.id});
        // Keep select box clear
        this.querySelector('.node-type').value = '';
    }
    onIconBoxPlay(data) {
        if (data.nodeId != this.id) return;
        if (!this.isRunning) Engine.run(this.id, editor.export());
    }
    onIconBoxPower({nodeId}) {
        if (nodeId != this.id) return;
        this.active = !this.active;
        this.querySelector('.editor-node').classList.toggle('node-off', !this.active);
    }
    onIconBoxProperties({nodeId}) {
        if(nodeId != this.id) return;
        // Create new properties box
        const pb = new PropertiesBox();
        pb.id = `${nodeId.replace('node-', '')}-properties`;
        document.body.appendChild(pb);
        pb.show(this);
    }
    onDraggedElement(detail) {
        if (detail.id != this.id) return;
        this.data.x = detail.x;
        this.data.y = detail.y;
        const cm = editor.connectionManager;
        for (const conn of this.outgoingConnections) {
            cm.updateConnections(conn.sourceNode, conn.targetNode);
        }
        for (const conn of this.incomingConnections) {
            cm.updateConnections(conn.sourceNode, conn.targetNode);
        }
    }
    changeName(name) {
        this.data.name = name;
        Base.dispatch('onNodeNameChanged');
    }
    #getPrevNodeResult(node) {
        const prevNode = Engine.executions.at(-1)?.steps.filter(step => step.nodeId == node.id);
        if(!prevNode) return null;
        if(prevNode.length > 0) return prevNode[0];
    }
    getInputKeys() { // Get results from input nodes and Globals to infer vars passed to this node
        const keys = Object.keys(Engine.getGlobals());
        for (const nodeIds of this.data.inputs) {
            const prevNode = $id(nodeIds);
            if (prevNode) {
                const presult = this.#getPrevNodeResult(prevNode)?.result;
                if(!presult) continue;
                for (const key in presult) {
                    if (presult[key] instanceof Array) {
                        keys.push(`$${key}[]`);
                    }
                    else if (presult[key] instanceof Object) {
                        keys.push(`$${key} (object)`);
                        for (const subkey in presult[key]) {
                            keys.push(`$${key}.${subkey}`);
                        }
                    } else {
                        keys.push(`$${key}`);
                    }
                }
            }
        }
        return keys;
    }
    generateTypeOptions(type = 'Trigger') {
        let options = '';
        for (const key in NodeTypes) {
            options += `<option value="${key}" ${type === key ? 'selected' : ''}>${NodeTypes[key].name}</option>`;
            if (key === 'Logic') options += `<option disabled>-------------</option>`;
        }
        return options;
    }
}
customElements.define('editor-node', EditorNode);
export default EditorNode;