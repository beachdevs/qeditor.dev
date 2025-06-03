globalThis.Message = class MessageComponent extends HTMLElement {
    constructor() {
      super();
      this._duration = 4000; // Default duration in milliseconds
    }
    connectedCallback() {
      this.attachShadow({ mode: 'open' });
    }
    static show(message, duration = 4000) {
      const notificationElement = document.createElement('div');
      notificationElement.style.position = 'fixed';
      notificationElement.style.bottom = '20px';
      notificationElement.style.left = '50%';
      notificationElement.style.transform = 'translateX(-50%)';
      notificationElement.style.padding = '15px 20px';
      notificationElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      notificationElement.style.color = 'white';
      notificationElement.style.borderRadius = '5px';
      notificationElement.style.fontSize = '14px';
      notificationElement.style.zIndex = '1000';
      notificationElement.style.opacity = '0';
      notificationElement.style.transition = 'opacity 0.5s';
  
      // Create message element
      const messageElement = document.createElement('div');
      messageElement.textContent = message;
      notificationElement.appendChild(messageElement);
  
      // Add to document
      document.body.appendChild(notificationElement);
  
      // Show the notification with fade-in
      setTimeout(() => {
        notificationElement.style.opacity = '1';
      }, 10);
  
      // Hide the notification after the specified duration
      setTimeout(() => {
        notificationElement.style.opacity = '0';
        setTimeout(() => {
          notificationElement.remove();
        }, 500);
      }, duration);
    }
  }
  