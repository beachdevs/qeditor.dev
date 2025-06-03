globalThis.EncryptedSettings = class EncryptedSettings {
  static promptHTML = `
      <input id="password" type="password" name="password" placeholder="password" required />
      <two-col-inputs>
        <input name="key" placeholder1="name" required />
        <input name="value" placeholder2="value" required />
      </two-col-inputs>
    `;

  static setPromptHTML(html) {
    this.promptHTML = html;
  }

  static promptUser() {
    const modal = new ModalGeneric();
    modal.id = 'enc-settings-modal';
    modal.style.display = 'flex';
    document.body.appendChild(modal);
    const formId = `enc-settings-form-${Date.now()}`;

    modal.setContent(this.promptHTML);
    modal.show();
  }

  static async getValues(password) { /* returns comma separated string */
    const payload = storage.get('Settings', 'SavedValues');
    if (!payload) return null;

    const { ciphertext, iv, salt } = {
      ciphertext: this.b64toab(payload.ciphertext),
      iv: this.b64toab(payload.iv),
      salt: this.b64toab(payload.salt),
    };

    try {
      const result = await this.decrypt(password, ciphertext, iv, salt);
      return result.values;
    } catch (err) {
      console.error("Decryption failed:", err);
      return null;
    }
  }

  static async encrypt(obj, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.#deriveKey(password, salt);

    const encoded = new TextEncoder().encode(JSON.stringify(obj));
    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
    return { ciphertext, iv, salt };
  }

  static async decrypt(obj, password) {
    const { ciphertext, iv, salt } = obj;
    const key = await this.#deriveKey(password, salt);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    const decoded = new TextDecoder().decode(plaintext);
    return JSON.parse(decoded);
  }

  static async #deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }
//
  static #ab2b64(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  }

  static #b64toab(b64) {
    const bin = atob(b64);
    return new Uint8Array([...bin].map(c => c.charCodeAt(0)));
  }
}

Base.EncryptedSettings = EncryptedSettings;