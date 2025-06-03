class ZoomZoom extends HTMLElement {
  constructor() {
    super();
    this.scale = 1;
    this.controls = document.createElement('div');
    this.controls.innerHTML = `<icon-plus></icon-plus><icon-minus></icon-minus>`;
    this.appendChild(this.controls);

    const plus = this.controls.children[0];
    const minus = this.controls.children[1];

    plus.onclick = () => this.zoom(0.1);
    minus.onclick = () => this.zoom(-0.1);
  }

  setScale(scale) {
    this.scale = scale;
  }

  zoom(delta) {
    if(this.scale >= 1 && delta > 0) return;
    if(this.scale <= 0.3 && delta < 0) return;
    this.scale += delta;
    editor.style.transform = `scale(${this.scale})`;
    editor.style.transformOrigin = 'top left';
    
    $('box-editor').querySelectorAll('.box-editor-box').forEach(el => {
        el.style.transform = `scale(${this.scale})`;
        el.style.transformOrigin = 'top left';
    });
    editor.connectionManager.redrawConnections();
    Base.dispatch('onZoomChanged', this.scale);
  }
}
customElements.define('zoom-zoom', ZoomZoom);
export default ZoomZoom;
document.body.appendChild(new ZoomZoom());
