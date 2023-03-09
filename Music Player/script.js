/**
 * 1.Render song
 * 2. Scroll top
 * 3. Play / pause / seek
 * 4. CD rotate
 * 5. Next / prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,

  //list songs
  songs: [
    {
      name: "Galaxy",
      singer: "Bolbbalgan4",
      path: "./musics/music1.mp3",
      image: "./imgs/img1.png"
    },
    {
      name: "Blueming",
      singer: "IU",
      path: "./musics/music2.mp3",
      image: "./imgs/img2.png"
    },
    {
      name: "Say Yes",
      singer: "LOCO & Punch",
      path: "./musics/music3.mp3",
      image: "./imgs/img3.png"
    },
    {
      name: "Dream",
      singer: "Suzy & Baekhyun",
      path: "./musics/music4.mp3",
      image: "./imgs/img4.png"
    },
    {
      name: "Some",
      singer: "Soyou & Junggigo",
      path: "./musics/music5.mp3",
      image:
        "./imgs/img5.png"
    },
    {
      name: "Fall in love",
      singer: "Yejun Kang & Wall.T",
      path: "./musics/music6.mp3",
      image:
        "./imgs/img6.png"
    },
    {
      name: "Pretty U",
      singer: "Seventeen",
      path: "./musics/music7.mp3",
      image: "./imgs/img7.png"
    }
  ],

  //1.Render song,  8. Active song
  render: function(){
    let _currentIndex = this.currentIndex;
    const htmls = this.songs.map(function(song, index){
      return `
        <div class="song ${ index === _currentIndex ? 'active' : ''}" data-index="${index}">
            <div
              class="thumb"
              style="
                background-image: url('${song.image}');
              "
            ></div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
      `
    })
    $('.playlist').innerHTML = htmls.join();
  },

  //define properties of this object for easy to use
  defineProperties: function(){
    Object.defineProperty(this, 'currentSong',{
      get: function() {
        return this.songs[this.currentIndex];
      }
    })
  },

  //event handler function
  handleEvents: function() {
    const cdWidth = $('.cd').offsetWidth;
    const _this = this;
    let isSeeking = false;

    //4. CD rotate
    const cdThumbAnimate = $('.cd-thumb').animate([
      { transform: 'rotate(360deg)'}
    ], {
        duration: 10000,
        iterations: Infinity
    })
    cdThumbAnimate.pause();

    //2. Scroll top
    document.onscroll = function() {
      const scrollTop = document.documentElement.scrollTop
      const newWidth = cdWidth-scrollTop;
      
      //if scroll too fast => newWidth < 0 => display not good
      $('.cd').style.width = newWidth>0 ? newWidth + 'px' : 0;
      $('.cd').style.opacity = newWidth>0 ? newWidth/cdWidth : 0;
    }

    //3. Play / pause / seek
    //Click button play / pause
    $('.btn-toggle-play').onclick = function(){
      _this.isPlaying ? $('audio').pause() : $('audio').play();
    }

    //Event audio play
    $('audio').onplay = function(){
      _this.isPlaying=true;
      $('.player').classList.add('playing');
      cdThumbAnimate.play();
    }

    //Event audio pause
    $('audio').onpause = function(){
      _this.isPlaying=false;
      $('.player').classList.remove('playing');
      cdThumbAnimate.pause();
    }

    // event run time of song
    $('audio').ontimeupdate = function(){
      if ($('audio').duration && !isSeeking){
        $('#progress').value = Math.floor($('audio').currentTime / $('audio').duration*100);
      }
    }

    //Seek 
    $('#progress').onmouseup = function(e) {
      $('audio').currentTime = e.target.value / 100 * $('audio').duration;
      isSeeking=false;
    }

    $('#progress').onmousedown = function(e) {
      isSeeking=true;
    }

    //5. Next / prev
    //Click button next song
    $('.btn-next').onclick = function() {
      if (_this.isRandom){
        _this.randomSong();
      } else {
        _this.nextSong();
      }
      $('audio').play();
      _this.render();
      _this.scrollToActiveSong();
    }

    //Click button prev song
    $('.btn-prev').onclick = function() {
      if (_this.isRandom){
        _this.randomSong();
      } else {
        _this.prevSong();
      }
      $('audio').play();
      _this.render();
      _this.scrollToActiveSong();
    }

    //6. Random
    //Click to turn on/off button random song
    $('.btn-random').onclick = function(e){
      _this.isRandom = !_this.isRandom;
      $('.btn-random').classList.toggle('active',_this.isRandom);
    }

    //7. Next / Repeat when ended
    //Click to turn on/off button repeat song
    $('.btn-repeat').onclick = function(e){
      _this.isRepeat = !_this.isRepeat;
      $('.btn-repeat').classList.toggle('active',_this.isRepeat);
    }

    //Process when song ended
    $('audio').onended = function(){
      if (_this.isRandom){
        _this.randomSong();
        _this.render();
        _this.scrollToActiveSong();
      } else if (!_this.isRepeat) {
        _this.nextSong();
        _this.render();
        _this.scrollToActiveSong();
      }
      $('audio').play();
      
    }

    //10. Play song when click
    //Process when click into playlist
    $('.playlist').onclick = function(e){
      const songNode = e.target.closest('.song:not(.active');
      //check click into song or child of song or click into option
      if (songNode || e.target.closest('.option')){
        
        //check click into song
        if (songNode){
          //_this.currentIndex = parseInt(songNode.getAttribute('data-index'));
          _this.currentIndex = parseInt(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          _this.scrollToActiveSong();
          $('audio').play();
        }

        //check click into option
        if (e.target.closest('.option')) {
          console.log("open option box");
        }
        
      }
    }

  },

  //Load information of current song to UI
  loadCurrentSong: function(){
      $('header h2').textContent = this.currentSong.name;
      $('.cd-thumb').style.backgroundImage = `url('${this.currentSong.image}')`;
      $('audio').src = this.currentSong.path;
  },

  //5. Next / prev
  //go to next song
  nextSong: function(){
    this.currentIndex++;
    if (this.currentIndex>=this.songs.length){
      this.currentIndex=0;
    }
    this.loadCurrentSong();
  },

  //back to prev song
  prevSong: function(){
    this.currentIndex--;
    if (this.currentIndex<0){
      this.currentIndex=this.songs.length-1;
    }
    this.loadCurrentSong();
  },

  //6. Random
  //play random song
  randomSong: function(){
    let randomIndex = 0;
    do {
      randomIndex = Math.floor(Math.random()*this.songs.length);
    } while(randomIndex===this.currentIndex)
    this.currentIndex = randomIndex;
    this.loadCurrentSong();
  },

  //9. Scroll active song into view
  scrollToActiveSong: function(){
    if (this.currentIndex<3){
      setTimeout(() => {
        window.scrollTo({
          top: 0 + this.currentIndex*20,
          behavior: "smooth",
        });
      },250)
    } else {
      setTimeout(() => {
        $('.song.active').scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
        onscrollend = (event) => {console.log(true)};
      },250)
    }
  },

  //main function
  start: function() {
    this.defineProperties();
    this.handleEvents();
    this.loadCurrentSong();
    this.render();
    this.scrollToActiveSong();
  }
}

app.start()