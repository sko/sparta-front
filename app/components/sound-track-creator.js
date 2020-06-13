import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import { alias } from '@ember/object/computed';
import { observer } from '@ember/object';
import { debounce, schedule } from '@ember/runloop';
// import { A } from '@ember/array';
import $ from 'jquery';
import LoadingIndicator from '../mixins/loading-indicator';

export default Component.extend(LoadingIndicator, {
  recordAudio: service(),
  backendAdapter: service(),
  application: computed(function() {
    return getOwner(this).lookup('controller:application');
  }),
  skipSample: false,
  showHowTo: false,
  howToObserver: observer('showHowTo', function(_sender, _key, _value, _rev) {
    let videoProps = ['videoId', 'start', 'newStart', 'origDubTrackStartSecs', 'end', 'newEnd', 'audioBuffer', 'initialPlayed'];
    let dubTrackProps = ['dubTrackDelay', 'newDubTrackDelay', 'innerDubTrackDelay', 'newInnerDubTrackDelay'];
    if (this.get('showHowTo')) {
      for (let propKey of videoProps.concat(dubTrackProps)) this.set('howToOrig'+propKey, this.get(propKey));
      // this.set('videoId', 'haNzpiLYdEk');
      // this.set('origDubTrackStartSecs', this.set('newStart', this.set('start', 49)));
      // this.set('newEnd', this.set('end', 55));
      // this.set('audioBuffer', null);
      // this.set('initialPlayed', true);
      // this.set('orig', true);
      this.setProperties({
        videoId: null,
        start: 0,
        newStart: 0,
        origDubTrackStartSecs: 0,
        end: 1,
        newEnd: 1,
        // videoMilliSecs: 0,
        audioBuffer: null,
        initialPlayed: true,
        orig: true
      });
      for (let propKey of dubTrackProps)
        this.set(propKey, 0);
      // this.application.transitionToRoute('new');
    } else {
      for (let propKey of videoProps.concat(dubTrackProps)) this.set(propKey, this.get('howToOrig'+propKey));
      for (let propKey of videoProps.concat(dubTrackProps)) this.set('howToOrig'+propKey, null);
    }
    if (!this.get('displayControls'))
      this.set('displayControls', true);
    // this.get('player').destroy();
    // this.initPlayer(false);
  }),
  audioContext: alias('recordAudio.audioContext'),
  dubSpecReady: false,
  displayControls: true,
  initialPlayed: false,
  useAudioTag: computed(function() {
    return false; // mobile / browser dependent
  }),
  player: null,
  playerWidth: computed(function() {
    560
  }),
  playerHeight: computed(function() {
    315
  }),
  playerReady: computed(function() {
    false
  }),
  videoMilliSecs: 0,
  videoMilliSecsPosSetCount: 0,
  videoMilliSecsPosFlag: null,
  videoMilliSecsPosFlag2: null,
  videoMilliSecsPos: computed('start', 'videoMilliSecsPosFlag', 'videoMilliSecsPosFlag2', function() {
    // console.log('videoMilliSecsPos: videoMilliSecs = ' + this.videoMilliSecs + ', videoMilliSecsPosFlag = ' + this.videoMilliSecsPosFlag);
    // // if (this.videoMilliSecsPosFlag != null) this.player.seekTo(this.start + Math.floor(this.videoMilliSecs / 1000), false);
    // if (this.videoMilliSecsPosFlag != null) this.send('playVideo', true);
    // // if (this.videoMilliSecsPosFlag != null) this.player.pauseVideo();
    return this.start * 1000 + this.videoMilliSecs;
  }),
  videoSnippetDurationMillis: 1000,
  sharedDubTrackUrls: computed(function() {
    return [];
  }),
  // videoId: null,
  videoId: computed(/**/'videoUrl', {
    get(_key) {
      return this.get('_videoId') || null;
    },
    set(_key, videoId) {
      if (videoId == null || videoId.trim() == '') {
        this.set('_videoId', null);
      } else {
        this.set('_videoId', videoId.trim());
      }
      return this.get('_videoId');
    }
  }),
  videoUrl: computed({
    get(_key) {
      return this.get('_videoUrl') || null;
    },
    set(_key, videoUrl) {
      if (videoUrl == null || videoUrl.trim() == '') {
        this.set('_videoUrl', null);
      } else {
        let videoId = (videoUrl.match(/[?&]v=([^&]+)/) || videoUrl.match(/https:\/\/[^\/]+\/([^\/]+)/))[1];
        this.setProperties({ _videoUrl: null, videoId: videoId });
        $('#videoUrl').val('');
      }
      return this.get('_videoUrl');
    }
  }),
  origDubTrackStartSecs: -1,
  start: -1,
  end: 1,
  dubTrackDelay: 0,
  innerDubTrackDelay: 0,
  newStart: -1,
  newEnd: 1,
  newDubTrackDelay: 0,
  newInnerDubTrackDelay: 0,
  cuttingDataComplete: computed('videoId', 'start', 'end', function() {
    return (this.videoId||'') != '' && this.start >= 0 && this.end > this.start;
  }),
  changeObserver: observer('start', 'newStart', 'end', 'newEnd', 'dubTrackDelay', 'newDubTrackDelay', 'innerDubTrackDelay', 'newInnerDubTrackDelay', function(_sender, _key, _value, _rev) {
    var newCuttingData = false;
    if (this.get('start') != parseInt(this.get('newStart'))) {
      $('#startSecs').css('background-color', 'red');
      newCuttingData = true;
    } else
      $('#startSecs').css('background-color', '');
    if (this.get('end') != parseInt(this.get('newEnd'))) {
      $('#endSecs').css('background-color', 'red');
      newCuttingData = true;
    } else
      $('#endSecs').css('background-color', '');
    if (newCuttingData)
      $('#setCuttingData').css('background-color', 'red');
    else
      $('#setCuttingData').css('background-color', '');

    var newDubTrackDelay = false;
    if (this.get('dubTrackDelay') != parseInt(this.get('newDubTrackDelay'))) {
      $('#dubTrackDelayMillis').css('background-color', 'red');
      newDubTrackDelay = true;
    } else
      $('#dubTrackDelayMillis').css('background-color', '');
    if (this.get('innerDubTrackDelay') != parseInt(this.get('newInnerDubTrackDelay'))) {
      $('#innerDubTrackDelayMillis').css('background-color', 'red');
      newDubTrackDelay = true;
    } else
      $('#innerDubTrackDelayMillis').css('background-color', '');
    if (newDubTrackDelay)
      $('#setDubTrackDelay').css('background-color', 'red');
    else
      $('#setDubTrackDelay').css('background-color', '');
  }),
  orig: true,
  volume: null,
  videoStarted: false,
  stopAudioCallback: null,
  init() {
    this._super(...arguments);

    this.setupAudioTracking();
  },
  setupAudioTracking() {
    this.set('application.sTC', this);
    try {
      let audioContext = window.AudioContext||window.webkitAudioContext;
      this.set('audioContext', new audioContext({
        latencyHint: 'interactive',
        sampleRate: 44100
      }));
    } catch (error) {
      console.error('no audio-player-support', error);
    }
    if (window.Modernizr.getusermedia) {
      if (this.get('skipSample')) {
        this.set('dubSpecReady', true);
        this.set('initialPlayed', true);
        this.set('displayControls', false);
        this.set('start', 0);
        this.set('end', 1);
        this.set('newStart', 0);
        this.set('newEnd', 1);
        if ($('#iframe_api').length >= 1) {
          schedule("afterRender", () => this.initPlayer(false));
        } else {
          schedule("afterRender", () => this.setupYoutubeAPI(false));
        }
      } else {
        let dubIdMatch = (location.search.match(/[?&]dubId=([^&]+)/) || [null, '-1'])
        let url = $('#dub-data-url').val().replace(/:dubId/, dubIdMatch[1])
        this.get('backendAdapter').request(url, 'GET').then((dubData) => {
            this.set('videoId', dubData.video_id);
            this.set('origDubTrackStartSecs', dubData.start_secs + dubData.delay_millis / 1000);
            this.set('start', dubData.start_secs);
            this.set('end', dubData.end_secs);
            this.set('dubTrackDelay', dubData.delay_millis);
            this.set('innerDubTrackDelay', dubData.inner_delay_millis);
            this.set('newStart', dubData.start_secs);
            this.set('newEnd', dubData.end_secs);
            this.set('newDubTrackDelay', dubData.delay_millis);
            this.set('newInnerDubTrackDelay', dubData.inner_delay_millis);
            if (this.get('useAudioTag'))
              this.createDownloadLink(dubData.dub_track_url);
            else {
              this.initAudioBuffer(this.set('dubTrackUrl', dubData.dub_track_url));
              // browser cache takes care of this
              // // donwload audioFile and store locally for faster access
              // let headers = {
              //   "Accept": "audio/*, video/*, */*; q=0.8"
              // };
              // this.get('backendAdapter').request(dubData.dub_track_url, 'GET', null, headers, false).then((dubTrackFileResponse) => {
              //   this.set('dubTrackUrl', "data:audio/"+dubTrackFileResponse[0].match(/^[^\/]+\/([^;, ]+)/)[1]+";base64,"+dubTrackFileResponse[1]);
              // }, (error) => {
              //   // console.error(JSON.stringify(error));
              //   alert(JSON.stringify(error));
              // });
            }
            this.set('dubSpecReady', true);
            schedule("afterRender", () => this.setupYoutubeAPI(true));
        });
      }
      // // navigator.permissions.query({name:'microphone'}).then((result) => {
      // if (navigator.userAgent.match(/Chrome/) && !this.get('application.isMobile')) {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            var device = devices.filter((d) => d.kind == 'audioinput' && d.getCapabilities && d.getCapabilities().sampleRate && d.getCapabilities().channelCount)[0];
            if (device == null) device = devices.filter((d) => d.kind == 'audioinput')[0];
            if (device != null) this.setupMic({video: false, audio: { deviceId: device.deviceId }});
            else this.setupMic({video: false, audio: true});
          });
      // } else {
      //   this.setupMic({video: false, audio: true});
      //   // navigator.mediaDevices.enumerateDevices().then((devices) => {
      //   //     let device = devices.filter((d) => d.kind == 'audioinput')[0];
      //   //     let constraints = {video: false, audio: { deviceId: device.deviceId }};
      //   //     this.setupMic(constraints);
      //   //   });
      // };
    }
  },
  setupMic(constraints) {
    let setupMedia = (stream) => {
      let recorderConfig = {
        mimeType: navigator.userAgent.match(/Chrome/) ? 'audio/webm' : 'audio/wav', // webm | wav | ogg
        bufferLen: 4096, // 4096 | 8192
        numChannels: 1// 1 | 2
      }
      if (navigator.userAgent.match(/Chrome/)) {
        return this.recordAudio.setupMediaRecorder(stream, recorderConfig);
        // return this.recordAudio.newTrack(stream, recorderConfig);
      } else {
        return this.set('audioRecorder', new window.Recorder(this.get('audioContext').createMediaStreamSource(stream), recorderConfig));
      }
    }
    let gUM = window.Modernizr.prefixed('getUserMedia', navigator.mediaDevices);
    gUM(constraints).then(setupMedia).
    catch((e) => {
      console.error('Reeeejected!', e)
      // alert('Reeeejected!')
    });
  },
  actions: {
    setVideoId() {
      if (parseInt($('#startSecs').val()) >= parseInt($('#endSecs').val()))
        $('#endSecs').val((parseInt($('#startSecs').val()) + this.get('end') - this.get('start')));
      if (!this.get('displayControls'))
        this.set('displayControls', true);
      if ([null,""].indexOf($('#videoUrl').val()) == -1) this.set('videoUrl', $('#videoUrl').val());
      let noVideoChange = this.get('videoId') == $('#videoId').val();
      var extraDubTrackDelay;
      if (noVideoChange && (this.get('start') > this.get('origDubTrackStartSecs')))
        extraDubTrackDelay = (this.get('start') - this.get('origDubTrackStartSecs')) * 1000;
      else
        extraDubTrackDelay = 0;
      if ($('#videoId').val() != '') this.set('videoId', $('#videoId').val());
      let startSecsChange = parseInt($('#startSecs').val()) - this.get('start');
      this.set('start', parseInt($('#startSecs').val()));
      this.set('end', parseInt($('#endSecs').val()));
      this.set('newStart', parseInt($('#startSecs').val()));
      this.set('newEnd', parseInt($('#endSecs').val()));
      if (noVideoChange) {
        let newDubTrackDelay = this.get('dubTrackDelay') - startSecsChange * 1000 - extraDubTrackDelay;
        if (newDubTrackDelay < 0) {
          this.set('dubTrackDelay', 0);
          this.set('newDubTrackDelay', 0);
        } else {
          this.set('dubTrackDelay', newDubTrackDelay);
          this.set('newDubTrackDelay', newDubTrackDelay);
        }
      } else {
        this.set('dubTrackDelay', 0);
        this.set('innerDubTrackDelay', 0);
        this.set('newDubTrackDelay', 0);
        this.set('newInnerDubTrackDelay', 0);
      }
      this.get('player').destroy();
      this.initPlayer(false);
    },
    setDubTrackSecs() {
      this.set('dubTrackDelay', parseInt($('#dubTrackDelayMillis').val()));
      this.set('innerDubTrackDelay', parseInt($('#innerDubTrackDelayMillis').val()));
    },
    playVideo(orig = true) {
      this.set('orig', orig);
      // if (orig) {
      if (true || orig) {
        this.get('player').unMute();
        // this.get('player').setVolume (this.get('volume') || 100)
      } // else {
        // this.get('player').mute()
        // // this.get('player').setVolume 0
      // }

      // this.get('player').playVideo()
      this.get('player').loadVideoById({
        'videoId': this.get('videoId'),
        // 'startSeconds': this.get('start') + (this.videoMilliSecsPosFlag == null ? 0 : this.videoMilliSecs / 1000),
        'startSeconds': this.get('start') + ((this.videoMilliSecsPosFlag == null && this.videoSnippetStartMillis  == null) ? 0 : (this.videoSnippetStartMillis != null ? this.videoSnippetStartMillis : this.videoMilliSecs) / 1000),
        // 'endSeconds': this.videoMilliSecsPosFlag == null ? this.get('end') : this.get('start') + this.videoMilliSecs / 1000 + Math.min(this.videoSnippetDurationMillis / 1000, this.end - this.start)
        'endSeconds': (this.videoMilliSecsPosFlag == null && this.videoSnippetStartMillis == null) ? this.get('end') : this.get('start') + (this.videoSnippetStartMillis != null ? this.videoSnippetStartMillis : this.videoMilliSecs) / 1000 + Math.min(this.videoSnippetDurationMillis / 1000, this.end - this.start)
      });
      if (this.videoMilliSecsPosFlag != null) {
        this.setProperties({ videoMilliSecsPosFlag: null/*, orig: true videoSnippetStartMillis: null*/, });
      }/* else {
        this.setProperties({ videoSnippetStartMillis: this.videoMilliSecs});
      }*/
    },
    startRecording() {
      // this.set('dubTrackDelay', 0);
      // this.set('innerDubTrackDelay', 0);
      // this.set('newDubTrackDelay', 0);
      // this.set('newInnerDubTrackDelay', 0);
      // this.set('recording', true);
      this.setProperties({
        dubTrackDelay: 0,
        innerDubTrackDelay: 0,
        newDubTrackDelay: 0,
        newInnerDubTrackDelay: 0,
        recording: true
      });
      this.send('playVideo', false);
    },
    stopRecording() {
      console.log('stop recording audio-track ...');
      // this.set('recording', false);
      // this.set('recorded', true);
      this.setProperties({
        recording: false,
        recorded: true
      });
      // TODO: yt-timecode
      const exportWAV = (blob) => {
        this.set('audioBlob', blob);
        if (this.get('useAudioTag'))
          this.createDownloadLink(this.set('dubTrackUrl', URL.createObjectURL(blob)));
        else
          this.initAudioBuffer(this.set('dubTrackUrl', URL.createObjectURL(blob)));
      }
      if (navigator.userAgent.match(/Chrome/)) {
        this.recordAudio.stop(() => {
            let blob = new Blob(this.recordAudio.getData()/*.buffer*/, { type: this.get('recordAudio.config.mimeType') });
            // this.set('audioBlob', blob);
            // if (this.get('useAudioTag'))
            //   this.createDownloadLink(this.set('dubTrackUrl', URL.createObjectURL(blob)));
            // else
            //   this.initAudioBuffer(this.set('dubTrackUrl', URL.createObjectURL(blob)));
            exportWAV(blob);
          });
        this.get('player').unMute();
      } else {
        this.get('audioRecorder').stop();
        this.get('player').unMute();
        this.get('audioRecorder').exportWAV(/*(blob) => {
            this.set('audioBlob', blob);
            if (this.get('useAudioTag'))
              this.createDownloadLink(this.set('dubTrackUrl', URL.createObjectURL(blob)));
            else
              this.initAudioBuffer(this.set('dubTrackUrl', URL.createObjectURL(blob)));
        }*/exportWAV, this.get('audioRecorder.config.mimeType'));
        this.get('audioRecorder').clear();
      }
    },
    shareVideo() {
      let reader = new window.FileReader();
      reader.onloadend = () => {
          this.set('dubTrackData', reader.result);
          this.uploadDubData(null, (dubData) => {
              // dubTrackUrl = dubData.dub_track_url
              var dubTrackUrl;
              if (location.search.match(/([?&])dubId=[^&]+/) != null)
                dubTrackUrl = location.href.replace(/([?&]dubId=)[^&]+/, '$1'+dubData.id);
              else
                dubTrackUrl = location.href.replace(/\/new/, '/')+'?dubId='+dubData.id;
              if (this.get('application.isMobile'))
                this.set('sharedDubTrackUrls', this.get('sharedDubTrackUrls').concat([{videoId: this.get('videoId'), dubTrackUrl: dubTrackUrl, whatsAppText: encodeURI('DubTrack => ' + dubTrackUrl)}]));
              else
                this.set('sharedDubTrackUrls', this.get('sharedDubTrackUrls').concat([{videoId: this.get('videoId'), dubTrackUrl: dubTrackUrl}]));
          });
      }
      reader.readAsDataURL(this.get('audioBlob'));
    },
    copyToClipboard(selector) {
      let copyDatainput = document.querySelector(selector);
      copyDatainput.select();
      document.execCommand('copy');
    },
    newDubTrack() {
      this.get('router').transitionTo('new');
    },
    setVideoMilliSecs(value) {
      // let secs = Math.floor((this.get('player').getCurrentTime() - this.start) + value / 100 * (this.end - this.start)); // / 1000;
      let milliSecs = parseInt(value);
      // this.set('videoMilliSecs', milliSecs - this.start * 1000);
      let videoMilliSecs = milliSecs - this.start * 1000;
      this.setProperties({ videoMilliSecs: videoMilliSecs, videoSnippetStartMillis: videoMilliSecs != 0 ? videoMilliSecs : null });
      if (videoMilliSecs == 0) {
        console.log('setVideoMilliSecs: removing video snippet ...');
        this.setProperties({ videoMilliSecsPosSetCount: 0, videoMilliSecsPosFlag: null });
        return;
      }
      // $('.select_video_position').val(Math.floor(secs / 10));
      console.log('setVideoMilliSecs: videoMilliSecsPosSetCount = ' + this.videoMilliSecsPosSetCount + ', milliSecs = ' + milliSecs + ', videoMilliSecs = ' + this.videoMilliSecs);
      if ((this.videoMilliSecsPosSetCount + 1) % 3 == 0) {
        this.setProperties({ videoMilliSecsPosSetCount: 0/*, videoMilliSecsPosFlag: new Date()*/ });
      } else {
        this.set('videoMilliSecsPosSetCount', this.videoMilliSecsPosSetCount + 1);
        // debounce(this, () => this.set('videoMilliSecsPosFlag', new Date()), 250);
        debounce(this, () => this.set('videoMilliSecsPosFlag', this.videoSnippetStartMillis != null ? new Date() : null), 250);
      }
      // this.player.seekTo(Math.floor(milliSecs / 1000), false);
      // this.player.pauseVideo();
    }
  },
  // audiobuffers can be started only once, so after end we setup next one for replay.
  initAudioBuffer(audioFileUrl) {
    this.set('audioBufferStarted', false);
    this.set('audioBuffer', this.connectAudioSource(audioFileUrl, (data) => {
        console.log('continue with original audio, videoStarted = '+this.get('videoStarted') + ', data = ' + JSON.stringify(data));
        // if (this.get('videoStarted')) {
          // // this.get('audioBuffer').disconnect()
          // this.set('videoSnippetStartMillis', null);
          $('#rec_ctrl').attr("disabled", true);
          this.get('player').unMute();
          // // this.get('player').setVolume (this.get('volume') || 100)
          return this.initAudioBuffer(audioFileUrl);
        // }
      }));
  },
  setupYoutubeAPI(autoplay) {
    // window.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this);
    window.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady(autoplay).bind(this);
    let tag = document.createElement('script');
    tag.id = "iframe_api";
    tag.src = "//www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  },
  onYouTubeIframeAPIReady(autoplay) {
    return () => {
      console.log('youTubeIframeAPIReady ...');
      this.initPlayer(autoplay);
    };
  },
  initPlayer(autoplay) {
    this.set('player', new window.YT.Player('video', {
      width: this.get('playerWidth'),
      height: this.get('playerHeight'),
      videoId: this.get('videoId'),
      events: {
        'onReady': this.onYouTubePlayerReady.bind(this),
        'onStateChange': this.onYouTubePlayerStateChange.bind(this),
      },
      playerVars: {
        start: this.get('start'),
        end: this.get('end'),
        showinfo: 0,
        controls: 0,
        version: 3,
        enablejsapi: 1,
        html5: 1,
        autoplay: autoplay ? 1 : 0
      }
    }));
    // this.set('volume', 100); // this.get('player').getVolume()
  },
  onYouTubePlayerReady() {
    console.log('youTubePlayerReady ...');
    this.set('playerReady', true);
    // if this.get('dubSpecReady') && (!this.get('initialPlayed'))
    //   this.send 'playVideo', false
    if (this.get('showHowTo') && (this.get('audioBuffer') == null))
      this.send('playVideo', true);
  },
  onYouTubePlayerStateChange(event) {
    console.log('yt-player-state: '+event.data+', videoStarted = '+this.get('videoStarted')+', playerState = '+this.player.getPlayerState()+', videoLoaded = '+this.get('player').getVideoLoadedFraction()+', recording = '+this.get('recording')+', initialPlayed = '+this.get('initialPlayed')+', orig = '+this.get('orig'));
    switch (event.data) {
      // {UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5}
      case window.YT.PlayerState.PLAYING:
        if(!this.get('initialPlayed')) {
          if ((this.get('orig') == null) || this.get('orig'))
            this.set('orig', false);
            // this.get('player').mute()
        }
        $('#play_orig').attr("disabled", true);
        $('#play_dub').attr("disabled", true);
        var stopAudio = this.get('stopAudioCallback');
        if (stopAudio != null && this.get('audioBufferStarted'))
          stopAudio();
        this.set('videoStarted', true);
        console.log('yt-player started playing, orig = '+this.get('orig')+' ...');
        window.setTimeout(this.displayVideoMillisCallback('100'), '100');
        if(!this.get('orig')) {
          if (this.get('player').getVideoLoadedFraction() != 0) {
            if (this.get('recording')) {
              this.get('player').mute();
              console.log('start recording audio-track ...');
              if (navigator.userAgent.match(/Chrome/)) {
                this.recordAudio.record();
                // this.recordAudio.start();
              } else {
                this.get('audioRecorder').record(300);
              }
            } else {
              if (this.get('dubTrackDelay') <= 0)
                this._startDubTrack(this.get('innerDubTrackDelay'));
              else {
                if (this.videoSnippetStartMillis == null) window.setTimeout(this._startDubTrack.bind(this), this.get('dubTrackDelay'));
                else this._startDubTrack(this.get('innerDubTrackDelay'));
              }
            }
          }
        }
        break;
      case window.YT.PlayerState.ENDED:
        console.log('stopAudioCallback == null: '+(this.get('stopAudioCallback')==null)+', recording = '+this.get('recording')+', audioBufferStarted = '+this.get('audioBufferStarted'));
        // this.audioContext.suspend();
        if (this.get('recording') && (this.get('player').getVideoLoadedFraction() != 0))
          this.send('stopRecording');
        // if (this.get('player').getVideoLoadedFraction() == 1) {
        if(!this.get('initialPlayed'))
          this.set('initialPlayed', true);
        if (this.get('videoStarted')) {
          // this.set('videoMilliSecs', 0);
          if (this.videoSnippetStartMillis == null) this.set('videoMilliSecs', 0);
          else this.set('videoMilliSecs', this.videoSnippetStartMillis);
          // this.set('videoSnippetStartMillis', null);
        }
        this.set('videoStarted', false);
        this.set('stopAudioCallback', null);
        $('#play_orig').attr("disabled", false);
        $('#play_dub').attr("disabled", false);
        $('#rec_ctrl').attr("disabled", false);
        this.set('recorded', false);
        // }
    }
  },
  displayVideoMillisCallback(timeoutMillis) {
    return () => {
      if (this.player.getPlayerState() != 0) {
        let centiSecs = Math.floor((this.get('player').getCurrentTime() - this.start) * 1000); // / 1000;
        if (centiSecs >= 0) {
          // console.log('displayVideoMillisCallback: centiSecs = ' + centiSecs + ', player.currentTime = ' + this.get('player').getCurrentTime());
          this.set('videoMilliSecs', centiSecs);
        }
        if (this.get('player').getCurrentTime() <= this.end/* && this.player.getPlayerState() != 0*/) {
          debounce(this, () => this.set('videoMilliSecsPosFlag2', new Date()), parseInt(timeoutMillis) + 100);
          window.setTimeout(this.displayVideoMillisCallback(timeoutMillis), timeoutMillis);
        }
      }
    };
  },
  _startDubTrack() {
    if (this.videoSnippetStartMillis != null && (this.videoSnippetStartMillis + this.videoSnippetDurationMillis - this.get('dubTrackDelay')) <= this.get('innerDubTrackDelay')) {
      console.log('not playing dub-track if snippet will end befor dub-track ...');
      return;
    }
    // if (this.get('innerDubTrackDelay') <= 0)
    if (this.get('innerDubTrackDelay') <= 0 || this.videoSnippetStartMillis != null)
      this.get('player').mute();
    else
      // window.setTimeout(this.get('player').mute.bind(this.get('player')), this.get('innerDubTrackDelay'));
      window.setTimeout(() => this.get('player').mute(), this.get('innerDubTrackDelay'));
    console.log('start playing audio-track; player.startSeconds = '+this.get('start')+', player.getCurrentTime = '+this.get('player').getCurrentTime() + ', audioContext.state = ' + this.audioContext.state + ', audioContext.currentTime = ' + this.audioContext.currentTime + ', dubTrackDelay = ' + this.get('dubTrackDelay') + ', videoMilliSecs = ' + this.videoMilliSecs + ', videoMilliSecsPos = ' + this.videoMilliSecsPos + ', videoSnippetStartMillis = ' + this.videoSnippetStartMillis);
    if (this.get('useAudioTag')) {
      $('audio')[0].currentTime = 0.2; // this.get('player').getCurrentTime() - this.get('start');
      console.log('currentTime = '+$('audio')[0].currentTime);
      $('audio')[0].play();
    } else {
      // if (this.get('audioBuffer') != null) {
      try {
        // if (this.audioContext.state == 'suspended') this.audioContext.resume();
        // this.get('audioBuffer').start(this.audioBuffer.context.currentTime + this.get('dubTrackDelay') / 1000, this.videoMilliSecs / 1000);
        // this.get('audioBuffer').start(this.audioBuffer.context.currentTime + this.get('dubTrackDelay') / 1000, Math.floor((this.videoMilliSecsPos-this.start*1000) / 1000));
        // this.get('audioBuffer').start(this.audioBuffer.context.currentTime + this.videoMilliSecs / 1000, this.get('dubTrackDelay') / 1000);
        if (this.videoSnippetStartMillis != null) {
          this.get('audioBuffer').start(0, (this.videoSnippetStartMillis - this.get('dubTrackDelay')) / 1000);
          // this.set('videoSnippetStartMillis', null);
        } else {
          this.get('audioBuffer').start();
        }
        // window.setTimeout(() => {
        //   this.get('audioBuffer').start(0, this.videoMilliSecs / 1000);
        //   this.set('audioBufferStarted', true);
        // }, this.get('dubTrackDelay'));
        // this.get('audioBuffer').start(this.audioBuffer.context.currentTime + this.get('dubTrackDelay') / 1000, Math.floor((this.get('dubTrackDelay') - this.videoMilliSecs) / 1000));
        // this.get('audioBuffer').start(); // this.get('player').getCurrentTime() - this.get('start')
        // this.set('audioBufferStarted', true);
      } catch (error) {
        console.error('error starting audio-recorder: ', error);
        this.set('audioBuffer', null);
        this.initAudioBuffer(this.get('dubTrackUrl'));
      }
      // }
    }
  },
  connectAudioSource(filePath, callback = null) {
    var audio1 = null;
    if (this.get('audioContext') != null) {
      console.log('setting up audio buffersource with '+filePath+', mimeType: '+((this.get('audioRecorder')||this.recordAudio).config||{}).mimeType+' ...');
      audio1 = this.get('audioContext').createBufferSource();
      let bufferLoader = new window.BufferLoader(
        this.get('audioContext'),
        [
          filePath
        ],
        (bufferList) => {
            this.set('stopAudioCallback', () => {
                console.log('connectAudioSource: stopAudioCallback > stopping audio ...');
                return audio1.stop();
                // audio1.currentTime = 0;
              });
            audio1.buffer = bufferList[0];
            audio1.connect(this.get('audioContext.destination'));
            if (callback != null) {
              audio1.onended = () => {
                  console.log('connectAudioSource: onended ...');
                  return callback({msg: 'finished'});
                };
            }
          }
        );
      bufferLoader.load();
    }
    return audio1;
  },
  setupForm() {
    let formData = new FormData();
    formData.append('dub_data[video_id]', this.get('videoId'));
    formData.append('dub_data[start_secs]', this.get('start'));
    formData.append('dub_data[end_secs]', this.get('end'));
    formData.append('dub_data[delay_millis]', this.get('dubTrackDelay'));
    formData.append('dub_data[inner_delay_millis]', this.get('innerDubTrackDelay'));
    formData.append('dub_data[dub_track]', this.get('dubTrackData'));
    return formData;
  },
  uploadDubData(challengeResponseToken, callBack) {
    // if (typeof(challengeResponseToken) == 'undefined') challengeResponseToken = null;

    let formData = this.setupForm();
    let url = $('#publish-url').val();
    this.startWaiting();
    this.get('backendAdapter').request(url, 'POST', formData, null, false).then((response) => {
        console.log('response.message OK = '+response.success);
        callBack(response.dub_data);
        this.stopWaiting();
      }, (_error) => {
        this.stopWaiting();
        alert('error');
      });
  }
});
