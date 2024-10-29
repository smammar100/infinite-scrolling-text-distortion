import Util from '../util/util.js';

export default class SmarText {
  constructor(options) {
    this.$el = options.$el;
    this.text = this.$el.innerText;
    this.onResize = this.onResize.bind(this);
    this.initHtml();
    window.addEventListener('resize', this.onResize);
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize() {
    if (window.innerWidth <= 1024 && Util.isTouch()) {
      this.initHtml();
    } else {
      this.resizeText();
    }
  }

  initHtml() {
    this.$el.innerHTML = `<p>${this.$el.innerHTML}</p>`;
    this.inited = true;
    this.resizeText();
  }

  resizeText() {
    this.words = this.parseWords();
    this.$el.innerHTML = '';
    this.words.forEach((word) => {
      const element = this.createWordElement(word);
      this.$el.appendChild(element);
    });
    this.applyLineBreaks();
  }

  parseWords() {
    const words = [];
    this.$el.querySelectorAll('p, h1, h2, h3, h4, h5, h6').forEach((p) => {
      p.childNodes.forEach((child) => {
        if (child.nodeType === 3) {
          const text = child.textContent.trim();
          if (text !== '') {
            words.push(...text.split(' ').map((w) => ({ type: 'SPAN', word: w })));
          }
        } else if (child.tagName === 'A') {
          const text = child.textContent.trim();
          if (text !== '') {
            words.push({ type: 'A', word: text, href: child.href, target: child.target });
          }
        } else {
          words.push(...this.parseChildWords(child));
        }
      });
    });
    return words;
  }

  parseChildWords(node) {
    const words = [];
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) {
        const text = child.textContent.trim();
        if (text !== '') {
          words.push(...text.split(' ').map((w) => ({ type: node.tagName, word: w })));
        }
      }
    });
    return words;
  }

  createWordElement(word) {
    const element = document.createElement(word.type);
    element.innerText = word.word;
    element.classList.add('word');
    if (word.word.trim() === '*') {
      element.classList.add('separator');
    }
    if (word.type === 'A') {
      element.href = word.href;
      element.target = word.target;
    }
    return element;
  }

  applyLineBreaks() {
    const maxWidth = Util.getStyleNumber(this.$el, 'maxWidth');
    const parentWidth = this.$el.parentElement?.clientWidth ?? window.innerWidth;
    let finalWidth = 0;
    if(isNaN(maxWidth)) {
      finalWidth = parentWidth;
    }else {
      finalWidth = Math.min(maxWidth, parentWidth);
    }
    Util.lineBreak(this.text, finalWidth, this.$el);
  }
}