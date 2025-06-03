import DHTMLElement from '../base-classes/DHTMLElement.js';
import TimeSelector from './TimeSelector.mjs';
import TimezoneSelector from './TimezoneSelector.mjs';
import BaseElement from 'https://tinyurl.com/dpBaseElement';

class TypeTrigger extends BaseElement {
    constructor() {
        super();
    }
    connectedCallback() {
        const s = this.querySelector('select');
        s.addEventListener('change', () => {
            this.setAttribute('type', s.value);
        });
        this.querySelector('#date').value = new Date().toISOString().split('T')[0];
    }
    doEvents(e) {
        $('#trigger-type').addEventListener('change', (ev) => {
            this.attrType(ev.currentTarget.value);
        });
    }
    get value() {
        const values = {};
        this.querySelectorAll('.propvalue-trigger').forEach(element => {
            console.log('TypeTrigger get value', element);
            const value = element.value;
            if(value) values[element.getAttribute('propname')] = value;
        });
        if(values["triggertype"] == 'at-time-input') {
            return {
                type: 'at-time-input', 
                date: values["trigger_date"], 
                hours: values["at-time"].hours, 
                minutes: values["at-time"].minutes,
                seconds: values["at-time"].seconds,
                ampm: values["at-time"].ampm,
                timezone: values.timezone
            };
        }
        if(values["triggertype"] == 'wait-input') {
            return {
                type: 'wait-input', 
                hours: values["trigger_wait"].hours,
                minutes: values["trigger_wait"].minutes,
                seconds: values["trigger_wait"].seconds
            };
        }
        if(values["triggertype"] == 'custom-input') {
            return {
                type: 'custom',
                logic: values["trigger_custom"]
            };
        }
        return null;
    }

    attrType(type) {
        $('select').value = type;
        $('#at-time-input').style.display = type === 'at-time-input' ? 'block' : 'none';
        $('#wait-input').style.display = type === 'wait-input' ? 'block' : 'none';
        $('#custom-input').style.display = type === 'custom-input' ? 'block' : 'none';
        if(type === 'wait-input') {
            $$('time-selector').forEach(selector => {
                selector.setAttribute('no-ampm', 'true');
            });
        } else {
            $$('time-selector').forEach(selector => {
                selector.removeAttribute('no-ampm');
            });
        }
    }

    set value(value) {
        // Type = Now
        if(!value) return this.querySelector('select').value = 'now';

        // Type = At Specific Time
        if(value.type == 'at-time-input') {
            this.querySelector('#trigger-type').value = 'at-time-input';
            this.querySelector('#date').value = value.date;
            this.querySelector('#at-time').value = {
                hours: value.hours,
                minutes: value.minutes,
                seconds: value.seconds,
                ampm: value.ampm
            };
            this.querySelector('#timezone').value = value.timezone;
        }

        // Type = Wait
        if(value.type == 'wait-input') {
            this.querySelector('#trigger-type').value = 'wait-input';
            this.querySelector('#wait-time-selector').value = {
                hours: value.hours,
                minutes: value.minutes,
                seconds: value.seconds
            }
        }

        // Type = Custom
        if(value.type == 'custom') {
            this.querySelector('#trigger-type').value = 'custom-input';
            this.querySelector('#custom').value = value.logic;
        }
    }
    
    html() {
        return `
            <div class="type-trigger" style="display: flex; flex-direction: column; gap: 10px; padding: 10px;">
                <label for="trigger-type" style="font-size: 14px;">Trigger Type:</label>
                <div>
                <select id="trigger-type" propname="triggertype" class="propvalue-trigger" required="true" style="padding: 8px; font-size: 14px; border: 1px solid #ccc; border-radius: 6px;">
                    <option value="now">Now</option>
                    <option value="at-time-input">At Specific Time</option>
                    <option value="wait-input">Wait</option>
                    <!--<option value="custom-input">Custom Criteria</option>-->
                </select>
                </div>
                <!-- At specific time -->
                <div id="at-time-input" style="display: none;">
                    <label for="datetime" style="font-size: 14px;">Time:</label>
                    <input 
                        propname="trigger_date"
                        class="propvalue-trigger"
                        type="date" 
                        id="date"
                        style="padding: 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px;"
                    >
                    <time-selector id="at-time" propname="at-time" class="propvalue-trigger" default="12 00 00 AM"></time-selector>
                    <timezone-selector id="timezone" propname="timezone" class="propvalue-trigger"></timezone-selector>
                </div>

                <!-- After delay -->
                <div id="wait-input" style="display: none;">
                    <time-selector default="0 0 15" id="wait-time-selector" propname="trigger_wait" class="propvalue-trigger"></time-selector>
                </div>

                <!-- Custom criteria -->
                <div id="custom-input" style="display: none;">
                    <label for="custom" style="font-size: 14px;">Custom Criteria:</label>
                    <input 
                        propname="trigger_custom"
                        class="propvalue-trigger"
                        type="text" 
                        id="custom" 
                        placeholder="e.g. when status == 'ready'"
                        style="padding: 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px;"
                    >
                </div>
            </div>
        `;
    }
}
export default TypeTrigger;
customElements.define('type-trigger', TypeTrigger);
