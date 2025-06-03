import BaseElement from "https://tinyurl.com/dpBaseElement";

class TimeSelector extends BaseElement {
  static get observedAttributes() {
    return ['no-ampm', 'default'];
  }

  html() {
    return `
        <div class="time-selector" style="display: flex; gap: 10px; align-items: center;">
            <div class="time-input-group">
                <label for="hours" style="font-size: 14px;">Hours:</label>
                <input default="1" type="number" id="hours" min="1" max="12" style="width: 60px; padding: 8px; border: 1px solid #ccc; border-radius: 6px;">
            </div>
            <div class="time-input-group">
                <label for="minutes" style="font-size: 14px;">Minutes:</label>
                <input default="0" type="number" id="minutes" min="0" max="59" style="width: 60px; padding: 8px; border: 1px solid #ccc; border-radius: 6px;">
            </div>
            <div class="time-input-group">
                <label for="seconds" style="font-size: 14px;">Seconds:</label>
                <input default="0" type="number" id="seconds" min="0" max="59" style="width: 60px; padding: 8px; border: 1px solid #ccc; border-radius: 6px;">
            </div>
            <div class="time-input-group" id="ampm-group" style="display: ${this.hasAttribute('no-ampm') ? 'none' : 'block'}">
                <label for="ampm" style="font-size: 14px;">AM/PM:</label>
                <select id="ampm" style="padding: 8px; border: 1px solid #ccc; border-radius: 6px;">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </select>
            </div>
        </div>
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'no-ampm') {
      const ampmGroup = this.querySelector('#ampm-group');
      if (ampmGroup) {
        ampmGroup.style.display = newValue !== null ? 'none' : 'block';
      }
    }
    if (name === 'default' && newValue) {
      const [hours, minutes, seconds, ampm] = newValue.split(' ');
      this.value = {
        hours: hours || '',
        minutes: minutes || '',
        seconds: seconds || '',
        ampm: ampm || 'AM'
      };
    }
  }

  // e.value = {hours: 1, minutes: 2, seconds: 3, ampm: 'AM'}
  get value() {
    const value = {
      hours: this.querySelector('#hours').value,
      minutes: this.querySelector('#minutes').value,
      seconds: this.querySelector('#seconds').value
    };
    if (!this.hasAttribute('no-ampm')) {
      value.ampm = this.querySelector('#ampm').value;
    }
    return value;
  }

  set value(value = {hours: '', minutes: '', seconds: '', ampm: ''}) {
    this.querySelector('#hours').value = value.hours;
    this.querySelector('#minutes').value = value.minutes;
    this.querySelector('#seconds').value = value.seconds;
    if (!this.hasAttribute('no-ampm')) {
      this.querySelector('#ampm').value = value.ampm;
    }
  }
}
export default TimeSelector;
customElements.define('time-selector', TimeSelector);