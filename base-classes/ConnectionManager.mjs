class ConnectionManager {
    constructor() {
        this.connections = [];
        this.selectedConnection = null;
        // Global SVG for all connections
        const connectionLineSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        connectionLineSVG.id = 'Connection-Manager';
        connectionLineSVG.style.position = 'absolute';
        connectionLineSVG.style.top = '0';
        connectionLineSVG.style.left = '0';
        connectionLineSVG.style.width = '100%';
        connectionLineSVG.style.height = '100%';
        connectionLineSVG.style.pointerEvents = 'none'; // Let mouse events go through
        connectionLineSVG.style.zIndex = '1'; // Ensure SVG is above the grid but below nodes
  
        // Find the grid element and append SVG to it
        const gridElement = window.editor;
        if (gridElement) {
            gridElement.appendChild(connectionLineSVG);
        } else {
            document.body.appendChild(connectionLineSVG);
        }
        this.connectionLineSVG = connectionLineSVG;
    }
    isConnected(node1, node2) {
        return this.connections.find(conn => 
            conn.sourceNode === node1 && conn.targetNode === node2
        );
    }
    connect(node1, node2, noUpdateData = false) {
        if(node1 === node2) return;
        if(!node1 || !node2) return;
        if(this.isConnected(node1, node2)) {
            console.log('Already connected:', node1, node2);
            return;
        }
        if (typeof node1 === 'string') node1 = editor.getNode(node1);
        if (typeof node2 === 'string') node2 = editor.getNode(node2);
    
        // Get the center points of both nodes
        const rect1 = node1.nodeElement.getBoundingClientRect();
        const rect2 = node2.nodeElement.getBoundingClientRect();
    
        const sourceX = rect1.left + rect1.width;
        const sourceY = rect1.top + rect1.height / 2;
        const targetX = rect2.left + rect2.width / 2;
        const targetY = rect2.top + rect2.height / 2;
    
        // Create the path element
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const controlPoint1X = sourceX;
        const controlPoint1Y = sourceY;
        const controlPoint2X = targetX - 100;
        const controlPoint2Y = targetY;
    
        path.setAttribute('d', `M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetX-50} ${targetY}`);
        path.setAttribute('stroke', '#3498db');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.style.cursor = 'pointer';
        path.style.pointerEvents = 'auto';
    
        // Create arrow marker
        const arrowMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        arrowMarker.setAttribute('id', 'arrow');
        arrowMarker.setAttribute('viewBox', '0 0 10 10');
        arrowMarker.setAttribute('refX', '10');
        arrowMarker.setAttribute('refY', '5');
        arrowMarker.setAttribute('markerWidth', '3');
        arrowMarker.setAttribute('markerHeight', '3');
        arrowMarker.setAttribute('orient', 'auto');
    
        // Create a path for the arrow
        const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 Z');
        arrowPath.setAttribute('fill', '#3498db');
        arrowMarker.appendChild(arrowPath);

        // Append marker to SVG
        this.connectionLineSVG.appendChild(arrowMarker);
    
        // Set the path to use the marker
        path.setAttribute('marker-end', 'url(#arrow)');
    
        // Select a connector
        path.addEventListener('click', (e) => {
            e.stopPropagation();
    
            // Deselect all nodes   
            editor.clearAllSelected();
            this.clearAllSelectedConnections();
    
            // Toggle highlight for current path
            const isHighlighted = path.classList.toggle('highlighted');
            path.setAttribute('stroke', isHighlighted ? '#3498de' : '#3498db');
            path.setAttribute('stroke-width', isHighlighted ? '3' : '2');
    
            this.selectedConnection = isHighlighted ? path : null;
        });
    
        // Store connection info
        path.sourceNode = node1;
        path.targetNode = node2;
    
        this.connectionLineSVG.appendChild(path);
    
        if (!node1.outgoingConnections) node1.outgoingConnections = [];
        if (!node2.incomingConnections) node2.incomingConnections = [];
    
        node1.outgoingConnections.push(path);
        node2.incomingConnections.push(path);

        if(!noUpdateData) {
            node1.data.outputs.push(node2.id);
            node2.data.inputs.push(node1.id);
        }
        
        this.connections.push(path);
    }
    clearAllSelectedConnections() {
        // Unhighlight previously selected connection
        if (this.selectedConnection) {
            this.selectedConnection.classList.remove('highlighted');
            this.selectedConnection.setAttribute('stroke', '#3498db');
            this.selectedConnection.setAttribute('stroke-width', '2');
            this.selectedConnection = null;
        }
    }
    updateConnections(node1, node2) {
        // Get the center points of both nodes
        const rect1 = node1.nodeElement.getBoundingClientRect();
        const rect2 = node2.nodeElement.getBoundingClientRect();
        
        const sourceX = rect1.left + rect1.width;
        const sourceY = rect1.top + rect1.height / 2;
        const targetX = rect2.left + rect2.width;
        const targetY = rect2.top + rect2.height / 2;

        // Update all outgoing connections from node1
        if (node1.outgoingConnections) {
            node1.outgoingConnections.forEach(path => {
                const targetRect = path.targetNode.nodeElement.getBoundingClientRect();
                const targetX = targetRect.left;
                const targetY = targetRect.top + targetRect.height / 2;

                const controlPoint1X = sourceX + 100;
                const controlPoint1Y = sourceY;
                const controlPoint2X = targetX - 100;
                const controlPoint2Y = targetY;
                
                path.setAttribute('d', `M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetX} ${targetY}`);
            });
        }
    }
    disconnect(node1, node2) {
        console.log('Disconnecting nodes:', node1, node2);
        // Find and remove the connection between these nodes
        const connection = this.connections.find(conn => 
            conn.sourceNode === node1 && conn.targetNode === node2
        );
        node1.data.outputs = node1.data.outputs.filter(id => id !== node2.id);
        node2.data.inputs = node2.data.inputs.filter(id => id !== node1.id);
        if (connection) {
            // Remove from SVG
            this.connectionLineSVG.removeChild(connection);
            
            // Remove from node connection arrays
            if (node1.outgoingConnections) {
                node1.outgoingConnections = node1.outgoingConnections.filter(conn => conn !== connection);
            }
            if (node2.incomingConnections) {
                node2.incomingConnections = node2.incomingConnections.filter(conn => conn !== connection);
            }
            
            // Remove from connections array
            this.connections = this.connections.filter(conn => conn !== connection);
        }
    }
    getConnections(node) {
        return this.connections.filter(conn => 
            conn.sourceNode === node || conn.targetNode === node
        );
    }
    cleanupConnections() {
        // Get all nodes that currently exist in the editor
        const existingNodes = new Set(editor.nodes);
        
        // Filter connections where either source or target node no longer exists
        const invalidConnections = this.connections.filter(conn => {
            return !existingNodes.has(conn.sourceNode) || !existingNodes.has(conn.targetNode);
        });
        
        // Disconnect each invalid connection
        invalidConnections.forEach(conn => {
            this.disconnect(conn.sourceNode, conn.targetNode);
        });
    }
    removeAllConnections() {
        this.connections.forEach(conn => {
            this.connectionLineSVG.removeChild(conn);
        });
        this.connections = [];
    }
    redrawConnections() {
        this.connections.forEach(conn => {
            this.updateConnections(conn.sourceNode, conn.targetNode);
        });
    }
}

export default ConnectionManager;