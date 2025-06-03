globalThis.Login ??= class Login {
  constructor() {
    this.auth0 = null;
    this.ready = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = "https://cdn.auth0.com/js/auth0-spa-js/1.13/auth0-spa-js.production.js";
      script.type = 'text/javascript';
      script.onload = async () => {
        try {
          this.auth0 = await createAuth0Client({
            domain: "digplan.auth0.com",
            client_id: "21c9EJMXML6ASxwkbj8PkdCdyrhdh4IA"
          });
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      document.head.appendChild(script);
    });
  }

  async login() {
    await this.ready;
    await this.auth0.loginWithRedirect({
      redirect_uri: window.location.origin,
      scope: 'openid profile email'
    });
  }

  async logout() {
    Base.dispatch('onLoggingOut');
    await this.ready;
    await this.auth0.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  }

  async isAuthenticated() {
    await this.ready;
    return await this.auth0.isAuthenticated();
  }

  async getUser() {
    await this.ready;
    return await this.auth0.getUser();
  }

  async handleRedirectCallback() {
    await this.ready;
    await this.auth0.handleRedirectCallback();
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

export default Login;