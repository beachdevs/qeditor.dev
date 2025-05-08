# Custom Elements Playground

**Custom Elements Playground** is a live HTML/JS editor designed specifically for building and testing custom web components in real time.

![screenshot](screenshot.png) <!-- Replace with actual image path -->

## ✨ Features

- Live preview of your custom elements
- Real-time syntax highlighting with Prism.js
- Inline error display inside the preview pane
- Zero build steps — runs entirely in the browser
- Font Awesome support out of the box

## 🧪 Use Case

Perfect for:

- Prototyping custom elements
- Sharing web component examples
- Learning Web Components API interactively

## 🚀 Getting Started

Just open the editor in your browser and start coding:

```html
<script>
  class MyElement extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `<p>Hello!</p>`;
    }
  }
  customElements.define('my-element', MyElement);
</script>

<my-element></my-element>
