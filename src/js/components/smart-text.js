import Util from '../util/util.js';

export default class SmarText {
  constructor(options) {
    this.$el = options.$el;
    this.text = this.$el.innerText;
    this.init();
  }

  init() {
    // Parse words from the element's content
    this.words = this.parseWords();
    this.$el.innerHTML = '';

    // Convert each word to a separate HTML element and append to container
    this.words.forEach((word) => {
      const element = this.createWordElement(word);
      this.$el.appendChild(element);
    });

    // Apply line breaks to achieve responsive layout
    this.applyLineBreaks();
  }

  // Parse words from <p> and header elements, distinguishing text and anchor links
  parseWords() {
    const words = [];
    this.$el.querySelectorAll('p, h1, h2, h3, h4, h5, h6').forEach((p) => {
      p.childNodes.forEach((child) => {
        if (child.nodeType === 3) { // If text node
          const text = child.textContent.trim();
          if (text !== '') {
            // Split text into words and wrap each in a SPAN element
            words.push(...text.split(' ').map((w) => ({ type: 'SPAN', word: w })));
          }
        } else if (child.tagName === 'A') { // If anchor link
          const text = child.textContent.trim();
          if (text !== '') {
            // Preserve link attributes (href, target) for word element
            words.push({ type: 'A', word: text, href: child.href, target: child.target });
          }
        } else {
          // For other element types, recursively parse child nodes
          words.push(...this.parseChildWords(child));
        }
      });
    });
    return words;
  }

  // Recursive parsing of child elements to handle nested text
  parseChildWords(node) {
    const words = [];
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) { // If text node
        const text = child.textContent.trim();
        if (text !== '') {
          // Split text into words and associate with the parent tag type
          words.push(...text.split(' ').map((w) => ({ type: node.tagName, word: w })));
        }
      }
    });
    return words;
  }

  // Create an HTML element for each word, with classes and attributes as needed
  createWordElement(word) {
    const element = document.createElement(word.type);
    element.innerText = word.word;
    element.classList.add('word');

    // For anchor links, preserve href and target attributes
    if (word.type === 'A') {
      element.href = word.href;
      element.target = word.target;
    }
    return element;
  }

  // Apply line breaks based on the available width, using Util helper functions
  applyLineBreaks() {
    const maxWidth = Util.getStyleNumber(this.$el, 'maxWidth');
    const parentWidth = this.$el.parentElement?.clientWidth ?? window.innerWidth;

    // Set the final width, limiting it by maxWidth if defined
    let finalWidth = 0;
    if (isNaN(maxWidth)) {
      finalWidth = parentWidth;
    } else {
      finalWidth = Math.min(maxWidth, parentWidth);
    }

    // Perform line breaking within the specified width
    Util.lineBreak(this.text, finalWidth, this.$el);
  }
}
