import Ubox from './UBox.mjs';
class TimezoneSelector extends Ubox {
  constructor() {
    super();
    this.noNewEntries = true;
    const entries = [];
    const timezonesWithOffsets = Intl.supportedValuesOf('timeZone').map(tz => {
      const offset = this.getOffsetForTimezoneName(tz);
      return `${tz} ${offset}`;
    });
    this.setItems(timezonesWithOffsets);

    let tzo = Math.abs(new Date().getTimezoneOffset() / 60);
    const localTimezone = `${Intl.DateTimeFormat().resolvedOptions().timeZone} ${(new Date()).toString().split(' ')[5]}`;
    this.selected(localTimezone);
  }
  isDST() {
    return new Date().getTimezoneOffset() < Math.max(
        new Date(new Date().getFullYear(), 0, 1).getTimezoneOffset(),
        new Date(new Date().getFullYear(), 6, 1).getTimezoneOffset()
    );
  }
  getOffsetForTimezoneName(tz) {
    const timeInUTC = new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', hour12: false
    }).format(new Date());
    const timeInZone = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', hour12: false
    }).format(new Date());
    const hoff = this.getHoursOffset(tz, timeInUTC, timeInZone);
    return `GMT${hoff}`;
  }
  getHoursOffset(tz, str1, str2) {
        // Convert "April 29, 2025 at 4 PM" → "April 29, 2025, 16:00"
        const str1s = str1.split(' ');
        const str2s = str2.split(' ');
        const houradjust1 = str1s[5] === 'PM' ? 0 : 0;
        const houradjust2 = str2s[5] === 'PM' ? 0 : 0;

        const date1 = new Date(`${str1s[0]} ${str1s[1]} ${str1s[2]} ${parseInt(str1s[4], 10) + houradjust1}:00`);
        const date2 = new Date(`${str2s[0]} ${str2s[1]} ${str2s[2]} ${parseInt(str2s[4], 10) + houradjust2}:00`);
        //console.log(`Time in UTC: ${date1}, Time in ${tz}: ${date2}`);

        let diffHours = -((date1 - date2) / (1000 * 60 * 60));
        if(diffHours >= 0) diffHours = `+${diffHours}`;
        
        return this.formatOffset(diffHours);
  }
  formatOffset (s) {
    if (typeof s === 'string') {
        s = parseFloat(s);
    }
    const sign = s >= 0 ? '+' : '-';
    const hours = Math.abs(Math.floor(s));
    const minutes = Math.abs(Math.floor((s % 1) * 60));
    return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  get value() {
    return this.getSelected();
  }
  set value(value) {
    this.selected(value);
  }
}
export default TimezoneSelector;
customElements.define('timezone-selector', TimezoneSelector);
