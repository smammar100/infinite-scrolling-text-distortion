import SmartText from './smart-text.js';

export default class Column {
  constructor(options) {
    this.$el = options.el;
    this.reverse = options.reverse;
    this.scroll = {
      ease: 0.05,
      current: 0,
      target: 0,
      last: 0
    };
    this.touch = {prev: 0, start: 0};
    this.speed = {t: 1, c: 1};
    this.defaultSpeed = 0.5;
    this.target = 0;
    this.height = 0,
    this.direction = '';
    

    this.$content = this.$el.querySelector('.column-content');
    this.$paragraphs = Array.from(this.$content.querySelectorAll('p'));

    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);
    this.wheel = this.wheel.bind(this);
    this.touchend = this.touchend.bind(this);
    this.touchmove = this.touchmove.bind(this);
    this.touchstart = this.touchstart.bind(this);
    this.init();
  }
  init() {
    window.addEventListener('resize', this.resize);
    window.addEventListener('wheel', this.wheel);
    document.addEventListener('touchend', this.touchend);
    document.addEventListener('touchmove', this.touchmove);
    document.addEventListener('touchstart', this.touchstart);
    this.resize();
    this.render();
  }
  wheel(e) {
    let t = e.wheelDeltaY || -1 * e.deltaY;
    t *= .254;
    this.scroll.target += -t;
  }
  touchstart(e) {
    this.touch.prev = this.scroll.current;
    this.touch.start = e.touches[0].clientY;
  }
  touchend(e) {
    this.target = 0;
  }
  touchmove(e){
    const x = e.touches ? e.touches[0].clientY : e.clientY
    const distance = (this.touch.start - x) * 2
    this.scroll.target = this.touch.prev + distance
  }
  splitText() {
    if(this.splits) {
      this.splits.forEach((item) => {
        item.destroy();
      });
    }
    this.splits = [];
    const paragraphs = Array.from(this.$content.querySelectorAll('p'));
    paragraphs.forEach((item) => {
      item.classList.add('smart-text');
      if(Math.random() > 0.7)
        item.classList.add('drop-cap');
      this.splits.push(new SmartText({$el: item}));
    });
  }
  updateChilds() {
    const h = this.$content.scrollHeight;
    const ratio = h / this.winH;
    if(ratio < 2) {
      const copies = Math.min(Math.ceil((this.winH) / h), 100);
      for(let i = 0; i < copies; i++) {
        Array.from(this.$content.children).forEach((item) => {
          const clone = item.cloneNode(true);
          this.$content.appendChild(clone);
        });
      }
    }
  }
  resize() {
    this.winW = window.innerWidth;
    this.winH = window.innerHeight;

    if(this.destroyed) return;
    this.$content.innerHTML = '';
    this.$paragraphs.forEach((item) => {
      const clone = item.cloneNode(true);
      this.$content.appendChild(clone);
    });
    this.splitText();
    this.updateChilds();

    this.scroll.target = 0;
    this.scroll.current = 0;
    this.speed.t = 0;
    this.speed.c = 0;
    this.updateElements(0);
    
    this.items = Array.from(this.$content.children).map((item, i) => {
      const data = {
        el: item
      }
      data.width = data.el.clientWidth;
      data.height = data.el.clientHeight;
      data.left = data.el.offsetLeft;
      data.top = data.el.offsetTop;
      data.bounds = data.el.getBoundingClientRect();
      data.y = 0;
      data.extra = 0
      data.lines = Array.from(data.el.querySelectorAll('.line')).map((line, j) => {
        return {
          el: line,
          height: line.clientHeight,
          top: line.offsetTop,
          bounds: line.getBoundingClientRect()
        }
      });
      return data
    });
    this.height = this.$content.scrollHeight;
    this.updateElements(0);
    this.speed.t = this.defaultSpeed;
  }
  destroy() {
    this.destroyed = true;
    this.$content.innerHTML = '';
    this.$paragraphs.forEach((item) => {
      item.classList.remove('smart-text');
      item.classList.remove('drop-cap');
    });
  }
  render(t) {
    if(this.destroyed || this.paused) return;
    if (this.start === undefined) {
      this.start = t;
    }
    const elapsed = t - this.start;
    this.speed.c += (this.speed.t - this.speed.c) * 0.05
    this.scroll.target += this.speed.c
    this.scroll.current += (this.scroll.target - this.scroll.current) * this.scroll.ease
    this.delta = this.scroll.target - this.scroll.current

    if (this.scroll.current > this.scroll.last) {
      this.direction = 'down'
      this.speed.t = this.defaultSpeed
    } else if (this.scroll.current < this.scroll.last) {
      this.direction = 'up'
      this.speed.t = -this.defaultSpeed
    }
    
    this.updateElements(this.scroll.current, elapsed)
    this.scroll.last = this.scroll.current
    window.requestAnimationFrame(this.render)
  }
  curve(y, t = 0) {
    t = t * 0.0007
    if(this.reverse) 
      return Math.cos(y * Math.PI + t) * (15 + 5 * this.delta / 100)
    return Math.sin(y * Math.PI + t) * (15 + 5 * this.delta / 100)
  }
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }
  updateElements(scroll, t) {
    if (this.items && this.items.length > 0) {
      const isReverse = this.reverse
      this.items.forEach((media, j) => {
        media.isBefore = media.y + media.bounds.top > this.winH
        media.isAfter = media.y + media.bounds.top + media.bounds.height < 0
        if(!isReverse) {
          if (this.direction === 'up' && media.isBefore) {
            media.extra -= this.height
            media.isBefore = false
            media.isAfter = false
          }
          if (this.direction === 'down' && media.isAfter) {
            media.extra += this.height
            media.isBefore = false
            media.isAfter = false
          }
          media.y = -scroll + media.extra;
        }else {
          if (this.direction === 'down' && media.isBefore) {
            media.extra -= this.height
            media.isBefore = false
            media.isAfter = false
          }
          if (this.direction === 'up' && media.isAfter) {
            media.extra += this.height
            media.isBefore = false
            media.isAfter = false
          }
          media.y = scroll + media.extra;
        }
        media.lines.forEach((line, k) => {
          const posY = line.top + media.y;
          const progress = Math.min(Math.max(0, posY / this.winH), 1);
          const x = this.curve(progress, t);
          line.el.style.transform = `translateX(${x}px)`;
        });
        media.el.style.transform = `translateY(${media.y}px)`;
      })
    }
  }
}