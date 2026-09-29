class WikiEditableElement extends HTMLElement {
  constructor() {
    super();

    // Bind methods to maintain 'this' context
    this.startEditing = this.startEditing.bind(this);
    this.finishEditing = this.finishEditing.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleExternalUpdate = this.handleExternalUpdate.bind(this);
  }

  // Called when the element is inserted into the DOM
  connectedCallback() {
    this.storageKey = this.getAttribute('storage-key');
    this.defaultName = this.innerText;
    this.eventKey = this.storageKey + '-updated';
  
    this.render();

    // 1. Enable editing on click
    this.addEventListener('click', this.startEditing);

    // 2. Finish editing on blur (clicking away)
    this.addEventListener('blur', this.finishEditing);

    // 3. Finish editing on Enter key
    this.addEventListener('keydown', this.handleKeydown);

    // 4. Listen for updates from other elements on the SAME tab
    window.addEventListener(this.eventKey, this.handleExternalUpdate);

    // 5. Listen for updates from DIFFERENT tabs
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        this.updateDisplay(e.newValue);
      }
    });
  }

  // Called when element is removed (good practice for cleanup)
  disconnectedCallback() {
    window.removeEventListener(this.eventKey, this.handleExternalUpdate);
  }

  // Initial render reading from localStorage
  render() {
    const storedName = localStorage.getItem(this.storageKey);
    this.textContent = storedName || this.defaultName;
  }

  startEditing() {
    if (this.isContentEditable) return;

    this.contentEditable = true;
    this.focus();

    // Highlight existing text so user can just start typing to replace it
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(this);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  handleKeydown(e) {
    // Prevent line breaks, force save on Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      this.blur(); // This triggers finishEditing()
    }
  }

  finishEditing() {
    this.contentEditable = false;
    let newName = this.textContent.trim();

    // Prevent empty names
    if (!newName) {
      newName = this.defaultName;
      this.textContent = newName;
    }

    // Save to localStorage
    localStorage.setItem(this.storageKey, newName);

    // Broadcast to all other <wiki-editable-name> elements in the current tab
    window.dispatchEvent(new CustomEvent(this.eventKey, { detail: newName }));
  }

  handleExternalUpdate(e) {
    // Update display, unless THIS specific element is the one currently being typed in
    if (!this.isContentEditable) {
      this.updateDisplay(e.detail);
    }
  }

  updateDisplay(newName) {
    this.textContent = newName || this.defaultName;
  }
}

customElements.define('wiki-editable-name', WikiEditableElement);
