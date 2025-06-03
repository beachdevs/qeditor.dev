import BaseElement from 'https://tinyurl.com/dpBaseElement';
class IconBox extends BaseElement {
    disableHide = false;
    html() {
        this.style.position = 'absolute';
        this.style.opacity = '0';
        this.style.right = '-3px';
        this.style.top = '0';
        this.style.transform = 'scale(0.65)';
        this.style.cursor = 'default';
        const types = this.getAttribute('types')?.split(',') || [];
        return `
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
            <div class="icon-box">
                ${types.includes('power') ? '<span class="icon power-toggle"><i class="fas fa-power-off"></i></span>' : ''}
                ${types.includes('cog') ? '<span class="icon properties-toggle"><i class="fas fa-cog"></i></span>' : ''}
                ${types.includes('play') ? '<span class="icon play-toggle"><i class="fas fa-play"></i></span>' : ''}
            </div>
        `;
    }
    doEvents() {
        this.addEventListener('mouseover', (e) => { 
          if(!this.disableHide) this.style.opacity = '1'; 
        });
        this.addEventListener('mouseout', (e) => { 
          if(!this.disableHide) this.style.opacity = '0'; 
        });
        this.addEventListener('click', (e) => { 
            const icon = e.target.closest('.icon');
            if (!icon) return;
            if (icon.classList.contains('power-toggle')) {
                Base.dispatch('onIconBoxPower', { nodeId: this.nodeId });
            } else if (icon.classList.contains('play-toggle')) {
                Base.dispatch('onIconBoxPlay', { nodeId: this.nodeId });
            } else if (icon.classList.contains('properties-toggle')) {
                Base.dispatch('onIconBoxProperties', { nodeId: this.closest('editor-node').id });
            }
         });
    }
    onNodeRunStart(data) {
        if(data.nodeId === this.closest('editor-node').id) {
            this.disableHide = true;
            this.style.opacity = '1';
            this.querySelector('.power-toggle').style.opacity = '0';
            this.querySelector('.properties-toggle').style.opacity = '0';
            this.querySelector('.play-toggle').style.opacity = '1';
        }
    }
    onNodeResult(data) {
      if(data.nodeId === this.closest('editor-node').id) {
        this.disableHide = false;
        this.style.opacity = '0';
        this.querySelector('.power-toggle').style.opacity = '1';
        this.querySelector('.properties-toggle').style.opacity = '1';
        this.querySelector('.play-toggle').style.opacity = '1';
      }
    }
    stop() {
        this.querySelector('.play-toggle i').className = 'fas fa-play';
    }
    running() {
        this.querySelector('.play-toggle i').className = 'fas fa-spinner fa-spin';
    }
}
export default IconBox;
customElements.define('icon-box', IconBox);