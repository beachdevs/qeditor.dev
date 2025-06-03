class WelcomePage extends HTMLElement {
  constructor() {
    super();
    this.ctaButton = null;
  }

  connectedCallback() {
    this.render();

    this.ctaButton = this.querySelector('#cta-button');
    this.ctaButton?.addEventListener('click', () => {this.closest('welcome-page').remove()});

    if (localStorage.getItem('Welcome') === 'true') {
      this.hide();
    } else {
      this.show();
    }
  }

  render() {
    this.classList.add('panel', 'welcome-page');
    this.id = 'landing-panel';

    this.innerHTML = `
<nav class="navbar">
  <img src="logo.svg" alt="Workflow Automation Logo">
</nav>

<section class="hero">
  <div class="container">
    <h1>Simplify. Automate. Accelerate.</h1>
    <p>Build powerful workflows in minutes with prebuilt templates and AI-assisted tools.</p>
    <button id="cta-button">Get Started</button>
  </div>
</section>

<section class="features">
  <div class="feature">
    <h2>Fast</h2>
    <p>Launch end-to-end automations in just a few clicks — no coding required.</p>
  </div>
  <div class="feature">
    <h2>Flexible</h2>
    <p>Integrate your favorite apps and fully customize logic to fit your exact needs.</p>
  </div>
  <div class="feature">
    <h2>Scalable</h2>
    <p>Whether you're automating a team or an enterprise, our platform grows with you.</p>
  </div>
</section>
    `;
  }

  handleGetStarted() {
    this.classList.add('fade-out');
    localStorage.setItem('Welcome', 'true');
    setTimeout(() => this.hide(), 500);
  }

  show() {
    this.style.display = 'block';
    this.classList.remove('fade-out');
    document.body.style.overflow = 'hidden';
  }

  hide() {
    this.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

customElements.define('welcome-page', WelcomePage);

if(localStorage.getItem('Welcome') !== 'true') {
  document.body.appendChild(new WelcomePage());
  localStorage.setItem('Welcome', 'true');
}