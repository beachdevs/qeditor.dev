class SmartBox extends HTMLElement {
  constructor() {
    super();

    // --- Shadow DOM for Encapsulation ---
    // Using Shadow DOM to encapsulate styles and structure.
    // This prevents styles from bleeding in or out of the component.
    const shadowRoot = this.attachShadow({ mode: 'open' });

    // --- Styles for the Component (within Shadow DOM) ---
    const style = document.createElement('style');
    style.textContent = `
      :host { /* Styles the gemini-box element itself from within */
        display: block; /* Custom elements are inline by default */
        width: 100%;
        max-width: 350px; /* Slightly wider for better readability */
        font-family: 'Inter', sans-serif; /* Consistent font */
        border: 1px solid #e0e0e0; /* Softer border */
        border-radius: 12px; /* Rounded corners for the component */
        overflow: hidden; /* Clip content to rounded corners */
        background-color: #ffffff; /* White background for the box */
      }
      .container {
        display: flex;
        flex-direction: column;
        padding: 16px; /* Uniform padding */
        gap: 12px; /* Space between elements */
      }
      .output {
        position: relative;
        padding: 12px;
        padding-bottom: 36px; /* Make room for the button */
        border: 1px solid #e0e0e0; /* Softer border */
        background: #f9fafb; /* Lighter background for output */
        font-size: 0.9rem;
        white-space: pre-wrap; /* Preserve line breaks and spaces */
        word-wrap: break-word; /* Break long words */
        border-radius: 8px; /* Rounded corners for output */
        min-height: 50px; /* Minimum height to avoid collapsing */
        color: #333; /* Darker text for better contrast */
        line-height: 1.5;
        max-height: 300px; /* Maximum height before scrolling */
        overflow: hidden; /* Hide overflow */
      }
      .output-content {
        max-height: 250px; /* Leave room for button */
        overflow-y: auto; /* Add vertical scrollbar when needed */
        padding-right: 8px; /* Space for scrollbar */
      }
      .output.hidden { /* Class to control visibility */
        display: none !important;
      }
      input[type="text"] {
        width: 100%; /* Full width */
        box-sizing: border-box; /* Include padding and border in the element's total width and height */
        padding: 10px 12px;
        font-size: 1rem;
        border: 1px solid #ccc;
        border-radius: 8px; /* Rounded corners for input */
        transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      }
      input[type="text"]:focus {
        border-color: #007bff; /* Highlight focus */
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25); /* Focus ring */
        outline: none;
      }
      .status-message {
        font-style: italic;
        color: #555;
      }
      .error-message {
        color: #d9534f; /* Red for errors */
        font-weight: 500;
      }
      .copy-button {
        position: absolute;
        bottom: 8px;
        right: 8px;
        padding: 4px 8px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        display: none; /* Hide by default */
      }
      .copy-button.visible {
        display: block; /* Show when has content */
      }
    `;

    // --- HTML Structure ---
    // Main container for the component's elements
    const container = document.createElement("div");
    container.classList.add("container");

    // Output div: displays responses or status messages
    this.output = document.createElement("div");
    this.output.classList.add("output", "hidden"); // Start hidden
    this.output.setAttribute('aria-live', 'polite');

    // Create a container for the text content
    this.outputContent = document.createElement("div");
    this.outputContent.classList.add("output-content");
    this.output.appendChild(this.outputContent);

    // Add copy button
    const copyButton = document.createElement("button");
    copyButton.classList.add("copy-button");
    copyButton.textContent = "Copy to Editor";
    copyButton.addEventListener("click", () => {
      const editor = document.getElementById('editor');
      let code = this.outputContent.textContent;
      if (code.includes('```html')) {
        const htmlMatch = code.match(/```html\n([\s\S]*?)```/);
        if (htmlMatch) {
          code = htmlMatch[1];
        }
      }
      editor.value = code;
      // Trigger input event to update preview
      editor.dispatchEvent(new Event('input'));
    });
    this.output.appendChild(copyButton);

    // Store copyButton reference
    this.copyButton = copyButton;

    // Input field for user queries
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.placeholder = "Ask me anything...";
    this.input.setAttribute('aria-label', 'Ask Gemini'); // Accessibility

    // --- Event Listener for Input ---
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && this.input.value.trim()) {
        let queryText = this.input.value.trim();
        queryText += '. be brief. ' + document.body.innerHTML;
        this.queryGemini(queryText);
        // this.input.value = ""; // Optionally clear input immediately
      }
      if (e.key === "Escape") {
        this.output.classList.add("hidden");
        this.input.value = "";
      }
    });

    // --- Append elements to Shadow DOM ---
    container.appendChild(this.output);
    container.appendChild(this.input);

    shadowRoot.appendChild(style); // Add styles to Shadow DOM
    shadowRoot.appendChild(container); // Add container to Shadow DOM
  }

  // Class method to update visibility
  updateButtonVisibility() {
    const hasContent = this.outputContent.textContent.trim();
    if (hasContent) {
      this.output.classList.remove('hidden');
      this.copyButton.classList.add('visible');
    } else {
      this.output.classList.add('hidden');
      this.copyButton.classList.remove('visible');
    }
  }

  // --- Asynchronous function to query the Gemini API ---
  async queryGemini(text) {
    // Show output area and set "Thinking..." message
    this.output.classList.remove("error-message"); // Clear previous error styling
    this.output.classList.add("status-message");
    this.outputContent.textContent = "Thinking...";
    this.updateButtonVisibility();

    const API_URL = `https://digplan-gem.deno.dev?prompt=${encodeURIComponent(text)}`;

    try {
      // Make the API request
      const response = await fetch(API_URL);

      // Check if the request was successful (status code 200-299)
      if (!response.ok) {
        // Handle HTTP errors (e.g., 404 Not Found, 500 Internal Server Error)
        const errorText = await response.text(); // Try to get error text from response
        this.outputContent.textContent = `Error: ${response.status} ${response.statusText}. ${errorText ? `Details: ${errorText.substring(0,100)}` : ''}`;
        this.output.classList.add("error-message");
        this.updateButtonVisibility();
        console.error("API Error:", response.status, response.statusText, errorText);
        return; // Exit the function
      }

      // Parse the JSON response
      const data = await response.json();

      // Display the response or a "no response" message
      if (data && data.gemini_response) {
        this.output.classList.remove("status-message");
        this.outputContent.textContent = data.gemini_response;
      } else {
        this.output.classList.remove("status-message");
        this.outputContent.textContent = "No response or unexpected format from API.";
        console.warn("Unexpected API response format:", data);
      }
      this.updateButtonVisibility();
    } catch (error) {
      // Handle network errors (e.g., no internet) or JSON parsing errors
      this.outputContent.textContent = "Failed to fetch response. Check your connection or the console for details.";
      this.output.classList.add("error-message");
      this.updateButtonVisibility();
      console.error("Query Gemini Error:", error);
    } finally {
        // Clear input field after attempt, regardless of success or failure
        if (this.input) { // Ensure input exists
            this.input.value = "";
        }
    }
  }
}

customElements.define("smart-box", SmartBox);
