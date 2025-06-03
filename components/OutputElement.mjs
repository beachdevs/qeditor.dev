import DHTMLElement from '../base-classes/DHTMLElement.js';
class OutputElement extends DHTMLElement {
    html() {
        return `
            <style>
                .outputs {
                    position: absolute;
                    right: -4px;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: auto;
                    z-index: 1000;
                }
                .output {
                    width: 4px;
                    height: 4px;
                    background: #3498db;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid white;
                }
                .output:hover {
                    transform: scale(1.5);
                    transition: transform 0.3s ease-in-out;
                }
            </style>
            <div class="outputs" onmouseover="this.getRootNode().host.prepareDrag()">
                <div class="output"></div>
            </div>
        `;
    }
    prepareDrag() {
        const srcNode = this.parentElement;
        if(!srcNode?.disableDrag) return;
        srcNode.disableDrag();
        const onMouseDown = (e) => {
            const onMouseMove = (e) => {
                const srcRect = srcNode.nodeElement.getBoundingClientRect();
                const srcX = srcRect.left + srcRect.width;
                const srcY = srcRect.top + srcRect.height / 2;
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', `M ${srcX} ${srcY} L ${e.clientX} ${e.clientY}`);
                path.setAttribute('stroke', '#3498db');
                path.setAttribute('stroke-width', '2');
                path.setAttribute('fill', 'none');
                path.classList.add('temp-path');
                const existingPath = editor.connectionManager.connectionLineSVG.querySelector('.temp-path');
                if (existingPath) existingPath.remove();
                editor.connectionManager.connectionLineSVG.appendChild(path);
            };

            const onMouseOverNode = (e) => {
                console.log('finding.... ' + e.target.id);
                editor.clearAllSelected();
                e.target.setSelected?.(true);
            };

            const onMouseUpNode = (e) => {
                console.log('SELECTED NODE: ' + e.target.id);
                editor.connectionManager.connect(srcNode, e.target);
                cleanup();
            };

            const onDocumentClick = (e) => {
                // Only cleanup if the click is not on a node
                if (!e.target.closest('.node')) {
                    cleanup();
                }
            };

            const cleanup = () => {
                editor.removeEventListener('mousemove', onMouseMove);
                editor.nodes.forEach(node => {
                    node.removeEventListener('mouseover', onMouseOverNode);
                    node.removeEventListener('mouseup', onMouseUpNode);
                });
                document.removeEventListener('click', onDocumentClick);
                const tempPath = editor.connectionManager.connectionLineSVG.querySelector('.temp-path');
                if (tempPath) tempPath.remove();
            };

            editor.addEventListener('mousemove', onMouseMove);
            editor.nodes.forEach(node => {
                node.addEventListener('mouseover', onMouseOverNode);
                node.addEventListener('mouseup', onMouseUpNode);
            });
            document.addEventListener('click', onDocumentClick);
        };

        this.addEventListener('mousedown', onMouseDown, { once: true });
    }
}
export default OutputElement;
customElements.define('output-element', OutputElement);