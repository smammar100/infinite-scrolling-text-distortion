import '../../styles/index.scss';
import '../../styles/pages/index.scss';
import Column from '../components/column.js';
import Images from '../components/images.js';

export default class Index {
  constructor() {
    this.columns = [];
    window.addEventListener('resize', this.resize.bind(this));
    this.resize();
    this.initGrid();
    this.initColumns();
  }
  initColumns() {
    let $columns = document.querySelectorAll('.column');
    if(window.innerWidth <= 1024) {
      $columns = document.querySelectorAll('.column:not(:last-child)');    
    }
    this.columns = Array.from($columns).map((item, i) => {
      return new Column({el: item, reverse: i % 2 !== 0});
    });
    if(window.innerWidth > 1024) {
      new Images ({el: document.querySelector('#hero-images')});
    }
  }
  initGrid() {
    document.addEventListener('keydown', (e) => {
      if(e.shiftKey && e.key === 'G') {
        document.getElementById('grid').classList.toggle('show')
      }
    })
  }
  resize() {
    document.documentElement.style.setProperty('--rvw', `${document.documentElement.clientWidth / 100}px`);
    if(window.innerWidth <= 1024) {
      if(this.columns[1]) {
        this.columns[1].destroy();
        this.columns[1] = null;
      }
    }
  }
}
window.addEventListener('load', () => {
  new Index();
});