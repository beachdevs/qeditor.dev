import BaseElement from 'https://tinyurl.com/dpBaseElement';
import UserProfile from '../components/UserProfile.mjs';

class FlyoutWindow extends BaseElement {
  html() { 
    return `
      <div id="flyout-window" class="flyout-window">
        <svg onclick="this.parentElement.classList.toggle('open')" class="close-icon" id="close-flyout" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <div id="flyout-content"></div>
      </div>
    `;
  }
  set value(content) {
    $id('flyout-content').innerHTML = content;
  }
  get value() {
    return $id('flyout-content').innerHTML;
  }
  get isOpen() {
    return $id('flyout-window').classList.contains('open');
  }
  onToggleFlyout() {
    $id('flyout-window').classList.toggle('open');
  }
  onNodeShowStatus(execution) {
    const exbox = this.querySelector('.executions-container');
    if(exbox && execution) exbox.innerHTML = '<pre>' + JSON.stringify(execution, null, 2) + '</pre>';
  }
  async onLoggedInUser(user) {
    const cacheResponseURL = await UserProfile.getUserPicture(user.picture);
    this.value = `
        <!-- User profile -->
        <div class="menu-item-big user-profile-header" style="display: flex; gap: 6px; align-items: center;">
          <img id="user-profile-pic" src="${cacheResponseURL}" class="user-image">
          <span id="user-profile-name" class="user-name">${user.name}</span>
        </div>

        <hr style="margin: 12px 0;">
        
        <!-- Show Hide Node Properties -->
        <div class="menu-item-small" style="display: flex; align-items: left; gap: 6px; margin-top: 12px;">
          <i class="fa-solid"></i>
          <a id="showHideNodeProperties" href="#" onclick="Base.dispatch('onToggleHNProperties')">
           ${SettingsManager.get('HoverProps') ? 'Show Node Properties when hovered' : 'Hide Node Properties when hovered'}
          </a>
        </div>

        <!-- Clear -->
        <div class="menu-item-small" style="display: flex; align-items: left; gap: 6px; margin-top: 12px;">
          <i class="fa-solid fa-trash" style="height: 12px; width: 12px;"></i>
          <a href="#" onclick="localStorage.clear(); location.reload()">Clear</a>
        </div>

        <!-- Export Workflow -->
        <div class="menu-item-small" style="display: flex; align-items: left; gap: 6px; margin-top: 12px;">
          <i class="fa-solid fa-download" style="height: 12px; width: 12px;"></i>
          <a href="#" onclick="Base.dispatch('onExportWorkflow')">Export Workflow</a>
        </div>

        <!-- Help -->
        <div class="menu-item-small" style="display: flex; align-items: left; gap: 6px; margin-top: 12px;">
          <i class="fa-solid fa-question" style="height: 12px; width: 12px;"></i>
          <a href="#" onclick="Base.dispatch('onHelpbox')"> Help</a>
        </div>

        <hr style="margin: 12px 0;">
        <!-- Logout -->
        <div class="menu-item-small" style="display: flex; align-items: center; gap: 6px;">
          <i class="fas fa-sign-out-alt"></i>
          <a href="#" onclick="javascript:document.getElementsByTagName('user-profile')[0].auth.logout()">Sign out</a>
        </div>

        <!-- Executions -->
        <hr style="margin: 12px 0;">
        <div class="executions-container"></div>
   `;
   const e = $id('showHideNodeProperties');
   e.innerText = SettingsManager.get('HoverProps') ? 'Show Node Properties when hovered' : 'Hide Node Properties when hovered';
  }
  onToggleHNProperties() {
    const show = SettingsManager.get('HoverProps');
    if(!show) SettingsManager.save('HoverProps', true);
    else SettingsManager.save('HoverProps', '');
    const e = $id('showHideNodeProperties');
    e.innerText = SettingsManager.get('HoverProps') ? 'Show Node Properties when hovered' : 'Hide Node Properties when hovered';
  }
}
export default FlyoutWindow;
customElements.define('flyout-window', FlyoutWindow);

const flyout = new FlyoutWindow();
document.body.appendChild(flyout);
