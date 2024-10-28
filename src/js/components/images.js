export default class Images {
  constructor(options) {
    this.$el = options.el;
    this.reverse = true;
    this.scroll = {
      ease: 0.05,
      current: 0,
      target: 0,
      last: 0
    };
    this.speed = {t: 1, c: 1};
    this.defaultSpeed = 0.2;
    this.target = 0;
    this.height = 0,
    this.direction = '';

    this.$content = this.$el.firstElementChild;
    this.init();
  }
  init() {
    window.addEventListener('resize', this.resize.bind(this));
    window.addEventListener('wheel', this.wheel.bind(this));
    this.resize();
    this.render = this.render.bind(this);
    this.render();
  }
  wheel(e) {
    let t = e.wheelDeltaY || -1 * e.deltaY;
    t *= .054;
    this.scroll.target += -t;
  }
  resize() {
    this.winW = window.innerWidth;
    this.winH = window.innerHeight;
    if(window.innerWidth <= 1024) {
      this.destroy();
    }
    if(this.winW <= 1024) return;

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
      return data
    });
    this.mask = this.$el.getBoundingClientRect();
    this.height = this.$content.scrollHeight;
    this.updateElements(0);
    this.speed.t = this.defaultSpeed;
  }
  render(t) {
    if(this.destroyed || this.paused) return;
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
    
    this.updateElements(this.scroll.current)
    this.scroll.last = this.scroll.current
    window.requestAnimationFrame(this.render)
  }
  updateElements(scroll) {
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
        media.el.style.transform = `translateY(${media.y}px)`;
      })
    }
  }
  destroy() {
    this.destroyed = true;
  }
}