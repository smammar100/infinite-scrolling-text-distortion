// Importing the SmartText component, likely for advanced text manipulation.
import SmartText from './smart-text.js';

export default class Column {
  constructor(options) {
    // Set up main element and configuration options.
    this.$el = options.el;
    this.reverse = options.reverse;

    // Initial scroll parameters to control smooth scrolling.
    this.scroll = {
      ease: 0.05,     // Ease factor for smooth scrolling effect.
      current: 0,     // Current scroll position.
      target: 0,      // Desired scroll position.
      last: 0         // Last recorded scroll position.
    };

    // Tracking touch states for touch-based scrolling.
    this.touch = {prev: 0, start: 0};

    // Speed control, defaulting to 0.5.
    this.speed = {t: 1, c: 1};
    this.defaultSpeed = 0.5;

    this.target = 0;  // Target position for animations.
    this.height = 0;  // Total height of content.
    this.direction = ''; // Track scrolling direction.
    
    // Select main content area and paragraphs inside it.
    this.$content = this.$el.querySelector('.column-content');
    this.$paragraphs = Array.from(this.$content.querySelectorAll('p'));

    // Bind event handlers to the current instance.
    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);
    this.wheel = this.wheel.bind(this);
    this.touchend = this.touchend.bind(this);
    this.touchmove = this.touchmove.bind(this);
    this.touchstart = this.touchstart.bind(this);
    
