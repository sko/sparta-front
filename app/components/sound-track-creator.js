import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import { alias } from '@ember/object/computed';
import { observer } from '@ember/object';
import { debounce, schedule } from '@ember/runloop';
import $ from 'jquery';
import LoadingIndicator from '../mixins/loading-indicator';

export default Component.extend(LoadingIndicator, {
  recordAudio: service(),
  backendAdapter: service(),
  application: computed(function() {
    return getOwner(this).lookup('controller:application');
  }),
  hideTitleSecs: null,//2, // null will use youtube-default (display title for 3 seconds)
  skipSample: false,
  autoplay: true,
  featurePresentation: false,
  videoCountdownSecs: null,
  initialPlayedWithHiddenTitle: null,
  showHowTo: false,
  currentHowToStep: 1,
  enableInnerDubDelay: false,
  howToObserver: observer('showHowTo', function(_sender, _key, _value, _rev) {
    let videoProps = ['videoId', 'start', 'newStart', 'origDubTrackStartSecs', 'end', 'newEnd', 'videoMilliSecs', 'videoSnippetStartMillis', 'audioBuffer', 'initialPlayed'];
    let dubTrackProps = ['dubTrackDelay', 'newDubTrackDelay', 'innerDubTrackDelay', 'newInnerDubTrackDelay'];
    if (this.get('showHowTo')) {
      for (let propKey of videoProps.concat(dubTrackProps)) this.set('howToOrig'+propKey, this.get(propKey));
      this.setProperties(this.savedHowToProps || {
        videoId: null,
        start: 0,
        newStart: 0,
        origDubTrackStartSecs: 0,
        end: 1,
        newEnd: 1,
        videoMilliSecs: 0,
        videoSnippetStartMillis: null,
        audioBuffer: null,
        initialPlayed: true,
        orig: true
      });
      for (let propKey of dubTrackProps)
        this.set(propKey, 0);
      this.renderRecordedRange(this.start, 0);
    } else {
      this.set('savedHowToProps', {
        videoId: this.videoId,
        start: this.start,
        newStart: this.newStart,
        origDubTrackStartSecs: this.origDubTrackStartSecs,
        end: this.end,
        newEnd: this.newEnd,
        videoMilliSecs: this.videoMilliSecs,
        videoSnippetStartMillis: this.videoSnippetStartMillis,
        audioBuffer: this.audioBuffer,
        initialPlayed: this.initialPlayed,
        orig: this.orig
      });
      for (let propKey of videoProps.concat(dubTrackProps)) this.set(propKey, this.get('howToOrig'+propKey));
      for (let propKey of videoProps.concat(dubTrackProps)) this.set('howToOrig'+propKey, null);
      if (this.audioBuffer) this.renderRecordedRange(this.start + this.dubTrackDelay / 1000);
    }
    if (!this.get('displayControls'))
      this.set('displayControls', true);
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
  playerReady: computed({
    get(_key) {
      return this.get('_playerReady') || false;
    },
    set(_key, playerReady) {
      return this.set('_playerReady', playerReady);
    }
  }),
  videoMilliSecs: 0, // shows current timecode in video after scene start (0)
  videoMilliSecsPosFlag: null,
  videoMilliSecsPosFlag2: null,
  // slider-value starts with video-start-secs as millis
  videoMilliSecsPos: computed('start', 'videoMilliSecsPosFlag', 'videoMilliSecsPosFlag2', function() {
    let debugMsg = 'videoMilliSecsPos: videoMilliSecs = ' + this.videoMilliSecs + ', start = ' + this.start + ', seekTo = ' + (this.start + Math.floor(this.videoMilliSecs / 1000)) + ', videoMilliSecsPosFlag = ' + (this.videoMilliSecsPosFlag != null ? this.videoMilliSecsPosFlag.getTime() : null) + ', videoMilliSecsPosFlag2 = ' + (this.videoMilliSecsPosFlag2 != null ? this.videoMilliSecsPosFlag2.getTime() : null) + ', newDubTrackDelayFlag = ' + (this.newDubTrackDelayFlag != null ? this.newDubTrackDelayFlag.getTime() : null);
    if (this.get('videoMilliSecsPosSeekTo')) debugMsg += ', [SeekTo]';
    if (this.get('pauseVideoAfterSeekTo')) debugMsg += ', [SeekTo2]';
    if (this.get('videoMilliSecsPosSeekTo3')) debugMsg += ', [SeekTo3]';
    if (this.get('videoMilliSecsPosSeekTo4')) debugMsg += ', [SeekTo4]';
    if (/*true || */this.videoMilliSecsPosFlag) console.log(debugMsg);

    // seekTo doesn't work - only works with hole secs. our solution: play and pause via videoMilliSecsPosFlag
    // if (this.videoMilliSecsPosFlag != null) this.player.seekTo(this.start + Math.floor(this.videoMilliSecs / 1000), false);
    if (this.videoMilliSecsPosFlag != null) {
      // this.set('disableControls', true);
      this.set('videoMilliSecsPosSeekTo', true);
      if (this.newDubTrackDelayFlag == null) {
        this.get('player').mute();
        if (this.videoStarted && this.videoPaused) this.setProperties({ setMarkerAfterPaused: true, /*videoStarted: false , videoPaused: false, */videoMilliSecsPosSeekTo3: false });
        this.send('playVideo', true, true);
      } else {
        this.set('newDubTrackDelayFlag', null);
        this.send('playVideo', false);
      }
    }

    return this.start * 1000 + this.videoMilliSecs;
  }),
  videoMilliSecsPosSeekTo3: false, // when start from timecode 0 (no snippet)
  videoSnippetStartMillis: null, // not null when timecode is changed by user to a value > 0
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
  startFmtd: computed('start', function() {
    return moment('1970-01-01 00:00:00').add(moment.duration(this.start == -1 ? 0 : this.start, 'seconds')).format( 'HH:mm:ss.SS').replace(/00:/g, '').replace(/\.[0]+$/, '');
  }),
  endFmtd: computed('end', function() {
    return moment('1970-01-01 00:00:00').add(moment.duration(this.end, 'seconds')).format( 'HH:mm:ss.SS').replace(/00:/g, '').replace(/\.[0]+$/, '');
  }),
  dubTrackDelay: 0,
  innerDubTrackDelay: 0,
  newStart: -1,
  newEnd: 1,
  newStartFmtd: computed('start', {
    get(_key) {
      return moment('1970-01-01 00:00:00').add(moment.duration(this.newStart == -1 ? 0 : this.newStart, 'seconds')).format( 'HH:mm:ss.SS').replace(/00:/g, '').replace(/\.[0]+$/, '');
    },
    set(_key, newStartFmtd) {
      let validMatch = ('00:00:' + newStartFmtd.replace(/^([0-9])$/, '0$1')).match(/[0-9]{2}:[0-9]{2}:[0-9]{2}(|\.[0-9]+)$/);
      if (validMatch == null) return newStartFmtd;

      this.set('newStart', moment.duration(validMatch[0]).asSeconds());
      return newStartFmtd.replace(/00:/g, '');
    }
  }),
  newEndFmtd: computed('end', {
    get(_key) {
      return moment('1970-01-01 00:00:00').add(moment.duration(this.newEnd, 'seconds')).format( 'HH:mm:ss.SS').replace(/00:/g, '').replace(/\.[0]+$/, '');
    },
    set(_key, newEndFmtd) {
      let validMatch = ('00:00:' + newEndFmtd.replace(/^([0-9])$/, '0$1')).match(/[0-9]{2}:[0-9]{2}:[0-9]{2}(|\.[0-9]+)$/);
      if (validMatch == null) return newEndFmtd;

      this.set('newEnd', moment.duration(validMatch[0]).asSeconds());
      return newEndFmtd.replace(/00:/g, '');
    }
  }),
  newDubTrackDelay: 0,
  newInnerDubTrackDelay: 0,
  cuttingDataComplete: computed('videoId', 'start', 'end', function() {
    return (this.videoId||'') != '' && this.start >= 0 && this.end > this.start;
  }),
  changeObserver: observer('start', 'newStart', 'end', 'newEnd', 'dubTrackDelay', 'newDubTrackDelay', 'innerDubTrackDelay', 'newInnerDubTrackDelay', function(_sender, _key, _value, _rev) {
    // let newStartSecs = moment.duration(('00:00:' + this.newStartFmtd).match(/[0-9]{2}:[0-9]{2}:[0-9]{2}$/)[0]).asSeconds();
    var newCuttingData = false;
    if (this.get('start') != this.get('newStart')) {
      $('#startSecs').css('background-color', 'red');
      newCuttingData = true;
    } else
      $('#startSecs').css('background-color', '');
    if (this.get('end') != this.get('newEnd')) {
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
        latencyHint: 'interactive'/*,
        sampleRate: 44100*/
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
            this.set('videoTitle', dubData.video_title);
            this.set('origDubTrackStartSecs', dubData.start_secs / 100 + dubData.delay_millis / 1000);
            this.set('start', dubData.start_secs / 100);
            this.set('end', dubData.end_secs / 100);
            this.set('dubTrackDelay', dubData.delay_millis);
            this.set('innerDubTrackDelay', dubData.inner_delay_millis);
            this.set('newStart', dubData.start_secs / 100);
            this.set('newEnd', dubData.end_secs / 100);
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
            // for (let audioinput of devices.filter((d) => d.kind == 'audioinput')) console.log(JSON.stringify(audioinput));

            var device = devices.filter((d) => d.kind == 'audioinput' && d.getCapabilities && d.getCapabilities().sampleRate && d.getCapabilities().channelCount)[0];
            if (device == null) device = devices.filter((d) => d.kind == 'audioinput' && (!d.label || d.label.match(/Monitor/) == null))[0];
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
      // if (parseInt($('#startSecs').val()) >= parseInt($('#endSecs').val()))
      //   $('#endSecs').val((parseInt($('#startSecs').val()) + this.get('end') - this.get('start')));
      if (this.newStart >= this.newEnd)
        this.set('newEnd', this.newStart + this.get('end') - this.get('start'));
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
      // let startSecsChange = parseInt($('#startSecs').val()) - this.get('start');
      // this.set('start', parseInt($('#startSecs').val()));
      // this.set('end', parseInt($('#endSecs').val()));
      // this.set('newStart', parseInt($('#startSecs').val()));
      // this.set('newEnd', parseInt($('#endSecs').val()));
      let startSecsChange = this.newStart - this.get('start');
      // this.set('start', this.newStart);
      this.set('start', this.videoSnippetStartMillis == null ? this.newStart : this.newStart + this.videoSnippetStartMillis / 1000);
      this.set('end', this.newEnd);
      // this.set('newStart', parseInt($('#startSecs').val()));
      // this.set('newEnd', parseInt($('#endSecs').val()));
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
    setDubTrackSecs(newDubTrackDelay = null) {
      this.set('dubTrackDelay', newDubTrackDelay || parseInt($('#dubTrackDelayMillis').val()));
      // this.send('playVideo', true);
      this.set('newDubTrackDelayFlag', new Date());
      this.send('setVideoMilliSecs', this.start * 1000 + this.dubTrackDelay);
      this.renderRecordedRange(this.start + this.dubTrackDelay / 1000);
      if (this.enableInnerDubDelay) this.set('innerDubTrackDelay', parseInt($('#innerDubTrackDelayMillis').val()));
    },
    playVideo(orig = true, skipUnMute = false, justSeekTo = false) {
      if (! (justSeekTo || this.setMarkerAfterPaused)) {
        if (this.videoPaused) {
          this.set('videoPaused', false);
          // this.set('disableControls', true);
          console.log('playVideo: restarting paused video ...');
          this.player.playVideo();
          return false;
        }
        if (this.videoStarted) {
          if (!this.pausingVideo) {
            this.set('pausingVideo', true);
            console.log('playVideo: pausing started video ...');
            this.player.pauseVideo();
          }
          return false;
        }
      }

      this.set('orig', orig);
      // if (orig) {
      if (true || orig) {
        if (!skipUnMute) this.get('player').unMute();
        // this.get('player').setVolume (this.get('volume') || 100)
      } // else {
        // this.get('player').mute()
        // // this.get('player').setVolume 0
      // }

      // this.get('player').playVideo();
      // if (this.player.getPlayerState() == window.YT.PlayerState.PAUSED) { // (this.videoSnippetStartMillis != null)
      //   this.get('player').playVideo();
      // } else {
        let startSeconds = this.get('start') + ((this.videoMilliSecsPosFlag == null && this.videoSnippetStartMillis == null) ? 0 : (this.videoSnippetStartMillis != null ? this.videoSnippetStartMillis : this.videoMilliSecs) / 1000);

        // end-seconds can only be set with initOptions - so play after pause is not possible
        // if (this.videoSnippetStartMillis && (this.player.getPlayerState() == window.YT.PlayerState.PAUSED) && this.orig && (this.videoSnippetStartMillis == this.videoMilliSecs)) {
        //   // play orig preview from videoSnippetStartMillis
        //   this.set('videoMilliSecsPosFlag', null);
        //   this.set('videoMilliSecsPosSeekTo3', true);
        //   this.player.playVideo();
        //   return false;
        // }

        let videoConfig = {
          'videoId': this.get('videoId'),
          'startSeconds': startSeconds,
          // user clicks play should not be limited to videoSnippetDurationMillis because pause is enabled and reset to videoSnippetStartMillis
          'endSeconds': justSeekTo ? startSeconds : (((this.videoMilliSecsPosFlag == null && (this.orig || this.videoSnippetStartMillis == null)) || this.recording) ? this.get('end') : Math.min(startSeconds + (this.recordingDuration ? this.recordingDuration + (this.orig ? 0 : (this.dubTrackDelay - this.videoSnippetStartMillis)) : this.videoSnippetDurationMillis) / 1000, this.end))
        }
        if (videoConfig.endSeconds < videoConfig.startSeconds) videoConfig.endSeconds = this.end

        let debugMsg = 'playVideo: justSeekTo = '+justSeekTo+', startSeconds = '+videoConfig.startSeconds+', endSeconds = '+videoConfig.endSeconds+', videoMilliSecsPosFlag = '+(this.videoMilliSecsPosFlag != null ? this.videoMilliSecsPosFlag.getTime() : null)+', videoSnippetStartMillis = '+this.videoSnippetStartMillis;
        if (this.get('videoMilliSecsPosSeekTo')) debugMsg += ', [SeekTo]';
        if (this.get('pauseVideoAfterSeekTo')) debugMsg += ', [SeekTo2]';
        if (this.get('videoMilliSecsPosSeekTo3')) debugMsg += ', [SeekTo3]';
        if (this.get('videoMilliSecsPosSeekTo4')) debugMsg += ', [SeekTo4]';
        console.log(debugMsg);

        this.get('player').loadVideoById(videoConfig);
      // }

      if (! justSeekTo) {
        if (this.videoMilliSecsPosFlag != null) {
          this.set('videoMilliSecsPosFlag', null);
          if (this.videoMilliSecsPosSeekTo3) this.set('pauseVideoAfterSeekTo', true);
          // if (this.videoMilliSecsPosSeekTo3) this.setProperties({ pauseVideoAfterSeekTo: true, videoMilliSecsPosSeekTo3: false });
        } else {
          // here we only get when played from timecode 0
          this.set('videoMilliSecsPosSeekTo3', true);
          // this.set('disableControls', true);
        }
      }
    },
    startRecording() {
      this.setProperties({
        dubTrackDelay: this.videoSnippetStartMillis != null ? this.videoSnippetStartMillis : 0,
        innerDubTrackDelay: 0,
        newDubTrackDelay: this.videoSnippetStartMillis != null ? this.videoSnippetStartMillis : 0,
        newInnerDubTrackDelay: 0,
        recording: true
      });
      this.send('playVideo', false);
    },
    stopRecording() {
      let startSeconds = this.get('start') + ((this.videoMilliSecsPosFlag == null && this.videoSnippetStartMillis == null) ? 0 : (this.videoSnippetStartMillis != null ? this.videoSnippetStartMillis : this.videoMilliSecs) / 1000);
      let duration = Math.floor((this.get('player').getCurrentTime() - startSeconds) * 1000);
      this.set('recordingDuration', duration);
      console.log('stop recording audio-track after '+duration+' milliSecs...');
      // let left = Math.round((startSeconds - this.start) / (this.end - this.start) * 300);
      // let width = Math.round(duration / ((this.end - this.start) * 1000) * 300);
      // document.getElementById('recordedRange').style="position: relative; z-index: -10; left: "+left+"px; top: -23px; width: "+width+"px; background-color: rgb(100,100,100,0.3);"
      this.renderRecordedRange(startSeconds, duration);

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
      this.player.stopVideo();
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
      if (this.videoStarted && (! this.videoPaused)) {
        if (this.orig) this.player.pauseVideo();
        return false;
      }

      let milliSecs = parseInt(value);
      let videoMilliSecs = milliSecs - this.start * 1000;
      if (milliSecs >= this.end * 1000) {
        alert('Timecode muss < Videoende sein.');
        return false;
      } else if (videoMilliSecs < 0) {
        alert('Timecode muss >= Videoanfang sein.');
        return false;
      }

      if (this.videoSnippetStartMillis && (this.player.getPlayerState() == window.YT.PlayerState.PAUSED) && this.orig && (videoMilliSecs == this.videoMilliSecs)) {
        console.log('setVideoMilliSecs: restarting paused snippet ...');
        // play orig preview from videoSnippetStartMillis
        this.set('videoMilliSecsPosSeekTo3', true);
        // this.set('disableControls', true);
        this.get('player').unMute();
        this.player.playVideo();
        return false;
      }

      if (videoMilliSecs != this.videoMilliSecs) {
        this.setProperties({ videoMilliSecs: videoMilliSecs, videoSnippetStartMillis: videoMilliSecs != 0 ? videoMilliSecs : null });
        if (videoMilliSecs == 0) {
          console.log('setVideoMilliSecs: removing video snippet ...');
          // this.set('videoMilliSecsPosFlag', new Date()); // will play vid
          // this.setProperties({ videoMilliSecsPosFlag: null, videoMilliSecsPosFlag2: new Date() });
          this.setProperties({
            videoMilliSecsPosFlag: null,
            videoMilliSecsPosFlag2: new Date(), // updates posvalue for slider/range-input
            videoMilliSecsPosSeekTo: true,
            pauseVideoAfterSeekTo: true,
            videoStarted: false,
            pausingVideo: false,
            videoPaused: false
          });
          this.get('player').mute();
          this.send('playVideo', true, true, true);
          return false;
        }

        console.log('setVideoMilliSecs: new milliSecs = ' + milliSecs + ', videoMilliSecs = ' + this.videoMilliSecs + ', videoStarted = ' + this.videoStarted + ', videoPaused = ' + this.videoPaused);
        // if (this.videoStarted && this.videoPaused) {
        //   this.setVideoMilliSecsDebounced();
        // } else {
          debounce(this, this.setVideoMilliSecsDebounced, 250);
        // }
      }
      return false;
    }
  },
  setVideoMilliSecsDebounced() {
    this.set('videoMilliSecsPosFlag', this.videoSnippetStartMillis != null ? new Date() : null);
  },
  renderRecordedRange(startSeconds, duration = null) {
    console.log('renderRecordedRange: startSeconds = '+startSeconds+', duration = '+duration+', recordingDuration = '+this.recordingDuration);
    if (duration == null) duration = this.get('recordingDuration');
    let left = Math.round((startSeconds - this.start) / (this.end - this.start) * 300) + 2;
    let width = Math.round(duration / ((this.end - this.start) * 1000) * 300);
    document.getElementById('recordedRange').style="left: "+left+"px; width: "+width+"px;"
  },
  // audiobuffers can be started only once, so after end we setup next one for replay.
  initAudioBuffer(audioFileUrl) {
    this.set('audioBufferStarted', false);
    this.set('audioBuffer', this.connectAudioSource(audioFileUrl, (data) => {
        console.log('continue with original audio, videoStarted = '+this.get('videoStarted') + ', data = ' + JSON.stringify(data));
        // if (this.get('videoStarted')) {
          // // this.get('audioBuffer').disconnect()
          // this.set('videoSnippetStartMillis', null);
          // $('#rec_ctrl').attr("disabled", true);
          this.get('player').unMute();
          // // this.get('player').setVolume (this.get('volume') || 100)
          return this.initAudioBuffer(audioFileUrl);
        // }
      }));
  },
  setupYoutubeAPI(autoplay) {
    if (document.getElementById('iframe_api') != null) {
      this.initPlayer(autoplay);
      return;
    }

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
    // no floats on initial with firefox
    let start = parseInt(this.get('start'));
    // console.log('initPlayer: this.start = '+this.get('start'));

    this.set('player', new window.YT.Player('video', {
      width: this.get('playerWidth'),
      height: this.get('playerHeight'),
      videoId: this.hideTitleSecs == null || !this.featurePresentation ? this.get('videoId') : 'rmSK1imravY',
      events: {
        'onReady': this.onYouTubePlayerReady.bind(this),
        'onStateChange': this.onYouTubePlayerStateChange.bind(this),
      },
      playerVars: {
        start: start,
        end: this.hideTitleSecs == null ? this.get('end') : start + this.hideTitleSecs,
        // start: this.hideTitleSecs == null/* || !this.featurePresentation*/ ? start : 1,
        // end: this.hideTitleSecs == null/* || !this.featurePresentation*/ ? parseInt(this.get('end')) : 1 + this.hideTitleSecs,
        showinfo: 0,
        controls: 0,
        version: 3,
        enablejsapi: 1,
        html5: 1/**/,
        autoplay: autoplay ? 1 : 0
      }
    }));
    // this.set('volume', 100); // this.get('player').getVolume()
    if (this.hideTitleSecs != null && !this.featurePresentation) $('#video').hide();
  },
  onYouTubePlayerReady() {
    console.log('youTubePlayerReady ...');
    this.set('playerReady', true);
    if (this.hideTitleSecs != null) {
      // this.player.mute();
      this.set('initialPlayerVolume', this.player.getVolume());
      if (!this.featurePresentation) this.player.setVolume(1);
      window.setTimeout(() => {
        // fallback id autoplay didn't start
        if (this.videoCountdownSecs == null) {
          this.set('hideTitleSecs', null);
          this.get('player').destroy();
          this.initPlayer(false);
        }
      }, 5000);
    }
    // if (this.get('dubSpecReady') && (!this.get('initialPlayed')))
    //   this.send('playVideo', false);
    // else {
      if (this.get('showHowTo') && (this.get('audioBuffer') == null))
        this.send('playVideo', true);
    // }
  },
  onYouTubePlayerStateChange(event) {
    // try {
    let debugMsg = 'yt-player-state: '+event.data;
    if (event.data != this.player.getPlayerState()) debugMsg += ',  playerState = '+this.player.getPlayerState();
    debugMsg += ', videoLoaded = '+this.get('player').getVideoLoadedFraction()+', videoStarted = '+this.get('videoStarted')+
                ', videoMilliSecsPosFlag = ' + (this.videoMilliSecsPosFlag != null ? this.videoMilliSecsPosFlag.getTime() : null) + ', videoMilliSecsPosFlag2 = ' + (this.videoMilliSecsPosFlag2 != null ? this.videoMilliSecsPosFlag2.getTime() : null);
    if (!this.get('initialPlayed')) debugMsg += ', [FIRSTPLAY]';
    if (!this.get('initialPlayed') && this.fixedFloatStart) debugMsg += ', [fixedFloatStart]';
    if (this.get('orig')) debugMsg += ', [ORIG]';
    if (this.get('recording')) debugMsg += ', [RECORDING]';
    if (this.get('videoMilliSecsPosSeekTo')) debugMsg += ', [SeekTo]';
    if (this.get('pauseVideoAfterSeekTo')) debugMsg += ', [SeekTo2]';
    if (this.get('videoMilliSecsPosSeekTo3')) debugMsg += ', [SeekTo3]';
    if (this.get('videoMilliSecsPosSeekTo4')) debugMsg += ', [SeekTo4]';
    console.log(debugMsg);
    // } catch (error) {
    //   console.error('error on yt-player-state-change-callback: ', error);
    // }

    switch (event.data) {
      // { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 }
      case window.YT.PlayerState.PLAYING:
        if (!this.initialPlayed && this.hideTitleSecs) {
          // on first-play (1. player initialized) youtube displays video-info for some time (showinfo param was deprecated in 2018)
          // hack to prevent: play muted and hidden for hideTitleSecs, then replay. info is removed right after start.
          this.set('videoCountdownSecs', this.hideTitleSecs);
          let decrCountdown = () => {
            if (this.set('videoCountdownSecs', this.videoCountdownSecs - 1) > 0)
              window.setTimeout(() => this.set('videoCountdownSecs', /*this.videoCountdownSecs == 1 ? -1 : */this.videoCountdownSecs - 1), 1000);
          };
          window.setTimeout(decrCountdown, 1000);
          return;
        }
        if (!this.fixedFloatStart && !this.initialPlayed && this.start % 1 != 0) {
          this.set('fixedFloatStart', true);
          this.player.seekTo(this.start);
          return;
        }

        if (this.get('videoMilliSecsPosSeekTo')) {
          this.set('videoMilliSecsPosSeekTo', false);
          // this.get('player').unMute();
          if (this.get('pauseVideoAfterSeekTo')) {
            this.set('pauseVideoAfterSeekTo', false);
            this.set('videoMilliSecsPosSeekTo3', false);
            this.set('videoMilliSecsPosSeekTo4', true);
            this.player.pauseVideo();
            return;
          } else {
            this.get('player').unMute();
            this.set('pauseVideoAfterSeekTo', true);
          }
        }

        if(!this.get('initialPlayed')) {
          if ((this.get('orig') == null) || this.get('orig'))
            this.set('orig', false);
            // this.get('player').mute();
        }
        // $('#play_orig').attr("disabled", true);
        // $('#play_dub').attr("disabled", true);
        // $('#rec_ctrl').attr("disabled", true);

        var stopAudio = this.get('stopAudioCallback');
        if (stopAudio != null && this.get('audioBufferStarted'))
          stopAudio();
        this.set('videoStarted', true);
        console.log('yt-player started playing, orig = '+this.get('orig')+' ...');

        // if (this.get('initialPlayed') || this.get('recording'))
        if ((this.get('initialPlayed') || this.get('recording')) && (!this.hideTitleSecs || this.initialPlayedWithHiddenTitle))
          window.setTimeout(this.displayVideoMillisCallback('100'), '100');

        if(!this.get('orig')) {
          if (this.get('player').getVideoLoadedFraction() != 0) {
            if (this.get('recording')) {
              this.get('player').mute();
              console.log('start recording audio-track ...');
              if (navigator.userAgent.match(/Chrome/)) {
                // this.recordAudio.record();
                // there is som delay in observing recording and videoStarted
                window.setTimeout(() => this.recordAudio.record(), '200');
                // this.recordAudio.start();
              } else {
                // this.get('audioRecorder').record(300);
                // there is som delay in observing recording and videoStarted
                window.setTimeout(() => this.get('audioRecorder').record(300), '200');
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
      case window.YT.PlayerState.CUED:
      case window.YT.PlayerState.ENDED:
        if (this.hideTitleSecs) {
          if (!this.initialPlayed) {
            // on first-play (1. player initialized) youtube displays video-info for some time (showinfo param was deprecated in 2018)
            // hack to prevent: play muted and hidden for hideTitleSecs, then replay. info is removed right after start.
            this.set('initialPlayed', true);
            if (!this.featurePresentation) {
              $('#video').show();
              this.player.setVolume(this.get('initialPlayerVolume'));
            }
            if (this.autoplay) this.send('playVideo', false);
            return;
          } else if (this.videoStarted && this.hideTitleSecs) {
            this.setProperties({ hideTitleSecs: null, initialPlayedWithHiddenTitle: new Date() });
          } else {
            return;
          }
        }

        console.log('stopAudioCallback == null: '+(this.get('stopAudioCallback')==null)+', recording = '+this.get('recording')+', audioBufferStarted = '+this.get('audioBufferStarted'));
        // this.audioContext.suspend();
        if (this.get('recording') && (this.get('player').getVideoLoadedFraction() != 0))
          this.send('stopRecording');
        // if (this.get('player').getVideoLoadedFraction() == 1) {
        if(!this.get('initialPlayed'))
          this.set('initialPlayed', true);
        if (this.get('videoStarted')) {
          // if (this.videoSnippetStartMillis == null) this.set('videoMilliSecs', 0);
          if (this.videoSnippetStartMillis == null) {
            if (this.videoMilliSecs != 0) {
              this.set('videoMilliSecs', 0);
              this.set('videoMilliSecsPosFlag2', new Date()); // shows pos-preview by start/pause video
            }
            this.set('videoMilliSecsPosSeekTo3', false);
          // else this.set('videoMilliSecs', this.videoSnippetStartMillis);
          } else {
            // got to snippet-start for timecode-thumbnail
            this.set('videoMilliSecs', this.videoSnippetStartMillis);
            this.set('videoMilliSecsPosFlag', new Date()); // shows pos-preview by start/pause video
          }
        }
        this.set('videoStarted', false);
        if (this.setMarkerAfterPaused) {
          this.setProperties({ setMarkerAfterPaused: null, pausingVideo: false, videoPaused: false });
        }
        this.set('disableControls', false);

        this.set('stopAudioCallback', null);

        // $('#play_orig').attr("disabled", false);
        // $('#play_dub').attr("disabled", false);
        // $('#rec_ctrl').attr("disabled", false);

        this.set('recorded', false);

        if (this.recordingDuration == null) {
          this.set('recordingDuration', this.audioBuffer.buffer.duration * 1000);
          schedule("afterRender", () => this.renderRecordedRange(this.start + this.dubTrackDelay / 1000));
        }
        // }
        break;
      case window.YT.PlayerState.PAUSED:
        // if (! this.initialPlayed) {
        //   this.set('initialPlayed', true);
        //   this.player.playVideo();
        //   break;
        // }
        if (!this.get('videoMilliSecsPosSeekTo4')) {
          // this.set('pausingVideo', false);
          // this.set('videoPaused', true);
          this.setProperties({ pausingVideo: false, videoPaused: true });
          // if (this.orig) $('#play_orig').attr("disabled", false);
          // else $('#play_dub').attr("disabled", false);
        } else {
          // get here whenever paused after videoSnippetStartMillis is changed or play snippet
          // (but not when continue playing orig or playing from 0 without previous change)
          this.set('videoMilliSecsPosSeekTo4', false);
          this.set('disableControls', false);
          if (this.videoSnippetStartMillis) {
            this.set('videoMilliSecs', this.videoSnippetStartMillis);
            this.set('videoMilliSecsPosFlag2', new Date());
          }
        }
        break;
    }
  },
  // called after player started playing
  displayVideoMillisCallback(timeoutMillis) {
    return () => {
      if (this.player.getPlayerState() == 1) {
        let centiSecs = Math.floor((this.get('player').getCurrentTime() - this.start) * 1000); // / 1000;
        if (centiSecs >= 0) {
          if (centiSecs == this.get('videoMilliSecs')) return;
          // console.log('displayVideoMillisCallback: centiSecs = ' + centiSecs + ', player.currentTime = ' + this.get('player').getCurrentTime());
          // console.log('displayVideoMillisCallback: setting videoMilliSecs to ' + centiSecs);
          this.set('videoMilliSecs', centiSecs);
        }
        if (this.get('player').getCurrentTime() <= this.end) {
          // debounce required or video-end will not be reached
          // debounce(this, () => this.set('videoMilliSecsPosFlag2', new Date()), parseInt(timeoutMillis) + 100);
          if (this.get('videoMilliSecsPosFlag') == null) this.set('videoMilliSecsPosFlag2', new Date());
          else console.log('displayVideoMillisCallback: videoMilliSecsPosFlag = '+this.videoMilliSecsPosFlag.getTime());
          window.setTimeout(this.displayVideoMillisCallback(timeoutMillis), timeoutMillis);
        }
      }
    };
  },
  _startDubTrack() {
    // if (this.videoSnippetStartMillis != null && (this.videoSnippetStartMillis + (this.recordingDuration||this.videoSnippetDurationMillis) - this.get('dubTrackDelay')) <= this.get('innerDubTrackDelay')) {
    if (this.get('innerDubTrackDelay') >= 1 && this.videoSnippetStartMillis != null && (this.videoSnippetStartMillis + (this.recordingDuration||this.videoSnippetDurationMillis) - this.get('dubTrackDelay')) <= this.get('innerDubTrackDelay')) {
      console.log('not playing dub-track if snippet will end befor dub-track ...');
      return;
    }
    // if (this.get('innerDubTrackDelay') <= 0)
    if (this.get('innerDubTrackDelay') <= 0 || this.videoSnippetStartMillis != null) {
      // this.get('player').mute();
      if (this.videoSnippetStartMillis == null || this.videoSnippetStartMillis >= (this.get('dubTrackDelay')||0)) this.get('player').mute();
    } else
      // window.setTimeout(this.get('player').mute.bind(this.get('player')), this.get('innerDubTrackDelay'));
      window.setTimeout(() => this.get('player').mute(), this.get('innerDubTrackDelay'));

    console.log('start playing audio-track; player.startSeconds = '+this.get('start')+', player.getCurrentTime = '+this.get('player').getCurrentTime() + ', audioContext.state = ' + this.audioContext.state + ', audioContext.currentTime = ' + this.audioContext.currentTime + ', dubTrackDelay = ' + this.get('dubTrackDelay') + ', innerDubTrackDelay = ' + this.get('innerDubTrackDelay') + ', videoMilliSecs = ' + this.videoMilliSecs + ', videoSnippetStartMillis = ' + this.videoSnippetStartMillis);
    if (this.get('useAudioTag')) {
      $('audio')[0].currentTime = 0.2; // this.get('player').getCurrentTime() - this.get('start');
      console.log('currentTime = '+$('audio')[0].currentTime);
      $('audio')[0].play();
    } else {
      // if (this.get('audioBuffer') != null) {
      try {
        if (this.videoSnippetStartMillis != null) {
          // this.get('audioBuffer').start(0, (this.videoSnippetStartMillis - this.get('dubTrackDelay')) / 1000);
          if (this.videoSnippetStartMillis >= this.get('dubTrackDelay')) {
            this.get('audioBuffer').start(0, (this.videoSnippetStartMillis - this.get('dubTrackDelay')) / 1000);
          } else {
            window.setTimeout(() => { this.get('player').mute(); this.get('audioBuffer').start(); }, this.get('dubTrackDelay') - this.videoSnippetStartMillis);
          }
        } else {
          this.get('audioBuffer').start();
        }
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
                  // if (this.recordingDuration == null) {
                  //   this.set('recordingDuration', audio1.buffer.duration * 1000);
                  //   // schedule("afterRender", () => this.initPlayer(false));
                  //   this.renderRecordedRange(this.start + this.dubTrackDelay / 1000);
                  // }
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
    formData.append('dub_data[video_title]', this.get('videoTitle'));
    formData.append('dub_data[video_id]', this.get('videoId'));
    formData.append('dub_data[start_secs]', this.get('start') * 100);
    formData.append('dub_data[end_secs]', this.get('end') * 100);
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
