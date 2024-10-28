function lerp(from, to, t) {
  return (1 - t) * from + t * to;
}
function waitForLoader(cb) {
  if(document.documentElement.getAttribute('data-custom-loaded')) {
    cb();
  }else {
    window.addEventListener('customload', () => {
      cb();
    });
  }
}
function isInViewportDom($el, offset) {
  var rect = $el.getBoundingClientRect();
  var x, y, w, h;
  x = rect.left;
  y = rect.top + (offset !== undefined ? offset : 0);

  w = rect.width;
  h = rect.height;

  var ww = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  var hw = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  return ((y < hw && y + h > 0) && (x < ww && x + w > 0));
}
function lineBreak(text, max, $container, noAlone, breakLetters) {
  const keepWords = $container.closest('.keep-words') !== null;
  if(!keepWords) {
    text = $container.innerHTML;
    $container.innerHTML = text.split(/\s/).map(w => { return '<span class="word">' + w + ' </span>' }).join('');
  }else {
    Array.from($container.querySelectorAll('.word')).forEach((w, i) => {
      if(i > 0) w.innerHTML = ' ' + w.innerHTML;
    });
    Array.from($container.querySelectorAll('.word')).forEach(function (word) { 
      const text = word.innerHTML;
      if(text[0] === ' ') {
        word.classList.add('left-space');
      }
      if(text[text.length - 1] === ' ') {
        word.classList.add('right-space');
      }
    });
  }
  var len = 0;
  Array.from($container.querySelectorAll('.word')).forEach(function (w) { len += getWidth(w) });
  if (len > max) {
    const words = Array.from($container.querySelectorAll('.word')).map($w => $w.cloneNode(true));
    $container.innerHTML = '';
    var $l = document.createElement('span');
    $l.classList.add('line');
    $container.appendChild($l);
    var $currentLine = $l;
    if(keepWords) {
      words.forEach(($w, i) => {
        var w = $w.innerText;
        $w.innerHTML = i == 0 ? w : (' ' + w);

        $currentLine.appendChild($w);
        if (getWidth($currentLine) > max) {
          var $nwl = document.createElement('span');
          $nwl.classList.add('line');

          $nwl.appendChild($w);
          $currentLine = $nwl;
          $container.appendChild($nwl);
        }
      });
    }else {
      text.split(/\s/).forEach((w, i) => {
        var $w = document.createElement('span');
        $w.classList.add('word');
        $w.innerHTML = i == 0 ? w : (' ' + w);

        $currentLine.appendChild($w);
        if (getWidth($currentLine) > max) {
          $w.remove();
          var $nwl = document.createElement('span');
          $nwl.classList.add('line');

          var $w = document.createElement('span');
          $w.classList.add('word');
          $w.innerHTML = i == 0 ? w : (' ' + w);

          $nwl.appendChild($w);
          $currentLine = $nwl;
          $container.appendChild($nwl);
        }
      });
    }
    var $alone = Array.from($container.querySelectorAll('.line')).find($l => { return $l.children.length == 1 });
    if (noAlone && $alone) {
      var $last = $alone.previousElementSibling.querySelector('.word:last-child');
      var t = $last.innerHTML.replace(/^\s/, '');
      $last.remove();

      var $w = document.createElement('span');
      $w.classList.add('word');
      $w.innerHTML = t;
      $alone.prepend($w);
    }
  }else{
    if(keepWords) text = $container.innerHTML;
    $container.innerHTML = '';
    var $l = document.createElement('span');
    $l.classList.add('line');
    $container.append($l);
    $l.innerHTML = keepWords ? text : text.split(/\s/).map(w => { return `<span class="word">${w} </span>` }).join('');
  }
  Array.from($container.querySelectorAll('.word')).forEach(function (word) { 
    const text = word.innerHTML;
    if(text[0] === ' ') {
      word.classList.add('left-space');
    }
    if(text[text.length - 1] === ' ') {
      word.classList.add('right-space');
    }
  });
  Array.from($container.querySelectorAll('.line')).forEach(function (l) { 
    if(l.innerText === '' || l.innerText === ' ')
      l.remove();
    else
      l.innerHTML = '<span class="text">' + l.innerHTML + '</span>';
  });
  if(breakLetters) {
    Array.from($container.querySelectorAll('.text')).forEach(function (text) { 
      const letters = text.innerText.split('').map(letter => `<span class="letter${letter === ' ' ? ' space' : ''}">${letter}</span>`).join('')
      text.innerHTML = letters;
    });
  }
  function getWidth($el){
    if($el.classList.contains('word')){
      let wordW = $el.getBoundingClientRect().width;
      const content = $el.innerHTML;
      if(content.indexOf(' ') !== -1){
        wordW += wordW / content.length * 0.1
      }
      return wordW;
    }else{
      let w = 0;
      Array.from($el.querySelectorAll('.word')).forEach(word => {
        w += getWidth(word);
      });
      return w;
    }
  }
}
function loadImages(images, callback, max) {
  images = Array.from(images.querySelectorAll('img'));
  if(max) images = images.slice(0, max);
  let done = false;
  function loadedL() {
    return images.filter(image => image.complete).length;
  }
  if(loadedL() === images.length) {
    done = true;
    callback();
  }
  else{
    images.forEach(image => {
      image.addEventListener('load', () => {
        if(!done && loadedL() === images.length) {
          done = true;
          callback();
        }
      });
    })
  }
  setTimeout(() => {
    if(!done) {
      done = true;
      callback();
    }
  }, 10000);
}
function waitForVideos(videos, callback, max) {
  videos = Array.from(videos.querySelectorAll('video'));
  if(max) videos = videos.slice(0, max);
  let done = false;
  function loadedL() {
    return videos.filter(video => video.readyState > 0).length;
  }
  if(loadedL() === videos.length) {
    done = true;
    callback();
  }
  else{
    videos.forEach(video => {
      video.addEventListener('loadeddata', () => {
        if(!done && loadedL() === videos.length) {
          done = true;
          callback();
        }
      });
    })
  }
  setTimeout(() => {
    if(!done) {
      done = true;
      callback();
    }
  }, 10000);
}
function waitForAssets(container, callback, max) {
  let images = container.querySelectorAll('img');
  let videos = container.querySelectorAll('video');
  let done = false;
  if(images.length || videos.length) {
    loadImages(container, () => {
      if(videos.length) waitForVideos(container, callback, max);
      else {
        if(!done) {
          done = true;
          callback();
        }
      }
    }, max);
  }
  else{
    if(!done) {
      done = true;
      callback();
    }
  }
  const maxT = max ? max * 1000 : 20000;
  setTimeout(() => {
    if(!done) {
      done = true;
      callback();
    }
  }, maxT);
}
function waitForFont(fontName, cb) {
  let fonts = [];
  const isArray = Array.isArray(fontName);
  let done = false;
  if (isArray) {
    fonts.push(...fontName);
  }else {
    fonts.push(fontName);
  }
  fonts = fonts.map(font => {
    return {
      name: font,
      loaded: false
    }
  });
  const check = () => {
    const loaded = fonts.filter(font => font.loaded);
    if (loaded.length === fonts.length && !done) {
      done = true;
      if(interval) clearInterval(interval);
      cb();
    }
  }
  const interval = setInterval(() => {
    fonts.forEach(font => {
      const isReady = document.fonts.check(`1em ${font.name}`);
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) && !/SamsungBrowser/.test(navigator.userAgent);
      if(isReady && isChrome) {
        font.loaded = true;
      } else {
        if(document.fonts.size > 0) {
          document.fonts.ready.then(() => {
            font.loaded = true;
          });
        }
      }
      check();
    });
  }, 100);
}
function getStyleNumber(el, property){
  return Number(getComputedStyle(el)[property].replace('px', ''));
}
function isTouch() {
  try {
    document.createEvent('TouchEvent');
    return true;
  } catch (e) {
    return false;
  }
}
export default {
  lerp: lerp,
  isTouch: isTouch,
  getStyleNumber: getStyleNumber,
  waitForLoader: waitForLoader,
  waitForFont: waitForFont,
  isInViewportDom: isInViewportDom,
  lineBreak: lineBreak,
  loadImages: loadImages,
  waitForAssets: waitForAssets,
  waitForVideos: waitForVideos,
}