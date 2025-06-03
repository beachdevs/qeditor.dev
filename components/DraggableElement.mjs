import BaseElement from 'https://tinyurl.com/dpBaseElement';
class DraggableElement extends BaseElement {
    isDragging = false;
    startX = 0;
    startY = 0;
    x = 0;
    y = 0;

    constructor() {
        super();
        this.onDragStart = this.onDragStart.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.enableDrag();
    }

    disableDrag() {
        this.removeEventListener('mousedown', this.onDragStart);
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.onDragEnd);
    }

    enableDrag() {
        this.addEventListener('mousedown', this.onDragStart);
        document.addEventListener('mousemove', this.onDrag);
        document.addEventListener('mouseup', this.onDragEnd);
    }

    onDragStart(e) {
        this.isDragging = true;
        this.startX = e.clientX - this.x;
        this.startY = e.clientY - this.y;
    }

    setPosition(x, y) {
        if(this.nodeElement) {
            this.nodeElement.style.left = `${x}px`;
            this.nodeElement.style.top = `${y}px`;
        }
        this.x = x;
        this.y = y;
    }

    onDrag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        const newX = e.clientX - this.startX;
        const newY = e.clientY - this.startY;
        this.setPosition(newX, newY);
        Base.dispatch('onDraggedElement', { id: this.id, e: e, x: this.x, y: this.y });
    }

    onDragEnd() {
        if (!this.isDragging) return;
        this.isDragging = false;
        Base.dispatch('onDraggedElementEnd', { id: this.id, x: this.x, y: this.y });
    }
}
customElements.define('draggable-element', DraggableElement);
export default DraggableElement;