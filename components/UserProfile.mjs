import Login from '../base-classes/Login.js';
import BaseElement from 'https://tinyurl.com/dpBaseElement';
class UserProfile extends BaseElement {
  auth = null;
  debug = false;
  constructor() {
    super();
  }

  async connectedCallback() {
    this.auth = new Login();
    // Handle redirect callback if present
    await new Promise(r => setTimeout(r, 1000)); // waits 1 second
    if (window.location.search.includes('code=')) {
      try {
        await this.auth.handleRedirectCallback();
        // Clear the URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error handling callback:', error);
      }
    }
    this.render();
  }

  onLoggingOut() {
    
    BrowserCache.deleteCache("*");
  }

  static async getUserPicture(url) {
    const cache = await BrowserCache.getImage('user-picture', url);
    if(cache.fromCache) {
      console.log('from cache', cache.file);
      return cache.file;
    }
    console.log('not from cache', url);
    return url;
  }

  async render() {
    this.innerHTML = `<div id="user-profile-content"></div>`;
    // Update content after a delay to ensure Auth0 is initialized
    setTimeout(async () => {
      const isAuth = await this.auth.isAuthenticated();
      if (isAuth) {
        const user = await this.auth.getUser();
        Base.dispatch('onLoggedInUser', user);
        document.getElementById('user-profile-content').innerHTML = `
          <div class="profile" id="user-profile-container">
            <img src="${await UserProfile.getUserPicture(user.picture)}" alt="Profile" referrerPolicy="no-referrer">
            <div class="info">
              <!-- User name: <div class="name">${user.name || 'User'}</div> -->
            </div>
            <div class="dropdown" id="profile-dropdown">
              <div class="dropdown-item" onclick="document.getElementsByTagName('user-profile')[0].auth.logout()">
                <i class="fas fa-right-from-bracket"></i>
                <span>Logout</span>
              </div>
            </div>
          </div>
        `;

        // Add click handler for the profile container
        const profileContainer = document.getElementById('user-profile-container');
        const dropdown = document.getElementById('profile-dropdown');
        
        profileContainer.addEventListener('click', () => {
          Base.dispatch('onShowSettings');
          //dropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
          if (!this.contains(event.target)) {
            //dropdown.classList.remove('show');
          }
        });
      } else {
        document.getElementById('user-profile-content').innerHTML = `
          <button class="login-btn" onclick="document.getElementsByTagName('user-profile')[0].auth.login()" title="Login">
            <i class="fas fa-right-to-bracket"></i>
          </button>
        `;
      }
    }, 400);
  }
}
export default UserProfile;
customElements.define('user-profile', UserProfile);