    // Initialize listeners and render loop.
    this.init();
  }

  init() {
    // Attach event listeners for window resize and scrolling.
    window.addEventListener('resize', this.resize);
    window.addEventListener('wheel', this.wheel);
    document.addEventListener('touchend', this.touchend);
    document.addEventListener('touchmove', this.touchmove);
    document.addEventListener('touchstart', this.touchstart);

    // Initial sizing and rendering.
    this.resize();
    this.render();
  }

  wheel(e) {
    // Handle scroll input using mouse wheel.
    let t = e.wheelDeltaY || -1 * e.deltaY;
    t *= .254;
    this.scroll.target += -t;
  }

  touchstart(e) {
    // Record initial touch position.
    this.touch.prev = this.scroll.current;
    this.touch.start = e.touches[0].clientY;
  }

  touchend(e) {
    // Reset target after touch ends.
    this.target = 0;
  }

  touchmove(e) {
    // Calculate scroll distance from touch movement.
    const x = e.touches ? e.touches[0].clientY : e.clientY;
    const distance = (this.touch.start - x) * 2;
    this.scroll.target = this.touch.prev + distance;
  }

  splitText() {
    // Split text into elements for individual animations.
    
    this.splits = [];
    const paragraphs = Array.from(this.$content.querySelectorAll('p'));
    paragraphs.forEach((item) => {
      item.classList.add('smart-text');  // Add class for styling.
      if(Math.random() > 0.7)
        item.classList.add('drop-cap'); // Randomly add drop-cap effect.
      this.splits.push(new SmartText({$el: item}));
    });
  }

  updateChilds() {
    // Dynamically add content copies if content height is smaller than window.
    const h = this.$content.scrollHeight;
    const ratio = h / this.winH;
    if(ratio < 2) {
      const copies = Math.min(Math.ceil(this.winH / h), 100);
      for(let i = 0; i < copies; i++) {
        Array.from(this.$content.children).forEach((item) => {
          const clone = item.cloneNode(true);
          this.$content.appendChild(clone);
        });
      }
    }
  }

  resize() {
    // Update dimensions on resize and reinitialize content.
    this.winW = window.innerWidth;
    this.winH = window.innerHeight;

    if(this.destroyed) return;
    this.$content.innerHTML = '';
    this.$paragraphs.forEach((item) => {
      const clone = item.cloneNode(true);
      this.$content.appendChild(clone);
    });
    this.splitText();     // Reapply text splitting.
    this.updateChilds();  // Ensure sufficient content for smooth scroll.

    // Reset scroll values and prepare for rendering.
    this.scroll.target = 0;
    this.scroll.current = 0;
    this.speed.t = 0;
    this.speed.c = 0;
    this.paused = true;
    this.updateElements(0);
    this.$el.classList.add('no-transform');
    
    // Initialize items with position and bounds.
    this.items = Array.from(this.$content.children).map((item, i) => {
      const data = { el: item };
      data.width = data.el.clientWidth;
      data.height = data.el.clientHeight;
      data.left = data.el.offsetLeft;
      data.top = data.el.offsetTop;
      data.bounds = data.el.getBoundingClientRect();
      data.y = 0;
      data.extra = 0;

      // Calculate line-by-line animation details.
      data.lines = Array.from(data.el.querySelectorAll('.line')).map((line, j) => {
        return {
          el: line,
          height: line.clientHeight,
          top: line.offsetTop,
          bounds: line.getBoundingClientRect()
        }
      });
      return data;
    });

    this.height = this.$content.scrollHeight;
    this.updateElements(0);
    this.speed.t = this.defaultSpeed;
    this.$el.classList.remove('no-transform');
    this.paused = false;
  }

  destroy() {
    // Clean up resources when destroying the instance.
    this.destroyed = true;
    this.$content.innerHTML = '';
    this.$paragraphs.forEach((item) => {
      item.classList.remove('smart-text');
      item.classList.remove('drop-cap');
    });
  }

  render(t) {
    // Main render loop using requestAnimationFrame.
    if(this.destroyed) return;
    if(!this.paused) {
      if (this.start === undefined) {
        this.start = t;
      }

      const elapsed = t - this.start;
      this.speed.c += (this.speed.t - this.speed.c) * 0.05;
      this.scroll.target += this.speed.c;
      this.scroll.current += (this.scroll.target - this.scroll.current) * this.scroll.ease;
      this.delta = this.scroll.target - this.scroll.current;

      // Determine scroll direction.
      if (this.scroll.current > this.scroll.last) {
        this.direction = 'down';
        this.speed.t = this.defaultSpeed;
      } else if (this.scroll.current < this.scroll.last) {
        this.direction = 'up';
        this.speed.t = -this.defaultSpeed;
      }
      
      // Update element positions and continue rendering.
      this.updateElements(this.scroll.current, elapsed);
      this.scroll.last = this.scroll.current;
    }
    window.requestAnimationFrame(this.render);
  }

  curve(y, t = 0) {
    // Curve effect to create non-linear animations.
    t = t * 0.0007;
    if(this.reverse) 
      return Math.cos(y * Math.PI + t) * (15 + 5 * this.delta / 100);
    return Math.sin(y * Math.PI + t) * (15 + 5 * this.delta / 100);
  }

  updateElements(scroll, t) {
    // Position and animate each item based on scroll position.
    if (this.items && this.items.length > 0) {
      const isReverse = this.reverse;
      this.items.forEach((item, j) => {
        // Track if items are out of viewport.
        item.isBefore = item.y + item.bounds.top > this.winH;
        item.isAfter = item.y + item.bounds.top + item.bounds.height < 0;

        if(!isReverse) {
          if (this.direction === 'up' && item.isBefore) {
            item.extra -= this.height;
            item.isBefore = false;
            item.isAfter = false;
          }
          if (this.direction === 'down' && item.isAfter) {
            item.extra += this.height;
            item.isBefore = false;
            item.isAfter = false;
          }
          item.y = -scroll + item.extra;
        } else {
          if (this.direction === 'down' && item.isBefore) {
            item.extra -= this.height;
            item.isBefore = false;
            item.isAfter = false;
          }
          if (this.direction === 'up' && item.isAfter) {
            item.extra += this.height;
            item.isBefore = false;
            item.isAfter = false;
          }
          item.y = scroll + item.extra;
        }

        // Animate individual lines within each item.
        item.lines.forEach((line, k) => {
          const posY = line.top + item.y;
          const progress = Math.min(Math.max(0, posY / this.winH), 1);
          const x = this.curve(progress, t);
          line.el.style.transform = `translateX(${x}px)`;
        });
        
        item.el.style.transform = `translateY(${item.y}px)`;
      });
    }
  }
}
