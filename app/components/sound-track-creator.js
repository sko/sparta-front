import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import { alias } from '@ember/object/computed';
import { observer } from '@ember/object';
import { schedule } from '@ember/runloop';
import { A } from '@ember/array';
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
      this.set('videoId', 'haNzpiLYdEk');
      this.set('origDubTrackStartSecs', this.set('newStart', this.set('start', 49)));
      this.set('newEnd', this.set('end', 55));
      this.set('audioBuffer', null);
      this.set('initialPlayed', true);
      this.set('orig', true);
      for (let propKey of dubTrackProps)
        this.set(propKey, 0);
    } else {
      for (let propKey of videoProps.concat(dubTrackProps)) this.set(propKey, this.get('howToOrig'+propKey));
      for (let propKey of videoProps.concat(dubTrackProps)) this.set('howToOrig'+propKey, null);
    }
    if (!this.get('displayControls'))
      this.set('displayControls', true);
    this.get('player').destroy();
    this.initPlayer();
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
  sharedDubTrackUrls: [],
  videoId: null,
  origDubTrackStartSecs: -1,
  start: -1,
  end: 1,
  dubTrackDelay: 0,
  innerDubTrackDelay: 0,
  newStart: -1,
  newEnd: 1,
  newDubTrackDelay: 0,
  newInnerDubTrackDelay: 0,
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
      AudioContext = window.AudioContext||window.webkitAudioContext;
      this.set('audioContext', new AudioContext(/**/{
        latencyHint: 'interactive',
        sampleRate: 44100
      }));
    } catch (error) {
      console.log('no audio-player-support', error);
    }
    if (Modernizr.getusermedia) {
      if (this.get('skipSample')) {
        this.set('dubSpecReady', true);
        this.set('initialPlayed', true);
        this.set('displayControls', false);
        this.set('start', 0);
        this.set('end', 1);
        this.set('newStart', 0);
        this.set('newEnd', 1);
        if ($('#iframe_api').length >= 1) {
          schedule("afterRender", () => this.initPlayer());
        } else {
          schedule("afterRender", () => this.setupYoutubeAPI());
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
            else
              this.initAudioBuffer(this.set('dubTrackUrl', dubData.dub_track_url));
            this.set('dubSpecReady', true);
            schedule("afterRender", () => this.setupYoutubeAPI());
        });
      }
      // navigator.permissions.query({name:'microphone'}).then((result) => {
      if (navigator.userAgent.match(/Chrome/) && !this.get('application.isMobile')) {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            let device = devices.filter((d) => d.kind == 'audioinput' && d.getCapabilities().sampleRate && d.getCapabilities().channelCount)[0];
            let constraints = {video: false, audio: { deviceId: device.deviceId }};
            this.setupMic(constraints);
          });
      } else {
        this.setupMic({video: false, audio: true});
        // navigator.mediaDevices.enumerateDevices().then((devices) => {
        //     let device = devices.filter((d) => d.kind == 'audioinput')[0];
        //     let constraints = {video: false, audio: { deviceId: device.deviceId }};
        //     this.setupMic(constraints);
        //   });
      };
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
        return this.set('audioRecorder', new Recorder(this.get('audioContext').createMediaStreamSource(stream), recorderConfig));
      }
    }
    let gUM = Modernizr.prefixed('getUserMedia', navigator.mediaDevices);
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
      let noVideoChange = this.get('videoId') == $('#videoId').val();
      var extraDubTrackDelay;
      if (noVideoChange && (this.get('start') > this.get('origDubTrackStartSecs')))
        extraDubTrackDelay = (this.get('start') - this.get('origDubTrackStartSecs')) * 1000;
      else
        extraDubTrackDelay = 0;
      this.set('videoId', $('#videoId').val());
      let startSecsChange = parseInt($('#startSecs').val()) - this.get('start');
      this.set('start', parseInt($('#startSecs').val()));
      this.set('end', parseInt($('#endSecs').val()));
      this.set('newStart', parseInt($('#startSecs').val()));
      this.set('newEnd', parseInt($('#endSecs').val()));
      if (noVideoChange) {
        if ((newDubTrackDelay = this.get('dubTrackDelay') - startSecsChange * 1000 - extraDubTrackDelay) < 0) {
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
      this.initPlayer();
    },
    setDubTrackSecs() {
      this.set('dubTrackDelay', parseInt($('#dubTrackDelayMillis').val()));
      this.set('innerDubTrackDelay', parseInt($('#innerDubTrackDelayMillis').val()));
    },
    playVideo(orig = true) {
      this.set('orig', orig);
      if (orig)
        this.get('player').unMute();
        // this.get('player').setVolume (this.get('volume') || 100)
      // else
      //   this.get('player').mute()
        // this.get('player').setVolume 0
      // this.get('player').playVideo()
      this.get('player').loadVideoById({
        'videoId': this.get('videoId'),
        'startSeconds': this.get('start'),
        'endSeconds': this.get('end')
      });
    },
    startRecording() {
      this.set('dubTrackDelay', 0);
      this.set('innerDubTrackDelay', 0);
      this.set('newDubTrackDelay', 0);
      this.set('newInnerDubTrackDelay', 0);
      this.set('recording', true);
      this.send('playVideo', false);
    },
    stopRecording() {
      console.log('stop recording audio-track ...');
      this.set('recording', false);
      this.set('recorded', true);
      if (navigator.userAgent.match(/Chrome/)) {
        this.recordAudio.stop(() => {
            let blob = new Blob(this.recordAudio.getData()/*.buffer*/, {type: this.get('recordAudio.config.mimeType')});
            this.set('audioBlob', blob);
            if (this.get('useAudioTag'))
              this.createDownloadLink(this.set('dubTrackUrl', URL.createObjectURL(blob)));
            else
              this.initAudioBuffer(this.set('dubTrackUrl', URL.createObjectURL(blob)));
          });
          this.get('player').unMute();
      } else {
        this.get('audioRecorder').stop();
        this.get('player').unMute();
        // TODO: yt-timecode
        this.get('audioRecorder').exportWAV((blob) => {
            this.set('audioBlob', blob);
            if (this.get('useAudioTag'))
              this.createDownloadLink(this.set('dubTrackUrl', URL.createObjectURL(blob)));
            else
              this.initAudioBuffer(this.set('dubTrackUrl', URL.createObjectURL(blob)));
        }, this.get('audioRecorder.config.mimeType'));
        this.get('audioRecorder').clear();
      }
    },
    shareVideo() {
      let reader = new window.FileReader();
      reader.onloadend = () => {
          this.set('dubTrackData', reader.result);
          this.uploadDubData(null, (dubData) => {
              // dubTrackUrl = dubData.dub_track_url
              var dubIdMatch, dubTrackUrl;
              if ((dubIdMatch = location.search.match(/([?&])dubId=[^&]+/)) != null)
                dubTrackUrl = location.href.replace(/([?&]dubId=)[^&]+/, '$1'+dubData.id);
              else
                dubTrackUrl = location.href+'?dubId='+dubData.id;
              if (this.get('application.isMobile'))
                this.set('sharedDubTrackUrls', this.get('sharedDubTrackUrls').concat([{videoId: this.get('videoId'), dubTrackUrl: dubTrackUrl, whatsAppText: encodeURI('DubTrack => ' + dubTrackUrl)}]));
              else
                this.set('sharedDubTrackUrls', this.get('sharedDubTrackUrls').concat([{videoId: this.get('videoId'), dubTrackUrl: dubTrackUrl}]));
          });
      }
      reader.readAsDataURL(this.get('audioBlob'));
    },
    copyToClipboard(selector) {
      copyDatainput  = document.querySelector(selector);
      copyDatainput.select();
      document.execCommand('copy');
    },
    newDubTrack() {
      this.get('router').transitionTo('new');
    }
  },
  // audiobuffers can be started only once, so after end we setup next one for replay.
  initAudioBuffer(audioFileUrl) {
    this.set('audioBufferStarted', false);
    this.set('audioBuffer', this.connectAudioSource(audioFileUrl, (data) => {
        console.log('continue with original audio, videoStarted = '+this.get('videoStarted'));
        if (this.get('videoStarted')) {
          // this.get('audioBuffer').disconnect()
          $('#rec_ctrl').attr("disabled", true);
          this.get('player').unMute();
          // this.get('player').setVolume (this.get('volume') || 100)
          return this.initAudioBuffer(audioFileUrl);
        }
      }));
  },
  setupYoutubeAPI() {
    window.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this);
    let tag = document.createElement('script');
    tag.id = "iframe_api";
    tag.src = "//www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  },
  onYouTubeIframeAPIReady() {
    console.log('youTubeIframeAPIReady ...');
    this.initPlayer();
  },
  initPlayer() {
    this.set('player', new YT.Player('video', {
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
        html5: 1
      }
    }));
    // this.set('volume', 100 # this.get('player').getVolume()
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
    console.log('yt-player-state: '+event.data+', videoStarted = '+this.get('videoStarted')+', videoLoaded = '+this.get('player').getVideoLoadedFraction()+', recording = '+this.get('recording')+', initialPlayed = '+this.get('initialPlayed')+', orig = '+this.get('orig'));
    switch (event.data) {
      case 1:
        if(!this.get('initialPlayed')) {
          if ((this.get('orig') == null) || this.get('orig'))
            this.set('orig', false);
            // this.get('player').mute()
        }
        $('#play_orig').attr("disabled", true);
        $('#play_dub').attr("disabled", true);
        let stopAudio = this.get('stopAudioCallback');
        if (stopAudio != null && this.get('audioBufferStarted'))
          stopAudio();
        this.set('videoStarted', true);
        console.log('yt-player started playing, orig = '+this.get('orig')+' ...');
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
                this.startDubTrack(this.get('innerDubTrackDelay'));
              else
                window.setTimeout(this.startDubTrack.bind(this), this.get('dubTrackDelay'));
            }
          }
        }
        break;
      case 0:
        console.log('stopAudioCallback == null: '+(this.get('stopAudioCallback')==null)+', recording = '+this.get('recording')+', audioBufferStarted = '+this.get('audioBufferStarted'));
        if (this.get('recording') && (this.get('player').getVideoLoadedFraction() != 0))
          this.send('stopRecording');
        if(!this.get('initialPlayed'))
          this.set('initialPlayed', true);
        this.set('videoStarted', false);
        this.set('stopAudioCallback', null);
        $('#play_orig').attr("disabled", false);
        $('#play_dub').attr("disabled", false);
        $('#rec_ctrl').attr("disabled", false);
        this.set('recorded', false);
    }
  },
  startDubTrack() {
    if (this.get('innerDubTrackDelay') <= 0)
      this.get('player').mute();
    else
      window.setTimeout(this.get('player').mute.bind(this.get('player')), this.get('innerDubTrackDelay'));
    console.log('start playing audio-track; player.startSeconds = '+this.get('start')+', player.getCurrentTime = '+this.get('player').getCurrentTime());
    if (this.get('useAudioTag')) {
      $('audio')[0].currentTime = 0.2; // this.get('player').getCurrentTime() - this.get('start');
      console.log('currentTime = '+$('audio')[0].currentTime);
      $('audio')[0].play();
    } else {
      // this.get('audioBuffer').start(0, this.get('innerDubTrackDelay')/1000) # this.get('player').getCurrentTime() - this.get('start')
      this.get('audioBuffer').start(); // this.get('player').getCurrentTime() - this.get('start')
      this.set('audioBufferStarted', true);
    }
  },
  connectAudioSource(filePath, callback = null) {
    var audio1 = null;
    if (this.get('audioContext') != null) {
      console.log('setting up audio buffersource with '+filePath+', mimeType: '+((this.get('audioRecorder')||this.recordAudio).config||{}).mimeType+' ...');
      audio1 = this.get('audioContext').createBufferSource();
      let bufferLoader = new BufferLoader(
        this.get('audioContext'),
        [
          filePath
        ],
        (bufferList) => {
            this.set('stopAudioCallback', () => {
                return audio1.stop();
                // audio1.currentTime = 0;
              });
            audio1.buffer = bufferList[0];
            audio1.connect(this.get('audioContext.destination'));
            if (callback != null) {
              audio1.onended = () => {
                  return callback({msg: 'finished'});
                };
            }
          }
        );
      bufferLoader.load();
    }
    return audio1;
  },
  setupForm(challengeResponseToken = null) {
    let formData = new FormData();
    formData.append('dub_data[video_id]', this.get('videoId'));
    formData.append('dub_data[start_secs]', this.get('start'));
    formData.append('dub_data[end_secs]', this.get('end'));
    formData.append('dub_data[delay_millis]', this.get('dubTrackDelay'));
    formData.append('dub_data[inner_delay_millis]', this.get('innerDubTrackDelay'));
    formData.append('dub_data[dub_track]', this.get('dubTrackData'));
    return formData;
  },
  uploadDubData(challengeResponseToken = null, callBack = null) {
    let formData = this.setupForm();
    let url = $('#publish-url').val();
    this.startWaiting();
    this.get('backendAdapter').request(url, 'POST', formData, null, false).then((response) => {
        console.log('response.message OK = '+response.success);
        callBack(response.dub_data);
        this.stopWaiting();
      }, (error) => {
        this.stopWaiting();
        alert('error');
      });
  }
});
