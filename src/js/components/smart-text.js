import Util from '../util/util.js';
export default class SmarText {
  constructor(options) {
    this.$el = options.$el;
    this.$el.innerHTML = `<p>${this.$el.innerHTML}</p>`;
    this.$el.classList.add('keep-words');
    this.text = this.$el.innerText;
    
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
    this.resize();
  }
  destroy() {
    window.removeEventListener('resize', this.onResize);
  }
  onResize() {
    if(window.innerWidth <= 1024 && Util.isTouch()) {
      if(!this.inited) {
        this.inited = true;
        this.resize();
      }
    }else {
      this.resize();
    }
  }
  resize() {
    this.inited = true;
    if(this.$el.innerText.trim() !== '') {
      if(!this.words) {
        const childs = [];
        const words = [];
        this.$el.querySelectorAll('p, h1, h2, h3, h4, h5, h6').forEach(p => {
          childs.push(...p.childNodes);
        })
        childs.forEach(child => {
          if(child.nodeType === 3) {
            const text = child.textContent.trim();
            if(text !== '') {
              const array = text.split(' ');
              words.push(...array.map((word, i) => {
                return {type: 'SPAN', word};
              }))
            }
          }else {
            if(child.tagName === 'A') {
              const text = child.textContent.trim();
              if(text !== '') {
                words.push({type: 'A', word: text, href: child.href, target: child.target});
              }
            }else {
              const innerWords = [];
              child.childNodes.forEach(innerChild => {
                if(innerChild.nodeType === 3) {
                  const text = innerChild.textContent.trim();
                  if(text !== '') {
                    const array = text.split(' ');
                    innerWords.push(...array.map((word, i) => {
                      return {type: child.tagName, word};
                    }))
                  }
                }
              })
              if(innerWords.length > 0) {
                words.push(...innerWords);
              }
            }
          }
        });
        this.words = words;
      }
      this.$el.innerHTML = '';
      this.words.forEach((word, i) => {
        const span = document.createElement(word.type);
        span.innerText = word.word;
        span.classList.add('word');
        if(word.word.trim() === '*') {
          span.classList.add('separator');
        }
        if(word.type === 'A') {
          span.href = word.href;
          span.target = word.target;

        }
        this.$el.appendChild(span);
      })
      
      const maxW = Util.getStyleNumber(this.$el, 'maxWidth');
      const clientW = this.$el.parentElement ? this.$el.parentElement.clientWidth : window.innerWidth;
      let w = maxW;
      if (maxW > clientW && clientW > 0) {
        w = clientW;
      }
      
      const finalW = window.isNaN(w) ? clientW : w;
    
      Util.lineBreak(this.text, finalW, this.$el);
    }
  }
}