'use strict';



;define("sparta/app", ["exports", "sparta/resolver", "ember-load-initializers", "sparta/config/environment"], function (_exports, _resolver, _emberLoadInitializers, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const App = Ember.Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });
  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);
  var _default = App;
  _exports.default = _default;
});
;define("sparta/components/dub-track-library", ["exports", "sparta/mixins/loading-indicator", "sparta/mixins/clipboard-actor"], function (_exports, _loadingIndicator, _clipboardActor) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var DubTrackLibraryComponent;
  DubTrackLibraryComponent = Ember.Component.extend(_loadingIndicator.default, _clipboardActor.default, {
    backendAdapter: Ember.inject.service(),
    application: function () {
      return Ember.getOwner(this).lookup('controller:application');
    }.property(),
    dubTrackList: [],
    loadLibrary: function () {
      var url;
      url = $('#dub-list-url').val();
      return this.get('backendAdapter').request(url, 'GET', null, null, null, null, false, true).then(function (_this) {
        return function (dubTrackList) {
          var attr, dubIdMatch, dubTrack, i, j, len, len1, ref;

          for (i = 0, len = dubTrackList.length; i < len; i++) {
            dubTrack = dubTrackList[i];

            if ((dubIdMatch = location.search.match(/([?&])dubId=[^&]+/)) != null) {
              dubTrack.dubTrackUrl = location.href.replace(/library\/?/, '').replace(/([?&]dubId=)[^&]+/, '$1' + dubTrack.id);
            } else {
              dubTrack.dubTrackUrl = location.href.replace(/library\/?/, '') + '?dubId=' + dubTrack.id;
            }

            ref = Object.keys(dubTrack);

            for (j = 0, len1 = ref.length; j < len1; j++) {
              attr = ref[j];

              if (attr.indexOf('_') >= 0 && dubTrack[attr.camelize()] == null) {
                dubTrack[attr.camelize()] = dubTrack[attr];
              }
            }
          }

          return _this.set('dubTrackList', dubTrackList);
        };
      }(this));
    }.on('init'),
    actions: {
      todo: function () {
        return alert('todo');
      }
    }
  });
  var _default = DubTrackLibraryComponent;
  _exports.default = _default;
});
;define("sparta/components/how-to", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    isMobile: false,
    subject: null,
    currentStep: Ember.computed.alias('subject.currentHowToStep')
  });

  _exports.default = _default;
});
;define("sparta/components/range-slider", ["exports", "ember-cli-nouislider/components/range-slider"], function (_exports, _rangeSlider) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _rangeSlider.default;
    }
  });
});
;define("sparta/components/sound-track-creator", ["exports", "jquery", "sparta/mixins/loading-indicator"], function (_exports, _jquery, _loadingIndicator) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend(_loadingIndicator.default, {
    recordAudio: Ember.inject.service(),
    backendAdapter: Ember.inject.service(),
    application: Ember.computed(function () {
      return Ember.getOwner(this).lookup('controller:application');
    }),
    hideTitleSecs: null,
    //2, // null will use youtube-default (display title for 3 seconds)
    skipSample: false,
    autoplay: true,
    featurePresentation: false,
    videoCountdownSecs: null,
    initialPlayedWithHiddenTitle: null,
    showHowTo: false,
    currentHowToStep: 1,
    enableInnerDubDelay: false,
    howToObserver: Ember.observer('showHowTo', function (_sender, _key, _value, _rev) {
      let videoProps = ['videoId', 'start', 'newStart', 'origDubTrackStartSecs', 'end', 'newEnd', 'videoMilliSecs', 'videoSnippetStartMillis', 'audioBuffer', 'initialPlayed'];
      let dubTrackProps = ['dubTrackDelay', 'newDubTrackDelay', 'innerDubTrackDelay', 'newInnerDubTrackDelay'];

      if (this.get('showHowTo')) {
        for (let propKey of videoProps.concat(dubTrackProps)) this.set('howToOrig' + propKey, this.get(propKey));

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

        for (let propKey of dubTrackProps) this.set(propKey, 0);

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

        for (let propKey of videoProps.concat(dubTrackProps)) this.set(propKey, this.get('howToOrig' + propKey));

        for (let propKey of videoProps.concat(dubTrackProps)) this.set('howToOrig' + propKey, null);

        if (this.audioBuffer) this.renderRecordedRange(this.start + this.dubTrackDelay / 1000);
      }

      if (!this.get('displayControls')) this.set('displayControls', true);
    }),
    audioContext: Ember.computed.alias('recordAudio.audioContext'),
    dubSpecReady: false,
    displayControls: true,
    initialPlayed: false,
    useAudioTag: Ember.computed(function () {
      return false; // mobile / browser dependent
    }),
    player: null,
    playerWidth: Ember.computed(function () {
      560;
    }),
    playerHeight: Ember.computed(function () {
      315;
    }),
    playerReady: Ember.computed({
      get(_key) {
        return this.get('_playerReady') || false;
      },

      set(_key, playerReady) {
        return this.set('_playerReady', playerReady);
      }

    }),
    videoMilliSecs: 0,
    // shows current timecode in video after scene start (0)
    videoMilliSecsPosFlag: null,
    videoMilliSecsPosFlag2: null,
    // slider-value starts with video-start-secs as millis
    videoMilliSecsPos: Ember.computed('start', 'videoMilliSecsPosFlag', 'videoMilliSecsPosFlag2', function () {
      let debugMsg = 'videoMilliSecsPos: videoMilliSecs = ' + this.videoMilliSecs + ', start = ' + this.start + ', seekTo = ' + (this.start + Math.floor(this.videoMilliSecs / 1000)) + ', videoMilliSecsPosFlag = ' + (this.videoMilliSecsPosFlag != null ? this.videoMilliSecsPosFlag.getTime() : null) + ', videoMilliSecsPosFlag2 = ' + (this.videoMilliSecsPosFlag2 != null ? this.videoMilliSecsPosFlag2.getTime() : null) + ', newDubTrackDelayFlag = ' + (this.newDubTrackDelayFlag != null ? this.newDubTrackDelayFlag.getTime() : null);
      if (this.get('videoMilliSecsPosSeekTo')) debugMsg += ', [SeekTo]';
      if (this.get('pauseVideoAfterSeekTo')) debugMsg += ', [SeekTo2]';
      if (this.get('videoMilliSecsPosSeekTo3')) debugMsg += ', [SeekTo3]';
      if (this.get('videoMilliSecsPosSeekTo4')) debugMsg += ', [SeekTo4]';
      if (
      /*true || */
      this.videoMilliSecsPosFlag) console.log(debugMsg); // seekTo doesn't work - only works with hole secs. our solution: play and pause via videoMilliSecsPosFlag
      // if (this.videoMilliSecsPosFlag != null) this.player.seekTo(this.start + Math.floor(this.videoMilliSecs / 1000), false);

      if (this.videoMilliSecsPosFlag != null) {
        // this.set('disableControls', true);
        this.set('videoMilliSecsPosSeekTo', true);

        if (this.newDubTrackDelayFlag == null) {
          this.get('player').mute();
          if (this.videoStarted && this.videoPaused) this.setProperties({
            setMarkerAfterPaused: true,

            /*videoStarted: false , videoPaused: false, */
            videoMilliSecsPosSeekTo3: false
          });
          this.send('playVideo', true, true);
        } else {
          this.set('newDubTrackDelayFlag', null);
          this.send('playVideo', false);
        }
      }

      return this.start * 1000 + this.videoMilliSecs;
    }),
    videoMilliSecsPosSeekTo3: false,
    // when start from timecode 0 (no snippet)
    videoSnippetStartMillis: null,
    // not null when timecode is changed by user to a value > 0
    videoSnippetDurationMillis: 1000,
    sharedDubTrackUrls: Ember.computed(function () {
      return [];
    }),
    // videoId: null,
    videoId: Ember.computed(
    /**/
    'videoUrl', {
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
    videoUrl: Ember.computed({
      get(_key) {
        return this.get('_videoUrl') || null;
      },

      set(_key, videoUrl) {
        if (videoUrl == null || videoUrl.trim() == '') {
          this.set('_videoUrl', null);
        } else {
          let videoId = (videoUrl.match(/[?&]v=([^&]+)/) || videoUrl.match(/https:\/\/[^\/]+\/([^\/]+)/))[1];
          this.setProperties({
            _videoUrl: null,
            videoId: videoId
          });
          (0, _jquery.default)('#videoUrl').val('');
        }

        return this.get('_videoUrl');
      }

    }),
    origDubTrackStartSecs: -1,
    start: -1,
    end: 1,
    startFmtd: Ember.computed('start', function () {
      return moment('1970-01-01 00:00:00').add(moment.duration(this.start == -1 ? 0 : this.start, 'seconds')).format('HH:mm:ss.SS').replace(/00:/g, '').replace(/\.[0]+$/, '');
    }),
    endFmtd: Ember.computed('end', function () {
      return moment('1970-01-01 00:00:00').add(moment.duration(this.end, 'seconds')).format('HH:mm:ss.SS').replace(/00:/g, '').replace(/\.[0]+$/, '');
    }),
    dubTrackDelay: 0,
    innerDubTrackDelay: 0,
    newStart: -1,
    newEnd: 1,
    newStartFmtd: Ember.computed('start', {
      get(_key) {
        return moment('1970-01-01 00:00:00').add(moment.duration(this.newStart == -1 ? 0 : this.newStart, 'seconds')).format('HH:mm:ss.SS').replace(/00:/g, '').replace(/\.[0]+$/, '');
      },

      set(_key, newStartFmtd) {
        let validMatch = ('00:00:' + newStartFmtd.replace(/^([0-9])$/, '0$1')).match(/[0-9]{2}:[0-9]{2}:[0-9]{2}(|\.[0-9]+)$/);
        if (validMatch == null) return newStartFmtd;
        this.set('newStart', moment.duration(validMatch[0]).asSeconds());
        return newStartFmtd.replace(/00:/g, '');
      }

    }),
    newEndFmtd: Ember.computed('end', {
      get(_key) {
        return moment('1970-01-01 00:00:00').add(moment.duration(this.newEnd, 'seconds')).format('HH:mm:ss.SS').replace(/00:/g, '').replace(/\.[0]+$/, '');
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
    cuttingDataComplete: Ember.computed('videoId', 'start', 'end', function () {
      return (this.videoId || '') != '' && this.start >= 0 && this.end > this.start;
    }),
    changeObserver: Ember.observer('start', 'newStart', 'end', 'newEnd', 'dubTrackDelay', 'newDubTrackDelay', 'innerDubTrackDelay', 'newInnerDubTrackDelay', function (_sender, _key, _value, _rev) {
      // let newStartSecs = moment.duration(('00:00:' + this.newStartFmtd).match(/[0-9]{2}:[0-9]{2}:[0-9]{2}$/)[0]).asSeconds();
      var newCuttingData = false;

      if (this.get('start') != this.get('newStart')) {
        (0, _jquery.default)('#startSecs').css('background-color', 'red');
        newCuttingData = true;
      } else (0, _jquery.default)('#startSecs').css('background-color', '');

      if (this.get('end') != this.get('newEnd')) {
        (0, _jquery.default)('#endSecs').css('background-color', 'red');
        newCuttingData = true;
      } else (0, _jquery.default)('#endSecs').css('background-color', '');

      if (newCuttingData) (0, _jquery.default)('#setCuttingData').css('background-color', 'red');else (0, _jquery.default)('#setCuttingData').css('background-color', '');
      var newDubTrackDelay = false;

      if (this.get('dubTrackDelay') != parseInt(this.get('newDubTrackDelay'))) {
        (0, _jquery.default)('#dubTrackDelayMillis').css('background-color', 'red');
        newDubTrackDelay = true;
      } else (0, _jquery.default)('#dubTrackDelayMillis').css('background-color', '');

      if (this.get('innerDubTrackDelay') != parseInt(this.get('newInnerDubTrackDelay'))) {
        (0, _jquery.default)('#innerDubTrackDelayMillis').css('background-color', 'red');
        newDubTrackDelay = true;
      } else (0, _jquery.default)('#innerDubTrackDelayMillis').css('background-color', '');

      if (newDubTrackDelay) (0, _jquery.default)('#setDubTrackDelay').css('background-color', 'red');else (0, _jquery.default)('#setDubTrackDelay').css('background-color', '');
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
        let audioContext = window.AudioContext || window.webkitAudioContext;
        this.set('audioContext', new audioContext({
          latencyHint: 'interactive'
          /*,
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

          if ((0, _jquery.default)('#iframe_api').length >= 1) {
            Ember.run.schedule("afterRender", () => this.initPlayer(false));
          } else {
            Ember.run.schedule("afterRender", () => this.setupYoutubeAPI(false));
          }
        } else {
          let dubIdMatch = location.search.match(/[?&]dubId=([^&]+)/) || [null, '-1'];
          let url = (0, _jquery.default)('#dub-data-url').val().replace(/:dubId/, dubIdMatch[1]);
          this.get('backendAdapter').request(url, 'GET', null, null, null, null, false, true).then(dubData => {
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
            if (this.get('useAudioTag')) this.createDownloadLink(dubData.dub_track_url);else {
              this.initAudioBuffer(this.set('dubTrackUrl', dubData.dub_track_url)); // browser cache takes care of this
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
            Ember.run.schedule("afterRender", () => this.setupYoutubeAPI(true));
          });
        } // // navigator.permissions.query({name:'microphone'}).then((result) => {
        // if (navigator.userAgent.match(/Chrome/) && !this.get('application.isMobile')) {


        navigator.mediaDevices.enumerateDevices().then(devices => {
          // for (let audioinput of devices.filter((d) => d.kind == 'audioinput')) console.log(JSON.stringify(audioinput));
          var device = devices.filter(d => d.kind == 'audioinput' && d.getCapabilities && d.getCapabilities().sampleRate && d.getCapabilities().channelCount)[0];
          if (device == null) device = devices.filter(d => d.kind == 'audioinput' && (!d.label || d.label.match(/Monitor/) == null))[0];
          if (device != null) this.setupMic({
            video: false,
            audio: {
              deviceId: device.deviceId
            }
          });else this.setupMic({
            video: false,
            audio: true
          });
        }); // } else {
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
      let setupMedia = stream => {
        let recorderConfig = {
          mimeType: navigator.userAgent.match(/Chrome/) ? 'audio/webm' : 'audio/wav',
          // webm | wav | ogg
          bufferLen: 4096,
          // 4096 | 8192
          numChannels: 1 // 1 | 2

        };

        if (navigator.userAgent.match(/Chrome/)) {
          return this.recordAudio.setupMediaRecorder(stream, recorderConfig); // return this.recordAudio.newTrack(stream, recorderConfig);
        } else {
          return this.set('audioRecorder', new window.Recorder(this.get('audioContext').createMediaStreamSource(stream), recorderConfig));
        }
      };

      let gUM = window.Modernizr.prefixed('getUserMedia', navigator.mediaDevices);
      gUM(constraints).then(setupMedia).catch(e => {
        console.error('Reeeejected!', e); // alert('Reeeejected!')
      });
    },

    actions: {
      setVideoId() {
        // if (parseInt($('#startSecs').val()) >= parseInt($('#endSecs').val()))
        //   $('#endSecs').val((parseInt($('#startSecs').val()) + this.get('end') - this.get('start')));
        if (this.newStart >= this.newEnd) this.set('newEnd', this.newStart + this.get('end') - this.get('start'));
        if (!this.get('displayControls')) this.set('displayControls', true);
        if ([null, ""].indexOf((0, _jquery.default)('#videoUrl').val()) == -1) this.set('videoUrl', (0, _jquery.default)('#videoUrl').val());
        let noVideoChange = this.get('videoId') == (0, _jquery.default)('#videoId').val();
        var extraDubTrackDelay;
        if (noVideoChange && this.get('start') > this.get('origDubTrackStartSecs')) extraDubTrackDelay = (this.get('start') - this.get('origDubTrackStartSecs')) * 1000;else extraDubTrackDelay = 0;
        if ((0, _jquery.default)('#videoId').val() != '') this.set('videoId', (0, _jquery.default)('#videoId').val()); // let startSecsChange = parseInt($('#startSecs').val()) - this.get('start');
        // this.set('start', parseInt($('#startSecs').val()));
        // this.set('end', parseInt($('#endSecs').val()));
        // this.set('newStart', parseInt($('#startSecs').val()));
        // this.set('newEnd', parseInt($('#endSecs').val()));

        let startSecsChange = this.newStart - this.get('start'); // this.set('start', this.newStart);

        this.set('start', this.videoSnippetStartMillis == null ? this.newStart : this.newStart + this.videoSnippetStartMillis / 1000);
        this.set('end', this.newEnd); // this.set('newStart', parseInt($('#startSecs').val()));
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
        this.set('dubTrackDelay', newDubTrackDelay || parseInt((0, _jquery.default)('#dubTrackDelayMillis').val())); // this.send('playVideo', true);

        this.set('newDubTrackDelayFlag', new Date());
        this.send('setVideoMilliSecs', this.start * 1000 + this.dubTrackDelay);
        this.renderRecordedRange(this.start + this.dubTrackDelay / 1000);
        if (this.enableInnerDubDelay) this.set('innerDubTrackDelay', parseInt((0, _jquery.default)('#innerDubTrackDelayMillis').val()));
      },

      playVideo(orig = true, skipUnMute = false, justSeekTo = false) {
        if (!(justSeekTo || this.setMarkerAfterPaused)) {
          if (this.videoPaused) {
            this.set('videoPaused', false); // this.set('disableControls', true);

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

        this.set('orig', orig); // if (orig) {

        if (true || orig) {
          if (!skipUnMute) this.get('player').unMute(); // this.get('player').setVolume (this.get('volume') || 100)
        } // else {
        // this.get('player').mute()
        // // this.get('player').setVolume 0
        // }
        // this.get('player').playVideo();
        // if (this.player.getPlayerState() == window.YT.PlayerState.PAUSED) { // (this.videoSnippetStartMillis != null)
        //   this.get('player').playVideo();
        // } else {


        let startSeconds = this.get('start') + (this.videoMilliSecsPosFlag == null && this.videoSnippetStartMillis == null ? 0 : (this.videoSnippetStartMillis != null ? this.videoSnippetStartMillis : this.videoMilliSecs) / 1000); // end-seconds can only be set with initOptions - so play after pause is not possible
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
          'endSeconds': justSeekTo ? startSeconds : this.videoMilliSecsPosFlag == null && (this.orig || this.videoSnippetStartMillis == null) || this.recording ? this.get('end') : Math.min(startSeconds + (this.recordingDuration ? this.recordingDuration + (this.orig ? 0 : this.dubTrackDelay - this.videoSnippetStartMillis) : this.videoSnippetDurationMillis) / 1000, this.end)
        };
        if (videoConfig.endSeconds < videoConfig.startSeconds) videoConfig.endSeconds = this.end;
        let debugMsg = 'playVideo: justSeekTo = ' + justSeekTo + ', startSeconds = ' + videoConfig.startSeconds + ', endSeconds = ' + videoConfig.endSeconds + ', videoMilliSecsPosFlag = ' + (this.videoMilliSecsPosFlag != null ? this.videoMilliSecsPosFlag.getTime() : null) + ', videoSnippetStartMillis = ' + this.videoSnippetStartMillis;
        if (this.get('videoMilliSecsPosSeekTo')) debugMsg += ', [SeekTo]';
        if (this.get('pauseVideoAfterSeekTo')) debugMsg += ', [SeekTo2]';
        if (this.get('videoMilliSecsPosSeekTo3')) debugMsg += ', [SeekTo3]';
        if (this.get('videoMilliSecsPosSeekTo4')) debugMsg += ', [SeekTo4]';
        console.log(debugMsg);
        this.get('player').loadVideoById(videoConfig); // }

        if (!justSeekTo) {
          if (this.videoMilliSecsPosFlag != null) {
            this.set('videoMilliSecsPosFlag', null);
            if (this.videoMilliSecsPosSeekTo3) this.set('pauseVideoAfterSeekTo', true); // if (this.videoMilliSecsPosSeekTo3) this.setProperties({ pauseVideoAfterSeekTo: true, videoMilliSecsPosSeekTo3: false });
          } else {
            // here we only get when played from timecode 0
            this.set('videoMilliSecsPosSeekTo3', true); // this.set('disableControls', true);
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
        let startSeconds = this.get('start') + (this.videoMilliSecsPosFlag == null && this.videoSnippetStartMillis == null ? 0 : (this.videoSnippetStartMillis != null ? this.videoSnippetStartMillis : this.videoMilliSecs) / 1000);
        let duration = Math.floor((this.get('player').getCurrentTime() - startSeconds) * 1000);
        this.set('recordingDuration', duration);
        console.log('stop recording audio-track after ' + duration + ' milliSecs...'); // let left = Math.round((startSeconds - this.start) / (this.end - this.start) * 300);
        // let width = Math.round(duration / ((this.end - this.start) * 1000) * 300);
        // document.getElementById('recordedRange').style="position: relative; z-index: -10; left: "+left+"px; top: -23px; width: "+width+"px; background-color: rgb(100,100,100,0.3);"

        this.renderRecordedRange(startSeconds, duration); // this.set('recording', false);
        // this.set('recorded', true);

        this.setProperties({
          recording: false,
          recorded: true
        }); // TODO: yt-timecode

        const exportWAV = blob => {
          this.set('audioBlob', blob);
          if (this.get('useAudioTag')) this.createDownloadLink(this.set('dubTrackUrl', URL.createObjectURL(blob)));else this.initAudioBuffer(this.set('dubTrackUrl', URL.createObjectURL(blob)));
        };

        if (navigator.userAgent.match(/Chrome/)) {
          this.recordAudio.stop(() => {
            let blob = new Blob(this.recordAudio.getData()
            /*.buffer*/
            , {
              type: this.get('recordAudio.config.mimeType')
            }); // this.set('audioBlob', blob);
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
          this.get('audioRecorder').exportWAV(
          /*(blob) => {
          this.set('audioBlob', blob);
          if (this.get('useAudioTag'))
          this.createDownloadLink(this.set('dubTrackUrl', URL.createObjectURL(blob)));
          else
          this.initAudioBuffer(this.set('dubTrackUrl', URL.createObjectURL(blob)));
          }*/
          exportWAV, this.get('audioRecorder.config.mimeType'));
          this.get('audioRecorder').clear();
        }

        this.player.stopVideo();
      },

      shareVideo() {
        let reader = new window.FileReader();

        reader.onloadend = () => {
          this.set('dubTrackData', reader.result);
          this.uploadDubData(null, dubData => {
            // dubTrackUrl = dubData.dub_track_url
            var dubTrackUrl;
            if (location.search.match(/([?&])dubId=[^&]+/) != null) dubTrackUrl = location.href.replace(/([?&]dubId=)[^&]+/, '$1' + dubData.id);else dubTrackUrl = location.href.replace(/\/new/, '/') + '?dubId=' + dubData.id;
            if (this.get('application.isMobile')) this.set('sharedDubTrackUrls', this.get('sharedDubTrackUrls').concat([{
              videoId: this.get('videoId'),
              dubTrackUrl: dubTrackUrl,
              whatsAppText: encodeURI('DubTrack => ' + dubTrackUrl)
            }]));else this.set('sharedDubTrackUrls', this.get('sharedDubTrackUrls').concat([{
              videoId: this.get('videoId'),
              dubTrackUrl: dubTrackUrl
            }]));
          });
        };

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
        if (this.videoStarted && !this.videoPaused) {
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

        if (this.videoSnippetStartMillis && this.player.getPlayerState() == window.YT.PlayerState.PAUSED && this.orig && videoMilliSecs == this.videoMilliSecs) {
          console.log('setVideoMilliSecs: restarting paused snippet ...'); // play orig preview from videoSnippetStartMillis

          this.set('videoMilliSecsPosSeekTo3', true); // this.set('disableControls', true);

          this.get('player').unMute();
          this.player.playVideo();
          return false;
        }

        if (videoMilliSecs != this.videoMilliSecs) {
          this.setProperties({
            videoMilliSecs: videoMilliSecs,
            videoSnippetStartMillis: videoMilliSecs != 0 ? videoMilliSecs : null
          });

          if (videoMilliSecs == 0) {
            console.log('setVideoMilliSecs: removing video snippet ...'); // this.set('videoMilliSecsPosFlag', new Date()); // will play vid
            // this.setProperties({ videoMilliSecsPosFlag: null, videoMilliSecsPosFlag2: new Date() });

            this.setProperties({
              videoMilliSecsPosFlag: null,
              videoMilliSecsPosFlag2: new Date(),
              // updates posvalue for slider/range-input
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

          console.log('setVideoMilliSecs: new milliSecs = ' + milliSecs + ', videoMilliSecs = ' + this.videoMilliSecs + ', videoStarted = ' + this.videoStarted + ', videoPaused = ' + this.videoPaused); // if (this.videoStarted && this.videoPaused) {
          //   this.setVideoMilliSecsDebounced();
          // } else {

          Ember.run.debounce(this, this.setVideoMilliSecsDebounced, 250); // }
        }

        return false;
      }

    },

    setVideoMilliSecsDebounced() {
      this.set('videoMilliSecsPosFlag', this.videoSnippetStartMillis != null ? new Date() : null);
    },

    renderRecordedRange(startSeconds, duration = null) {
      console.log('renderRecordedRange: startSeconds = ' + startSeconds + ', duration = ' + duration + ', recordingDuration = ' + this.recordingDuration);
      if (duration == null) duration = this.get('recordingDuration');
      let left = Math.round((startSeconds - this.start) / (this.end - this.start) * 300) + 2;
      let width = Math.round(duration / ((this.end - this.start) * 1000) * 300);
      document.getElementById('recordedRange').style = "left: " + left + "px; width: " + width + "px;";
    },

    // audiobuffers can be started only once, so after end we setup next one for replay.
    initAudioBuffer(audioFileUrl) {
      this.set('audioBufferStarted', false);
      this.set('audioBuffer', this.connectAudioSource(audioFileUrl, data => {
        console.log('continue with original audio, videoStarted = ' + this.get('videoStarted') + ', data = ' + JSON.stringify(data)); // if (this.get('videoStarted')) {
        // // this.get('audioBuffer').disconnect()
        // this.set('videoSnippetStartMillis', null);
        // $('#rec_ctrl').attr("disabled", true);

        this.get('player').unMute(); // // this.get('player').setVolume (this.get('volume') || 100)

        return this.initAudioBuffer(audioFileUrl); // }
      }));
    },

    setupYoutubeAPI(autoplay) {
      if (document.getElementById('iframe_api') != null) {
        this.initPlayer(autoplay);
        return;
      } // window.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this);


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
      let start = parseInt(this.get('start')); // console.log('initPlayer: this.start = '+this.get('start'));

      this.set('player', new window.YT.Player('video', {
        width: this.get('playerWidth'),
        height: this.get('playerHeight'),
        videoId: this.hideTitleSecs == null || !this.featurePresentation ? this.get('videoId') : 'rmSK1imravY',
        events: {
          'onReady': this.onYouTubePlayerReady.bind(this),
          'onStateChange': this.onYouTubePlayerStateChange.bind(this)
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
          html5: 1
          /**/
          ,
          autoplay: autoplay ? 1 : 0
        }
      })); // this.set('volume', 100); // this.get('player').getVolume()

      if (this.hideTitleSecs != null && !this.featurePresentation) (0, _jquery.default)('#video').hide();
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
      } // if (this.get('dubSpecReady') && (!this.get('initialPlayed')))
      //   this.send('playVideo', false);
      // else {


      if (this.get('showHowTo') && this.get('audioBuffer') == null) this.send('playVideo', true); // }
    },

    onYouTubePlayerStateChange(event) {
      // try {
      let debugMsg = 'yt-player-state: ' + event.data;
      if (event.data != this.player.getPlayerState()) debugMsg += ',  playerState = ' + this.player.getPlayerState();
      debugMsg += ', videoLoaded = ' + this.get('player').getVideoLoadedFraction() + ', videoStarted = ' + this.get('videoStarted') + ', videoMilliSecsPosFlag = ' + (this.videoMilliSecsPosFlag != null ? this.videoMilliSecsPosFlag.getTime() : null) + ', videoMilliSecsPosFlag2 = ' + (this.videoMilliSecsPosFlag2 != null ? this.videoMilliSecsPosFlag2.getTime() : null);
      if (!this.get('initialPlayed')) debugMsg += ', [FIRSTPLAY]';
      if (!this.get('initialPlayed') && this.fixedFloatStart) debugMsg += ', [fixedFloatStart]';
      if (this.get('orig')) debugMsg += ', [ORIG]';
      if (this.get('recording')) debugMsg += ', [RECORDING]';
      if (this.get('videoMilliSecsPosSeekTo')) debugMsg += ', [SeekTo]';
      if (this.get('pauseVideoAfterSeekTo')) debugMsg += ', [SeekTo2]';
      if (this.get('videoMilliSecsPosSeekTo3')) debugMsg += ', [SeekTo3]';
      if (this.get('videoMilliSecsPosSeekTo4')) debugMsg += ', [SeekTo4]';
      console.log(debugMsg); // } catch (error) {
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
              if (this.set('videoCountdownSecs', this.videoCountdownSecs - 1) > 0) window.setTimeout(() => this.set('videoCountdownSecs',
              /*this.videoCountdownSecs == 1 ? -1 : */
              this.videoCountdownSecs - 1), 1000);
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
            this.set('videoMilliSecsPosSeekTo', false); // this.get('player').unMute();

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

          if (!this.get('initialPlayed')) {
            if (this.get('orig') == null || this.get('orig')) this.set('orig', false); // this.get('player').mute();
          } // $('#play_orig').attr("disabled", true);
          // $('#play_dub').attr("disabled", true);
          // $('#rec_ctrl').attr("disabled", true);


          var stopAudio = this.get('stopAudioCallback');
          if (stopAudio != null && this.get('audioBufferStarted')) stopAudio();
          this.set('videoStarted', true);
          console.log('yt-player started playing, orig = ' + this.get('orig') + ' ...'); // if (this.get('initialPlayed') || this.get('recording'))

          if ((this.get('initialPlayed') || this.get('recording')) && (!this.hideTitleSecs || this.initialPlayedWithHiddenTitle)) window.setTimeout(this.displayVideoMillisCallback('100'), '100');

          if (!this.get('orig')) {
            if (this.get('player').getVideoLoadedFraction() != 0) {
              if (this.get('recording')) {
                this.get('player').mute();
                console.log('start recording audio-track ...');

                if (navigator.userAgent.match(/Chrome/)) {
                  // this.recordAudio.record();
                  // there is som delay in observing recording and videoStarted
                  window.setTimeout(() => this.recordAudio.record(), '200'); // this.recordAudio.start();
                } else {
                  // this.get('audioRecorder').record(300);
                  // there is som delay in observing recording and videoStarted
                  window.setTimeout(() => this.get('audioRecorder').record(300), '200');
                }
              } else {
                if (this.get('dubTrackDelay') <= 0) this._startDubTrack(this.get('innerDubTrackDelay'));else {
                  if (this.videoSnippetStartMillis == null) window.setTimeout(this._startDubTrack.bind(this), this.get('dubTrackDelay'));else this._startDubTrack(this.get('innerDubTrackDelay'));
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
                (0, _jquery.default)('#video').show();
                this.player.setVolume(this.get('initialPlayerVolume'));
              }

              if (this.autoplay) this.send('playVideo', false);
              return;
            } else if (this.videoStarted && this.hideTitleSecs) {
              this.setProperties({
                hideTitleSecs: null,
                initialPlayedWithHiddenTitle: new Date()
              });
            } else {
              return;
            }
          }

          console.log('stopAudioCallback == null: ' + (this.get('stopAudioCallback') == null) + ', recording = ' + this.get('recording') + ', audioBufferStarted = ' + this.get('audioBufferStarted')); // this.audioContext.suspend();

          if (this.get('recording') && this.get('player').getVideoLoadedFraction() != 0) this.send('stopRecording'); // if (this.get('player').getVideoLoadedFraction() == 1) {

          if (!this.get('initialPlayed')) this.set('initialPlayed', true);

          if (this.get('videoStarted')) {
            // if (this.videoSnippetStartMillis == null) this.set('videoMilliSecs', 0);
            if (this.videoSnippetStartMillis == null) {
              if (this.videoMilliSecs != 0) {
                this.set('videoMilliSecs', 0);
                this.set('videoMilliSecsPosFlag2', new Date()); // shows pos-preview by start/pause video
              }

              this.set('videoMilliSecsPosSeekTo3', false); // else this.set('videoMilliSecs', this.videoSnippetStartMillis);
            } else {
              // got to snippet-start for timecode-thumbnail
              this.set('videoMilliSecs', this.videoSnippetStartMillis);
              this.set('videoMilliSecsPosFlag', new Date()); // shows pos-preview by start/pause video
            }
          }

          this.set('videoStarted', false);

          if (this.setMarkerAfterPaused) {
            this.setProperties({
              setMarkerAfterPaused: null,
              pausingVideo: false,
              videoPaused: false
            });
          }

          this.set('disableControls', false);
          this.set('stopAudioCallback', null); // $('#play_orig').attr("disabled", false);
          // $('#play_dub').attr("disabled", false);
          // $('#rec_ctrl').attr("disabled", false);

          this.set('recorded', false);

          if (this.recordingDuration == null
          /* && this.audioBuffer.buffer != null*/
          ) {
              this.set('recordingDuration', this.audioBuffer.buffer.duration * 1000);
              Ember.run.schedule("afterRender", () => this.renderRecordedRange(this.start + this.dubTrackDelay / 1000));
            } // }


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
            this.setProperties({
              pausingVideo: false,
              videoPaused: true
            }); // if (this.orig) $('#play_orig').attr("disabled", false);
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
            if (centiSecs == this.get('videoMilliSecs')) return; // console.log('displayVideoMillisCallback: centiSecs = ' + centiSecs + ', player.currentTime = ' + this.get('player').getCurrentTime());
            // console.log('displayVideoMillisCallback: setting videoMilliSecs to ' + centiSecs);

            this.set('videoMilliSecs', centiSecs);
          }

          if (this.get('player').getCurrentTime() <= this.end) {
            // debounce required or video-end will not be reached
            // debounce(this, () => this.set('videoMilliSecsPosFlag2', new Date()), parseInt(timeoutMillis) + 100);
            if (this.get('videoMilliSecsPosFlag') == null) this.set('videoMilliSecsPosFlag2', new Date());else console.log('displayVideoMillisCallback: videoMilliSecsPosFlag = ' + this.videoMilliSecsPosFlag.getTime());
            window.setTimeout(this.displayVideoMillisCallback(timeoutMillis), timeoutMillis);
          }
        }
      };
    },

    _startDubTrack() {
      // if (this.videoSnippetStartMillis != null && (this.videoSnippetStartMillis + (this.recordingDuration||this.videoSnippetDurationMillis) - this.get('dubTrackDelay')) <= this.get('innerDubTrackDelay')) {
      if (this.get('innerDubTrackDelay') >= 1 && this.videoSnippetStartMillis != null && this.videoSnippetStartMillis + (this.recordingDuration || this.videoSnippetDurationMillis) - this.get('dubTrackDelay') <= this.get('innerDubTrackDelay')) {
        console.log('not playing dub-track if snippet will end befor dub-track ...');
        return;
      } // if (this.get('innerDubTrackDelay') <= 0)


      if (this.get('innerDubTrackDelay') <= 0 || this.videoSnippetStartMillis != null) {
        // this.get('player').mute();
        if (this.videoSnippetStartMillis == null || this.videoSnippetStartMillis >= (this.get('dubTrackDelay') || 0)) this.get('player').mute();
      } else // window.setTimeout(this.get('player').mute.bind(this.get('player')), this.get('innerDubTrackDelay'));
        window.setTimeout(() => this.get('player').mute(), this.get('innerDubTrackDelay'));

      console.log('start playing audio-track; player.startSeconds = ' + this.get('start') + ', player.getCurrentTime = ' + this.get('player').getCurrentTime() + ', audioContext.state = ' + this.audioContext.state + ', audioContext.currentTime = ' + this.audioContext.currentTime + ', dubTrackDelay = ' + this.get('dubTrackDelay') + ', innerDubTrackDelay = ' + this.get('innerDubTrackDelay') + ', videoMilliSecs = ' + this.videoMilliSecs + ', videoSnippetStartMillis = ' + this.videoSnippetStartMillis);

      if (this.get('useAudioTag')) {
        (0, _jquery.default)('audio')[0].currentTime = 0.2; // this.get('player').getCurrentTime() - this.get('start');

        console.log('currentTime = ' + (0, _jquery.default)('audio')[0].currentTime);
        (0, _jquery.default)('audio')[0].play();
      } else {
        // if (this.get('audioBuffer') != null) {
        try {
          if (this.videoSnippetStartMillis != null) {
            // this.get('audioBuffer').start(0, (this.videoSnippetStartMillis - this.get('dubTrackDelay')) / 1000);
            if (this.videoSnippetStartMillis >= this.get('dubTrackDelay')) {
              this.get('audioBuffer').start(0, (this.videoSnippetStartMillis - this.get('dubTrackDelay')) / 1000);
            } else {
              window.setTimeout(() => {
                this.get('player').mute();
                this.get('audioBuffer').start();
              }, this.get('dubTrackDelay') - this.videoSnippetStartMillis);
            }
          } else {
            this.get('audioBuffer').start();
          }
        } catch (error) {
          console.error('error starting audio-recorder: ', error);
          this.set('audioBuffer', null);
          this.initAudioBuffer(this.get('dubTrackUrl'));
        } // }

      }
    },

    connectAudioSource(filePath, callback = null) {
      var audio1 = null;

      if (this.get('audioContext') != null) {
        console.log('setting up audio buffersource with ' + filePath + ', mimeType: ' + ((this.get('audioRecorder') || this.recordAudio).config || {}).mimeType + ' ...');
        audio1 = this.get('audioContext').createBufferSource();
        let bufferLoader = new window.BufferLoader(this.get('audioContext'), [filePath], bufferList => {
          this.set('stopAudioCallback', () => {
            console.log('connectAudioSource: stopAudioCallback > stopping audio ...');
            return audio1.stop(); // audio1.currentTime = 0;
          });
          audio1.buffer = bufferList[0];
          audio1.connect(this.get('audioContext.destination'));

          if (callback != null) {
            audio1.onended = () => {
              console.log('connectAudioSource: onended ...'); // if (this.recordingDuration == null) {
              //   this.set('recordingDuration', audio1.buffer.duration * 1000);
              //   // schedule("afterRender", () => this.initPlayer(false));
              //   this.renderRecordedRange(this.start + this.dubTrackDelay / 1000);
              // }

              return callback({
                msg: 'finished'
              });
            };
          }
        });
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
      let url = (0, _jquery.default)('#publish-url').val();
      this.startWaiting();
      this.get('backendAdapter').request(url, 'POST', formData, null, false, null, false, true).then(response => {
        console.log('response.message OK = ' + response.success);
        callBack(response.dub_data);
        this.stopWaiting();
      }, _error => {
        this.stopWaiting();
        alert('error');
      });
    }

  });

  _exports.default = _default;
});
;define("sparta/controllers/application", ["exports", "sparta/config/environment"], function (_exports, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Controller.extend({
    backendUrlPrefix: _environment.default.APP.backendUrlPrefix,
    isMobile: Ember.computed(function () {
      return navigator.userAgent.match(/Mobile|webOS/) != null;
    })
  });

  _exports.default = _default;
});
;define("sparta/controllers/index", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Controller.extend();

  _exports.default = _default;
});
;define("sparta/controllers/library", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Controller.extend();

  _exports.default = _default;
});
;define("sparta/controllers/new", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Controller.extend();

  _exports.default = _default;
});
;define("sparta/helpers/abs", ["exports", "ember-math-helpers/helpers/abs"], function (_exports, _abs) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _abs.default;
    }
  });
  Object.defineProperty(_exports, "abs", {
    enumerable: true,
    get: function () {
      return _abs.abs;
    }
  });
});
;define("sparta/helpers/acos", ["exports", "ember-math-helpers/helpers/acos"], function (_exports, _acos) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _acos.default;
    }
  });
  Object.defineProperty(_exports, "acos", {
    enumerable: true,
    get: function () {
      return _acos.acos;
    }
  });
});
;define("sparta/helpers/acosh", ["exports", "ember-math-helpers/helpers/acosh"], function (_exports, _acosh) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _acosh.default;
    }
  });
  Object.defineProperty(_exports, "acosh", {
    enumerable: true,
    get: function () {
      return _acosh.acosh;
    }
  });
});
;define("sparta/helpers/add", ["exports", "ember-math-helpers/helpers/add"], function (_exports, _add) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _add.default;
    }
  });
  Object.defineProperty(_exports, "add", {
    enumerable: true,
    get: function () {
      return _add.add;
    }
  });
});
;define("sparta/helpers/and", ["exports", "ember-truth-helpers/helpers/and"], function (_exports, _and) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _and.default;
    }
  });
  Object.defineProperty(_exports, "and", {
    enumerable: true,
    get: function () {
      return _and.and;
    }
  });
});
;define("sparta/helpers/app-version", ["exports", "sparta/config/environment", "ember-cli-app-version/utils/regexp"], function (_exports, _environment, _regexp) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.appVersion = appVersion;
  _exports.default = void 0;

  function appVersion(_, hash = {}) {
    const version = _environment.default.APP.version; // e.g. 1.0.0-alpha.1+4jds75hf
    // Allow use of 'hideSha' and 'hideVersion' For backwards compatibility

    let versionOnly = hash.versionOnly || hash.hideSha;
    let shaOnly = hash.shaOnly || hash.hideVersion;
    let match = null;

    if (versionOnly) {
      if (hash.showExtended) {
        match = version.match(_regexp.versionExtendedRegExp); // 1.0.0-alpha.1
      } // Fallback to just version


      if (!match) {
        match = version.match(_regexp.versionRegExp); // 1.0.0
      }
    }

    if (shaOnly) {
      match = version.match(_regexp.shaRegExp); // 4jds75hf
    }

    return match ? match[0] : version;
  }

  var _default = Ember.Helper.helper(appVersion);

  _exports.default = _default;
});
;define("sparta/helpers/append", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Helper.helper(function (params) {
    var sep;

    if (!(params != null && params.length === 3)) {
      return '';
    }

    sep = params[0].toString().length >= 1 && params[1].toString().length >= 1 ? params[2] : '';
    return new Ember.String.htmlSafe(params[0].toString() + sep + params[1].toString());
  });

  _exports.default = _default;
});
;define("sparta/helpers/asin", ["exports", "ember-math-helpers/helpers/asin"], function (_exports, _asin) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _asin.default;
    }
  });
  Object.defineProperty(_exports, "asin", {
    enumerable: true,
    get: function () {
      return _asin.asin;
    }
  });
});
;define("sparta/helpers/asinh", ["exports", "ember-math-helpers/helpers/asinh"], function (_exports, _asinh) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _asinh.default;
    }
  });
  Object.defineProperty(_exports, "asinh", {
    enumerable: true,
    get: function () {
      return _asinh.asinh;
    }
  });
});
;define("sparta/helpers/atan", ["exports", "ember-math-helpers/helpers/atan"], function (_exports, _atan) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _atan.default;
    }
  });
  Object.defineProperty(_exports, "atan", {
    enumerable: true,
    get: function () {
      return _atan.atan;
    }
  });
});
;define("sparta/helpers/atan2", ["exports", "ember-math-helpers/helpers/atan2"], function (_exports, _atan) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _atan.default;
    }
  });
  Object.defineProperty(_exports, "atan2", {
    enumerable: true,
    get: function () {
      return _atan.atan2;
    }
  });
});
;define("sparta/helpers/atanh", ["exports", "ember-math-helpers/helpers/atanh"], function (_exports, _atanh) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _atanh.default;
    }
  });
  Object.defineProperty(_exports, "atanh", {
    enumerable: true,
    get: function () {
      return _atanh.atanh;
    }
  });
});
;define("sparta/helpers/cbrt", ["exports", "ember-math-helpers/helpers/cbrt"], function (_exports, _cbrt) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _cbrt.default;
    }
  });
  Object.defineProperty(_exports, "cbrt", {
    enumerable: true,
    get: function () {
      return _cbrt.cbrt;
    }
  });
});
;define("sparta/helpers/ceil", ["exports", "ember-math-helpers/helpers/ceil"], function (_exports, _ceil) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _ceil.default;
    }
  });
  Object.defineProperty(_exports, "ceil", {
    enumerable: true,
    get: function () {
      return _ceil.ceil;
    }
  });
});
;define("sparta/helpers/clz32", ["exports", "ember-math-helpers/helpers/clz32"], function (_exports, _clz) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _clz.default;
    }
  });
  Object.defineProperty(_exports, "clz32", {
    enumerable: true,
    get: function () {
      return _clz.clz32;
    }
  });
});
;define("sparta/helpers/cos", ["exports", "ember-math-helpers/helpers/cos"], function (_exports, _cos) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _cos.default;
    }
  });
  Object.defineProperty(_exports, "cos", {
    enumerable: true,
    get: function () {
      return _cos.cos;
    }
  });
});
;define("sparta/helpers/cosh", ["exports", "ember-math-helpers/helpers/cosh"], function (_exports, _cosh) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _cosh.default;
    }
  });
  Object.defineProperty(_exports, "cosh", {
    enumerable: true,
    get: function () {
      return _cosh.cosh;
    }
  });
});
;define("sparta/helpers/div", ["exports", "ember-math-helpers/helpers/div"], function (_exports, _div) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _div.default;
    }
  });
  Object.defineProperty(_exports, "div", {
    enumerable: true,
    get: function () {
      return _div.div;
    }
  });
});
;define("sparta/helpers/eq", ["exports", "ember-truth-helpers/helpers/equal"], function (_exports, _equal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _equal.default;
    }
  });
  Object.defineProperty(_exports, "equal", {
    enumerable: true,
    get: function () {
      return _equal.equal;
    }
  });
});
;define("sparta/helpers/exp", ["exports", "ember-math-helpers/helpers/exp"], function (_exports, _exp) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _exp.default;
    }
  });
  Object.defineProperty(_exports, "exp", {
    enumerable: true,
    get: function () {
      return _exp.exp;
    }
  });
});
;define("sparta/helpers/expm1", ["exports", "ember-math-helpers/helpers/expm1"], function (_exports, _expm) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _expm.default;
    }
  });
  Object.defineProperty(_exports, "expm1", {
    enumerable: true,
    get: function () {
      return _expm.expm1;
    }
  });
});
;define("sparta/helpers/floor", ["exports", "ember-math-helpers/helpers/floor"], function (_exports, _floor) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _floor.default;
    }
  });
  Object.defineProperty(_exports, "floor", {
    enumerable: true,
    get: function () {
      return _floor.floor;
    }
  });
});
;define("sparta/helpers/format-float", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.formatFloat = formatFloat;
  _exports.default = void 0;

  // format 2 digits
  function formatFloat(params, _hash) {
    return ('' + Math.round(params[0] * 100) * 10 / 1000).replace(/(\...).$/, '$1').replace(/(\..)$/, '$10').replace(/([^.]{3})$/, '$1.00').replace(/(.)(...\...)$/, '$1.$2')
    /*.replace(/\.(..)$/, ',$1')*/
    .replace(/^(-?)\./, '$1').replace(/^([^.]+)$/, '$1.00');
  }

  var _default = Ember.Helper.helper(formatFloat);

  _exports.default = _default;
});
;define("sparta/helpers/format-secs", ["exports", "moment"], function (_exports, _moment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.formatSecs = formatSecs;
  _exports.default = void 0;

  // format secs to hh:mm:ss
  function formatSecs(params, _hash) {
    let secs = params[0];
    let formatJoin = [];

    if (secs >= 60 * 60) {
      formatJoin.push(secs / 60 / 60);
      secs -= secs % (60 * 60);
    }

    if (formatJoin.length >= 1 || secs >= 60) {
      formatJoin.push(secs / 60);
      secs -= secs % 60;
    }

    formatJoin.push(secs / 60);
    return formatJoin.join(':');
  }

  var _default = Ember.Helper.helper(formatSecs);

  _exports.default = _default;
});
;define("sparta/helpers/fround", ["exports", "ember-math-helpers/helpers/fround"], function (_exports, _fround) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _fround.default;
    }
  });
  Object.defineProperty(_exports, "fround", {
    enumerable: true,
    get: function () {
      return _fround.fround;
    }
  });
});
;define("sparta/helpers/gcd", ["exports", "ember-math-helpers/helpers/gcd"], function (_exports, _gcd) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _gcd.default;
    }
  });
  Object.defineProperty(_exports, "gcd", {
    enumerable: true,
    get: function () {
      return _gcd.gcd;
    }
  });
});
;define("sparta/helpers/gt", ["exports", "ember-truth-helpers/helpers/gt"], function (_exports, _gt) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _gt.default;
    }
  });
  Object.defineProperty(_exports, "gt", {
    enumerable: true,
    get: function () {
      return _gt.gt;
    }
  });
});
;define("sparta/helpers/gte", ["exports", "ember-truth-helpers/helpers/gte"], function (_exports, _gte) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _gte.default;
    }
  });
  Object.defineProperty(_exports, "gte", {
    enumerable: true,
    get: function () {
      return _gte.gte;
    }
  });
});
;define("sparta/helpers/hypot", ["exports", "ember-math-helpers/helpers/hypot"], function (_exports, _hypot) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _hypot.default;
    }
  });
  Object.defineProperty(_exports, "hypot", {
    enumerable: true,
    get: function () {
      return _hypot.hypot;
    }
  });
});
;define("sparta/helpers/imul", ["exports", "ember-math-helpers/helpers/imul"], function (_exports, _imul) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _imul.default;
    }
  });
  Object.defineProperty(_exports, "imul", {
    enumerable: true,
    get: function () {
      return _imul.imul;
    }
  });
});
;define("sparta/helpers/inc", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.inc = inc;
  _exports.default = void 0;

  // increase with numbers, include/append with strings is abuse
  function inc(params, _hash) {
    return params[0] + (params[1] || 1);
  }

  var _default = Ember.Helper.helper(inc);

  _exports.default = _default;
});
;define("sparta/helpers/is-after", ["exports", "ember-moment/helpers/is-after"], function (_exports, _isAfter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isAfter.default;
    }
  });
});
;define("sparta/helpers/is-array", ["exports", "ember-truth-helpers/helpers/is-array"], function (_exports, _isArray) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isArray.default;
    }
  });
  Object.defineProperty(_exports, "isArray", {
    enumerable: true,
    get: function () {
      return _isArray.isArray;
    }
  });
});
;define("sparta/helpers/is-before", ["exports", "ember-moment/helpers/is-before"], function (_exports, _isBefore) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isBefore.default;
    }
  });
});
;define("sparta/helpers/is-between", ["exports", "ember-moment/helpers/is-between"], function (_exports, _isBetween) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isBetween.default;
    }
  });
});
;define("sparta/helpers/is-empty", ["exports", "ember-truth-helpers/helpers/is-empty"], function (_exports, _isEmpty) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isEmpty.default;
    }
  });
});
;define("sparta/helpers/is-equal", ["exports", "ember-truth-helpers/helpers/is-equal"], function (_exports, _isEqual) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isEqual.default;
    }
  });
  Object.defineProperty(_exports, "isEqual", {
    enumerable: true,
    get: function () {
      return _isEqual.isEqual;
    }
  });
});
;define("sparta/helpers/is-same-or-after", ["exports", "ember-moment/helpers/is-same-or-after"], function (_exports, _isSameOrAfter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isSameOrAfter.default;
    }
  });
});
;define("sparta/helpers/is-same-or-before", ["exports", "ember-moment/helpers/is-same-or-before"], function (_exports, _isSameOrBefore) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isSameOrBefore.default;
    }
  });
});
;define("sparta/helpers/is-same", ["exports", "ember-moment/helpers/is-same"], function (_exports, _isSame) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isSame.default;
    }
  });
});
;define("sparta/helpers/lcm", ["exports", "ember-math-helpers/helpers/lcm"], function (_exports, _lcm) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _lcm.default;
    }
  });
  Object.defineProperty(_exports, "lcm", {
    enumerable: true,
    get: function () {
      return _lcm.lcm;
    }
  });
});
;define("sparta/helpers/log-e", ["exports", "ember-math-helpers/helpers/log-e"], function (_exports, _logE) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _logE.default;
    }
  });
  Object.defineProperty(_exports, "logE", {
    enumerable: true,
    get: function () {
      return _logE.logE;
    }
  });
});
;define("sparta/helpers/log10", ["exports", "ember-math-helpers/helpers/log10"], function (_exports, _log) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _log.default;
    }
  });
  Object.defineProperty(_exports, "log10", {
    enumerable: true,
    get: function () {
      return _log.log10;
    }
  });
});
;define("sparta/helpers/log1p", ["exports", "ember-math-helpers/helpers/log1p"], function (_exports, _log1p) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _log1p.default;
    }
  });
  Object.defineProperty(_exports, "log1p", {
    enumerable: true,
    get: function () {
      return _log1p.log1p;
    }
  });
});
;define("sparta/helpers/log2", ["exports", "ember-math-helpers/helpers/log2"], function (_exports, _log) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _log.default;
    }
  });
  Object.defineProperty(_exports, "log2", {
    enumerable: true,
    get: function () {
      return _log.log2;
    }
  });
});
;define("sparta/helpers/lt", ["exports", "ember-truth-helpers/helpers/lt"], function (_exports, _lt) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _lt.default;
    }
  });
  Object.defineProperty(_exports, "lt", {
    enumerable: true,
    get: function () {
      return _lt.lt;
    }
  });
});
;define("sparta/helpers/lte", ["exports", "ember-truth-helpers/helpers/lte"], function (_exports, _lte) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _lte.default;
    }
  });
  Object.defineProperty(_exports, "lte", {
    enumerable: true,
    get: function () {
      return _lte.lte;
    }
  });
});
;define("sparta/helpers/max", ["exports", "ember-math-helpers/helpers/max"], function (_exports, _max) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _max.default;
    }
  });
  Object.defineProperty(_exports, "max", {
    enumerable: true,
    get: function () {
      return _max.max;
    }
  });
});
;define("sparta/helpers/min", ["exports", "ember-math-helpers/helpers/min"], function (_exports, _min) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _min.default;
    }
  });
  Object.defineProperty(_exports, "min", {
    enumerable: true,
    get: function () {
      return _min.min;
    }
  });
});
;define("sparta/helpers/mod", ["exports", "ember-math-helpers/helpers/mod"], function (_exports, _mod) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _mod.default;
    }
  });
  Object.defineProperty(_exports, "mod", {
    enumerable: true,
    get: function () {
      return _mod.mod;
    }
  });
});
;define("sparta/helpers/moment-add", ["exports", "ember-moment/helpers/moment-add"], function (_exports, _momentAdd) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentAdd.default;
    }
  });
});
;define("sparta/helpers/moment-calendar", ["exports", "ember-moment/helpers/moment-calendar"], function (_exports, _momentCalendar) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentCalendar.default;
    }
  });
});
;define("sparta/helpers/moment-diff", ["exports", "ember-moment/helpers/moment-diff"], function (_exports, _momentDiff) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentDiff.default;
    }
  });
});
;define("sparta/helpers/moment-duration", ["exports", "ember-moment/helpers/moment-duration"], function (_exports, _momentDuration) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentDuration.default;
    }
  });
});
;define("sparta/helpers/moment-format", ["exports", "ember-moment/helpers/moment-format"], function (_exports, _momentFormat) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentFormat.default;
    }
  });
});
;define("sparta/helpers/moment-from-now", ["exports", "ember-moment/helpers/moment-from-now"], function (_exports, _momentFromNow) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentFromNow.default;
    }
  });
});
;define("sparta/helpers/moment-from", ["exports", "ember-moment/helpers/moment-from"], function (_exports, _momentFrom) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentFrom.default;
    }
  });
});
;define("sparta/helpers/moment-subtract", ["exports", "ember-moment/helpers/moment-subtract"], function (_exports, _momentSubtract) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentSubtract.default;
    }
  });
});
;define("sparta/helpers/moment-to-date", ["exports", "ember-moment/helpers/moment-to-date"], function (_exports, _momentToDate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentToDate.default;
    }
  });
});
;define("sparta/helpers/moment-to-now", ["exports", "ember-moment/helpers/moment-to-now"], function (_exports, _momentToNow) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentToNow.default;
    }
  });
});
;define("sparta/helpers/moment-to", ["exports", "ember-moment/helpers/moment-to"], function (_exports, _momentTo) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _momentTo.default;
    }
  });
});
;define("sparta/helpers/moment-unix", ["exports", "ember-moment/helpers/unix"], function (_exports, _unix) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _unix.default;
    }
  });
});
;define("sparta/helpers/moment", ["exports", "ember-moment/helpers/moment"], function (_exports, _moment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _moment.default;
    }
  });
});
;define("sparta/helpers/mult", ["exports", "ember-math-helpers/helpers/mult"], function (_exports, _mult) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _mult.default;
    }
  });
  Object.defineProperty(_exports, "mult", {
    enumerable: true,
    get: function () {
      return _mult.mult;
    }
  });
});
;define("sparta/helpers/not-eq", ["exports", "ember-truth-helpers/helpers/not-equal"], function (_exports, _notEqual) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _notEqual.default;
    }
  });
  Object.defineProperty(_exports, "notEq", {
    enumerable: true,
    get: function () {
      return _notEqual.notEq;
    }
  });
});
;define("sparta/helpers/not", ["exports", "ember-truth-helpers/helpers/not"], function (_exports, _not) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _not.default;
    }
  });
  Object.defineProperty(_exports, "not", {
    enumerable: true,
    get: function () {
      return _not.not;
    }
  });
});
;define("sparta/helpers/now", ["exports", "ember-moment/helpers/now"], function (_exports, _now) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _now.default;
    }
  });
});
;define("sparta/helpers/or", ["exports", "ember-truth-helpers/helpers/or"], function (_exports, _or) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _or.default;
    }
  });
  Object.defineProperty(_exports, "or", {
    enumerable: true,
    get: function () {
      return _or.or;
    }
  });
});
;define("sparta/helpers/pluralize", ["exports", "ember-inflector/lib/helpers/pluralize"], function (_exports, _pluralize) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _pluralize.default;
  _exports.default = _default;
});
;define("sparta/helpers/pow", ["exports", "ember-math-helpers/helpers/pow"], function (_exports, _pow) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _pow.default;
    }
  });
  Object.defineProperty(_exports, "pow", {
    enumerable: true,
    get: function () {
      return _pow.pow;
    }
  });
});
;define("sparta/helpers/random", ["exports", "ember-math-helpers/helpers/random"], function (_exports, _random) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _random.default;
    }
  });
  Object.defineProperty(_exports, "random", {
    enumerable: true,
    get: function () {
      return _random.random;
    }
  });
});
;define("sparta/helpers/range", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.range = range;
  _exports.default = void 0;

  // increase with numbers, include/append with strings is abuse
  function range(params, _hash) {
    // (i for i in [params[0]..params[1]-(if params[2] then 1 else 0)] by (params[3]||1))
    let range = [];

    for (var i = params[0]; i <= params[1] - (params[2] ? 1 : 0); i += params[3] || 1) {
      range.push(i);
    }

    return range;
  }

  var _default = Ember.Helper.helper(range);

  _exports.default = _default;
});
;define("sparta/helpers/round", ["exports", "ember-math-helpers/helpers/round"], function (_exports, _round) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _round.default;
    }
  });
  Object.defineProperty(_exports, "round", {
    enumerable: true,
    get: function () {
      return _round.round;
    }
  });
});
;define("sparta/helpers/sign", ["exports", "ember-math-helpers/helpers/sign"], function (_exports, _sign) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _sign.default;
    }
  });
  Object.defineProperty(_exports, "sign", {
    enumerable: true,
    get: function () {
      return _sign.sign;
    }
  });
});
;define("sparta/helpers/sin", ["exports", "ember-math-helpers/helpers/sin"], function (_exports, _sin) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _sin.default;
    }
  });
  Object.defineProperty(_exports, "sin", {
    enumerable: true,
    get: function () {
      return _sin.sin;
    }
  });
});
;define("sparta/helpers/singularize", ["exports", "ember-inflector/lib/helpers/singularize"], function (_exports, _singularize) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _singularize.default;
  _exports.default = _default;
});
;define("sparta/helpers/sqrt", ["exports", "ember-math-helpers/helpers/sqrt"], function (_exports, _sqrt) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _sqrt.default;
    }
  });
  Object.defineProperty(_exports, "sqrt", {
    enumerable: true,
    get: function () {
      return _sqrt.sqrt;
    }
  });
});
;define("sparta/helpers/sub", ["exports", "ember-math-helpers/helpers/sub"], function (_exports, _sub) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _sub.default;
    }
  });
  Object.defineProperty(_exports, "sub", {
    enumerable: true,
    get: function () {
      return _sub.sub;
    }
  });
});
;define("sparta/helpers/tan", ["exports", "ember-math-helpers/helpers/tan"], function (_exports, _tan) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _tan.default;
    }
  });
  Object.defineProperty(_exports, "tan", {
    enumerable: true,
    get: function () {
      return _tan.tan;
    }
  });
});
;define("sparta/helpers/tanh", ["exports", "ember-math-helpers/helpers/tanh"], function (_exports, _tanh) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _tanh.default;
    }
  });
  Object.defineProperty(_exports, "tanh", {
    enumerable: true,
    get: function () {
      return _tanh.tanh;
    }
  });
});
;define("sparta/helpers/trunc", ["exports", "ember-math-helpers/helpers/trunc"], function (_exports, _trunc) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _trunc.default;
    }
  });
  Object.defineProperty(_exports, "trunc", {
    enumerable: true,
    get: function () {
      return _trunc.trunc;
    }
  });
});
;define("sparta/helpers/unix", ["exports", "ember-moment/helpers/unix"], function (_exports, _unix) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _unix.default;
    }
  });
});
;define("sparta/helpers/utc", ["exports", "ember-moment/helpers/utc"], function (_exports, _utc) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _utc.default;
    }
  });
  Object.defineProperty(_exports, "utc", {
    enumerable: true,
    get: function () {
      return _utc.utc;
    }
  });
});
;define("sparta/helpers/whatsapp-text", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Helper.helper(function (params) {
    if (!(params != null && params.length === 1)) {
      return '';
    }

    return new Ember.String.htmlSafe(encodeURI('DubTrack => ' + params[0]));
  });

  _exports.default = _default;
});
;define("sparta/helpers/xor", ["exports", "ember-truth-helpers/helpers/xor"], function (_exports, _xor) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _xor.default;
    }
  });
  Object.defineProperty(_exports, "xor", {
    enumerable: true,
    get: function () {
      return _xor.xor;
    }
  });
});
;define("sparta/initializers/app-version", ["exports", "ember-cli-app-version/initializer-factory", "sparta/config/environment"], function (_exports, _initializerFactory, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  let name, version;

  if (_environment.default.APP) {
    name = _environment.default.APP.name;
    version = _environment.default.APP.version;
  }

  var _default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
  _exports.default = _default;
});
;define("sparta/initializers/component-router-injector", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var CRIInit;
  CRIInit = {
    name: 'component-router-injector',
    initialize: function (application) {
      return application.inject('component', 'router', 'router:main');
    }
  };
  var _default = CRIInit;
  _exports.default = _default;
});
;define("sparta/initializers/container-debug-adapter", ["exports", "ember-resolver/resolvers/classic/container-debug-adapter"], function (_exports, _containerDebugAdapter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    name: 'container-debug-adapter',

    initialize() {
      let app = arguments[1] || arguments[0];
      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }

  };
  _exports.default = _default;
});
;define("sparta/initializers/ember-data", ["exports", "ember-data/setup-container"], function (_exports, _setupContainer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    ```app/services/store.js
    import DS from 'ember-data';
  
    export default DS.Store.extend({
      adapter: 'custom'
    });
    ```
  
    ```app/controllers/posts.js
    import { Controller } from '@ember/controller';
  
    export default Controller.extend({
      // ...
    });
  
    When the application is initialized, `ApplicationStore` will automatically be
    instantiated, and the instance of `PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */
  var _default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
  _exports.default = _default;
});
;define("sparta/initializers/export-application-global", ["exports", "sparta/config/environment"], function (_exports, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.initialize = initialize;
  _exports.default = void 0;

  function initialize() {
    var application = arguments[1] || arguments[0];

    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;

      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;
        application.reopen({
          willDestroy: function () {
            this._super.apply(this, arguments);

            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  var _default = {
    name: 'export-application-global',
    initialize: initialize
  };
  _exports.default = _default;
});
;define("sparta/instance-initializers/ember-data", ["exports", "ember-data/initialize-store-service"], function (_exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    name: 'ember-data',
    initialize: _initializeStoreService.default
  };
  _exports.default = _default;
});
;define("sparta/mixins/clipboard-actor", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Mixin.create({
    actions: {
      copyToClipboard: function (selector) {
        var copyDatainput;
        copyDatainput = document.querySelector(selector);
        copyDatainput.select();
        return document.execCommand('copy');
      }
    }
  });

  _exports.default = _default;
});
;define("sparta/mixins/loading-indicator", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Mixin.create({
    startWaiting: function () {
      return $('html').addClass('busy');
    },
    stopWaiting: function () {
      return $('html').removeClass('busy');
    }
  });

  _exports.default = _default;
});
;define("sparta/mixins/player-route-deactivator", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Mixin.create({
    application: function () {
      return Ember.getOwner(this).lookup('controller:application');
    }.property(),
    deactivate: function () {
      this._super();

      if (this.get('application.sTC.player') != null) {
        this.get('application.sTC.player').destroy();
      }

      return true;
    }
  });

  _exports.default = _default;
});
;define("sparta/resolver", ["exports", "ember-resolver"], function (_exports, _emberResolver) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _emberResolver.default;
  _exports.default = _default;
});
;define("sparta/router", ["exports", "sparta/config/environment"], function (_exports, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const Router = Ember.Router.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL
  });
  Router.map(function () {
    this.route('new', {
      path: '/new'
    });
    this.route('library', {
      path: '/library'
    });
  });
  var _default = Router;
  _exports.default = _default;
});
;define("sparta/routes/base", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Route.extend({
    deactivate: function () {
      this._super();

      return true;
    }
  });

  _exports.default = _default;
});
;define("sparta/routes/index", ["exports", "sparta/mixins/player-route-deactivator"], function (_exports, _playerRouteDeactivator) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Route.extend(_playerRouteDeactivator.default, {
    model: function () {
      return {
        todo: 'load user environment'
      };
    }
  });

  _exports.default = _default;
});
;define("sparta/routes/library", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Route.extend({
    model: function () {
      return {
        todo: 'load user environment'
      };
    }
  });

  _exports.default = _default;
});
;define("sparta/routes/new", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Route.extend({
    model: function () {
      return {
        todo: 'load user environment'
      };
    }
  });

  _exports.default = _default;
});
;define("sparta/services/ajax", ["exports", "ember-ajax/services/ajax"], function (_exports, _ajax) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _ajax.default;
    }
  });
});
;define("sparta/services/backend-adapter", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  // import { A } from '@ember/array';
  var _default = Ember.Service.extend({
    ajax: Ember.inject.service(),
    // session: service(),
    application: Ember.computed(function () {
      return Ember.getOwner(this).lookup('controller:application');
    }),

    // callbackContext ... {context: ..., success: (data) ->, error: (error) ->}
    // request: (url, method, params = null, headers = {}, isJson = true, callbackContext = null) ->
    request(url, method, params, headers, isJson, callbackContext, noAuth, crossDomain) {
      noAuth = noAuth || false;
      if (typeof isJson == "undefined") isJson = true; // console.log('BackendAdapter - request: url = ' + url + ', method = ' + method + ', callbackContext? = '+(callbackContext!=null));

      return this._promise(url, method, params, headers || {}, isJson, callbackContext, noAuth, this.ajax, crossDomain);
    },

    _promise(url, method, params, headers, isJson, callbackContext, noAuth, ajax, crossDomain) {
      let promise = new Ember.RSVP.Promise((resolve, reject) => {
        // console.log 'BackendAdapter - setup request ...'
        let options = {};
        if (crossDomain) options.crossDomain = true;

        if (params != null) {
          if (isJson) options.data = JSON.stringify(params);else {
            options.data = params;
            options.cache = false;
            options.contentType = false;
            options.processData = false;
          }
        }

        if (!noAuth && headers != null && headers['Authorization'] == null && this.get('session.session.content.authenticated.access_token') != null) headers['Authorization'] = `Bearer ${this.get('session.session.content.authenticated.access_token')}`;

        if (isJson) {
          headers['Content-Type'] = 'application/json';
          options.headers = headers;
        }

        options.beforeSend = request => {
          for (let hName of Object.keys(headers)) request.setRequestHeader(hName, headers[hName]);
        }; // if window.RAILS_ENV? && window.RAILS_ENV == 'test'
        //   if method.trim().toLowerCase() == 'patch'
        //     options.method = 'POST'
        //     params._method = 'PATCH'
        //   else
        //     options.method = method
        // else


        options.method = method;
        if (isJson) options.dataType = 'json'; // expect json-response
        // options.crossDomain = true

        options.success = data => {
          if (data.type == 'auth_challenge') {
            // this.router.transitionTo('auth.login');
            this.get('application').on401(headers, data, params);
            return true;
          }

          if (data.success != null && !data.success) reject(data);else resolve(data);
        };

        options.error = error => {
          if (error.responseJSON != null) reject(error.responseJSON);else if (error.responseText != null) reject({
            error: "Internal Server Error"
          }); // error.responseText });
          else reject(error);
        };

        if (callbackContext != null) {
          options.success = callbackContext.success.bind(callbackContext.context);
          options.error = callbackContext.error.bind(callbackContext.context);
        } // Ember.$.ajax url, options
        // let response = await fetch(url);


        return ajax.request(url, options);
      });

      if (callbackContext != null) {
        promise.then(callbackContext.success, callbackContext.error);
        return true;
      } else return promise;
    }

  });

  _exports.default = _default;
});
;define("sparta/services/moment", ["exports", "ember-moment/services/moment", "sparta/config/environment"], function (_exports, _moment, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const {
    get
  } = Ember;

  var _default = _moment.default.extend({
    defaultFormat: get(_environment.default, 'moment.outputFormat')
  });

  _exports.default = _default;
});
;define("sparta/services/record-audio", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Service.extend({
    audioContext: null,
    config: null,
    bufferLen: -1,
    numChannels: -1,
    recordBuffers: Ember.computed(function () {
      return [];
    }),
    recording: Ember.computed('curVideoSelector', 'resetMediaInputFlag', function () {
      return false;
    }),
    shouldStop: false,
    stopped: false,

    setupMediaRecorder(stream, cfg) {
      const config = this.set('config', {
        mimeType: cfg.mimeType || 'audio/webm',
        bufferLen: cfg.bufferLen || 8192,
        // 4096
        numChannels: cfg.numChannels || 2
      });
      const mediaRecorder = this.set('mediaRecorder', new MediaRecorder(stream, config));
      const recordedChunks = this.get('recordBuffers') || this.set('recordBuffers', Ember.A([]));

      mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }

        if (this.shouldStop === true && this.stopped === false) {
          this.set('stopped', true);
          mediaRecorder.stop();
          this.get('stoppedRecordingCallback')();
        } else if (!this.stopped) {
          mediaRecorder.requestData();
        }
      };

      return mediaRecorder;
    },

    getData() {
      let tmp = this.get('recordBuffers').toArray(); // console.log('recordAudio - getData: recordBuffers.length = ' + tmp.length + ', shouldStop = ' + this.shouldStop + ', stopped = ' + this.stopped + ', this.mediaRecorder.state = '+this.mediaRecorder.state);

      this.get('recordBuffers').clear();
      return tmp; // returns an array of array containing data from various channels
    },

    /*async */
    record() {
      this.setProperties({
        shouldStop: false,
        stopped: false,
        recording: true
      });
      console.log('recordAudio - record: this.mediaRecorder.state = ' + this.mediaRecorder.state); // this.mediaRecorder.state == 'recording'

      if (this.mediaRecorder.state != 'inactive') this.mediaRecorder.stop();
      this.mediaRecorder.start();
      this.mediaRecorder.requestData();
    },

    start() {
      return this.set('recording', true);
    },

    stop(stoppedRecordingCallback) {
      this.setProperties({
        shouldStop: true,
        recording: false,
        stoppedRecordingCallback: stoppedRecordingCallback
      });
      return this.set('recording', false);
    } // ,
    // newTrack(stream, cfg) {
    //   this.set('config', cfg || {});
    //   this.set('bufferLen', this.get('config.bufferLen') || 8192);
    //   this.set('numChannels', this.get('config.numChannels') || 2); // 2
    //
    //   let input = this.get('audioContext').createMediaStreamSource(stream);
    //   let processor = this.get('audioContext').createScriptProcessor(1024,1,1);
    //
    //   input.connect(processor);
    //   processor.connect(this.get('audioContext.destination'));
    //
    //   processor.onaudioprocess = (e) => {
    //       if (!this.get('recording'))
    //         return;
    //       for (let i=0 ; i<(this.get('numChannels') - 1) ; i++) {
    //         if ((recordBuffers = this.get('recordBuffers'))[i] == null) {
    //           recordBuffers.splice(i, 0, []);
    //           this.set('recordBuffers', recordBuffers);
    //         };
    //         console.log('recording ...');
    //         this.get('recordBuffers')[i].push.apply(this.get('recordBuffers')[i], e.inputBuffer.getChannelData(i));
    //       }
    //   };
    //   return stream;
    // }


  });

  _exports.default = _default;
});
;define("sparta/templates/application", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "DN8koDbZ",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"id\",\"top-nav\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"class\",\"top-nav-button\"],[9],[4,\"link-to\",null,[[\"class\",\"route\"],[\"top-nav-button\",\"index\"]],{\"statements\":[[0,\"home\"]],\"parameters\":[]},null],[10],[0,\"\\n  \"],[7,\"span\"],[11,\"class\",\"top-nav-button\"],[9],[4,\"link-to\",null,[[\"class\",\"route\"],[\"top-nav-button\",\"library\"]],{\"statements\":[[0,\"library\"]],\"parameters\":[]},null],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"input\"],[11,\"id\",\"publish-url\"],[12,\"value\",[30,[[23,\"backendUrlPrefix\"],\"/dub_track\"]]],[11,\"type\",\"hidden\"],[9],[10],[0,\"\\n\"],[7,\"input\"],[11,\"id\",\"dub-data-url\"],[12,\"value\",[30,[[23,\"backendUrlPrefix\"],\"/dub_track/:dubId\"]]],[11,\"type\",\"hidden\"],[9],[10],[0,\"\\n\"],[7,\"input\"],[11,\"id\",\"dub-list-url\"],[12,\"value\",[30,[[23,\"backendUrlPrefix\"],\"/dub_track_list\"]]],[11,\"type\",\"hidden\"],[9],[10],[0,\"\\n\"],[1,[23,\"outlet\"],false],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "sparta/templates/application.hbs"
    }
  });

  _exports.default = _default;
});
;define("sparta/templates/components/dub-track-library", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "DAruPeG8",
    "block": "{\"symbols\":[\"dubTrack\",\"idx\",\"&default\"],\"statements\":[[15,3],[0,\"\\n\\n\"],[4,\"each\",[[25,[\"dubTrackList\"]]],null,{\"statements\":[[7,\"img\"],[11,\"style\",\"border; 0px;\"],[12,\"src\",[30,[\"https://img.youtube.com/vi/\",[24,1,[\"videoId\"]],\"/default.jpg\"]]],[9],[10],[0,\" -\\n\"],[4,\"if\",[[25,[\"application\",\"isMobile\"]]],null,{\"statements\":[[7,\"a\"],[12,\"href\",[30,[\"whatsapp://send?text=\",[29,\"whatsapp-text\",[[24,1,[\"dubTrackUrl\"]]],null]]]],[11,\"data-action\",\"share/whatsapp/share\"],[9],[0,\"Share via Whatsapp\"],[10],[0,\" or\\n\"]],\"parameters\":[]},null],[7,\"a\"],[12,\"href\",[30,[[24,1,[\"dubTrackUrl\"]]]]],[11,\"target\",\"dubTrack\"],[9],[7,\"input\"],[11,\"readonly\",\"\"],[12,\"id\",[30,[\"share_\",[24,2,[]]]]],[12,\"value\",[30,[[24,1,[\"dubTrackUrl\"]]]]],[11,\"style\",\"width: 300px; border: 0px; color: blue;\"],[9],[10],[10],[0,\"\\n\"],[7,\"button\"],[11,\"type\",\"button\"],[9],[0,\"Copy Link to Clipboard\"],[3,\"action\",[[24,0,[]],\"copyToClipboard\",[29,\"append\",[\"#share\",[24,2,[]],\"_\"],null]]],[10],[0,\"\\n\"],[7,\"br\"],[9],[10],[0,\"\\n\"]],\"parameters\":[1,2]},null]],\"hasEval\":false}",
    "meta": {
      "moduleName": "sparta/templates/components/dub-track-library.hbs"
    }
  });

  _exports.default = _default;
});
;define("sparta/templates/components/how-to", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "lsbKD832",
    "block": "{\"symbols\":[],\"statements\":[[4,\"if\",[[29,\"eq\",[[25,[\"currentStep\"]],1],null]],null,{\"statements\":[[0,\"  \"],[7,\"h3\"],[9],[0,\"\\n    Schritt \"],[1,[23,\"currentStep\"],false],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-left: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Weiter\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],1],null]]],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"isMobile\"]]],null,{\"statements\":[[0,\"  Wähle ein Video mit der gewünschten Filmszene auf \"],[7,\"a\"],[11,\"href\",\"https://www.youtu.be/\"],[11,\"target\",\"top\"],[9],[0,\"Youtube\"],[10],[0,\" aus und kopiere die Url über die \"],[7,\"i\"],[9],[0,\"Teilen\"],[10],[0,\"-Funktion.\"],[7,\"br\"],[9],[10],[7,\"br\"],[9],[10],[0,\"\\n  \"],[7,\"img\"],[11,\"style\",\"float: left\"],[11,\"src\",\"/assets/images/yt-teilen-1.mobile.png\"],[9],[10],[7,\"span\"],[11,\"style\",\"float: left;\"],[9],[0,\" => \"],[10],[0,\"\\n  \"],[7,\"img\"],[11,\"src\",\"/assets/images/yt-teilen-2.mobile.png\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"  Wähle ein Video mit der gewünschten Filmszene auf \"],[7,\"a\"],[11,\"href\",\"https://www.youtube.com/\"],[11,\"target\",\"top\"],[9],[0,\"Youtube\"],[10],[0,\" aus und kopiere die Url über die \"],[7,\"i\"],[9],[0,\"Teilen\"],[10],[0,\"-Funktion oder aus der Url-Leiste deines Browsers.\"],[7,\"br\"],[9],[10],[7,\"br\"],[9],[10],[0,\"\\n  \"],[7,\"img\"],[11,\"style\",\"float: left\"],[11,\"src\",\"/assets/images/yt-teilen-1.mobile.png\"],[9],[10],[7,\"span\"],[11,\"style\",\"float: left;\"],[9],[0,\" => \"],[10],[0,\"\\n  \"],[7,\"img\"],[11,\"src\",\"/assets/images/yt-teilen-2.png\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[29,\"eq\",[[25,[\"currentStep\"]],2],null]],null,{\"statements\":[[0,\"\\n  \"],[7,\"h3\"],[9],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-right: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Zurück\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],-1],null]]],[10],[0,\"\\n    Schritt \"],[1,[23,\"currentStep\"],false],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-left: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Weiter\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],1],null]]],[10],[0,\"\\n  \"],[10],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Füge die kopierte Url in das Formular-Feld \"],[7,\"span\"],[11,\"style\",\"background-color: white;\"],[9],[0,\"[Video-Url]\"],[10],[0,\" ein.\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Trage die Start- und End-Sekunden der gewünschten Szene in die Formular-Felder \"],[7,\"span\"],[11,\"style\",\"background-color: white;\"],[9],[0,\"[Szene-Start]\"],[10],[0,\" und \"],[7,\"span\"],[11,\"style\",\"background-color: white;\"],[9],[0,\"[Szene-Ende]\"],[10],[0,\" ein.\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Speichere die Angaben mit \"],[7,\"button\"],[11,\"style\",\"background-color: red;\"],[11,\"type\",\"button\"],[9],[0,\"Set Cutting Data\"],[10],[0,\" und überprüfe mit \"],[7,\"button\"],[11,\"class\",\"orig\"],[11,\"type\",\"button\"],[9],[0,\"Play Orig\"],[10],[0,\" die korrekte Wiedergabe der Szene.\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[29,\"eq\",[[25,[\"currentStep\"]],3],null]],null,{\"statements\":[[0,\"  \"],[7,\"h3\"],[9],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-right: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Zurück\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],-1],null]]],[10],[0,\"\\n    Schritt \"],[1,[23,\"currentStep\"],false],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-left: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Weiter\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],1],null]]],[10],[0,\"\\n  \"],[10],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Suche den Timecode für den Beginn deiner Aufnahme mit dem \"],[7,\"input\"],[11,\"style\",\"width: 50px;\"],[11,\"class\",\"select_video_position\"],[11,\"min\",\"0\"],[11,\"max\",\"10\"],[11,\"value\",\"5\"],[11,\"step\",\"1\"],[11,\"type\",\"range\"],[9],[10],[0,\" unter dem Video. Bei jedem ausgewählten Timecode\\n      wird zur Orientierung für 1 Sekunde der Videoausschnitt angespielt.\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Beginne deine Audio-Aufnahme mit \"],[7,\"button\"],[11,\"style\",\"background-color:rgb(147,241,164,1);\"],[11,\"type\",\"button\"],[9],[0,\"Start Record Audio\"],[10],[0,\" und sprich deinen Text sobald nach kurzer Verzögerung \"],[7,\"button\"],[11,\"style\",\"background-color:red;\"],[11,\"type\",\"button\"],[9],[0,\"Stop Record Audio\"],[10],[0,\" angezeigt wird. Danach klick sofort auf \"],[7,\"button\"],[11,\"style\",\"background-color:red;\"],[11,\"type\",\"button\"],[9],[0,\"Stop Record Audio\"],[10],[0,\" um später ab diesem Zeitpunkt wieder den Originalton zu hören.\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Überprüfe das korrekte Timing deiner Aufnahme mit \"],[7,\"button\"],[11,\"style\",\"background-color: blue;\"],[11,\"type\",\"button\"],[9],[0,\"Play Dub\"],[10],[0,\". Setze den Timecode wieder auf 0 um das gesamte Video abzuspielen.\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"  \"],[7,\"h3\"],[9],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-right: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Zurück\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],-1],null]]],[10],[0,\"\\n    Schritt \"],[1,[23,\"currentStep\"],false],[0,\"\\n\"],[0,\"  \"],[10],[0,\"\\n  Wenn alles passt, dann kannst du mit \"],[7,\"button\"],[11,\"style\",\"background-color: green;\"],[11,\"type\",\"button\"],[9],[0,\"Share Video\"],[10],[0,\" deine Szenen-Synchronisation\\n  sichern, und die App generiert eine Url die du an deine Freunde schicken kannst.\\n\"],[4,\"if\",[[25,[\"isMobile\"]]],null,{\"statements\":[[0,\"  Oder du teilst die Url mit dem \"],[7,\"a\"],[11,\"href\",\"\"],[9],[0,\"Share via Whatsapp\"],[10],[0,\"-Link.\\n\"]],\"parameters\":[]},null]],\"parameters\":[]}]],\"parameters\":[]}]],\"parameters\":[]}],[2,\"\\n<div style=\\\"width: {{playerWidth}}px; margin-top: 7px;\\\">\\nCreating a Dub-Track involves 2 Phases: <span class=\\\"howTo phase1\\\">First you only edit the Part/Timespan where you want to replace/dub the Video's Original Audiotrack.</span><span class=\\\"howTo phase2\\\">Second, you optionally edit the actual start/end of the video if it should be different.</span>\\n</div>\\n<ol style=\\\"margin-top: 0px; margin-bottom: 0px; padding: 10px; width: {{playerWidth}}px;\\\">\\n  <li class=\\\"howTo phase1\\\">Set Youtube Video-Id, Video-Start-Secs short before the time when the Dub-Track should start and Video-End-Secs after the Dub-Track should end. <span class=\\\"howTo phase2\\\">You can later fine-tune the exact start-time of your Dub-Track, so that there's no gap between the original Audio-Track (@see 4.),</span> whereas the end-point currently can't be changed.</li>\\n  <li class=\\\"howTo phase1\\\">Click <button type=\\\"button\\\">Start Record Audio</button> and Dub the Video. The button changes to <button style=\\\"background-color:red;\\\" type=\\\"button\\\">Stop Record Audio</button> and you have to click it right after your Dub-Track is complete and the original Track shall be audible again.</li>\\n  <li class=\\\"howTo phase1\\\">After Recording check your Dub-Track by clicking <button type=\\\"button\\\" style=\\\"background-color: blue;\\\">Play Dub</button></li>\\n  <li class=\\\"howTo phase2\\\">You can also fine-tune the Dub-Track's start-time if you want the Videos original preceding Audio-Track to play longer. Set the value in \\\"Inner Dub-Track Delay Milliseconds\\\"</li>\\n  <li class=\\\"howTo phase2\\\">If you want the Video to start some Time before Your Dub-Track then you can change the Video-Start-Secs now to an earlier moment and click <button type=\\\"button\\\">Set Cutting Data</button>. You'll notice that the value of \\\"Dub-Track Delay Milliseconds\\\" will change accordingly, meaning that the Dub-Track will start some Time after the Video.</li>\\n</ol>\\n\"],[0,\"\\n\"],[2,\"The <button type=\\\"button\\\">Start Record Audio</button> will change to <button style=\\\"background-color:red;\\\" type=\\\"button\\\">Stop Record Audio</button> after clicking.\"],[0,\"\\n\"],[2,\" ENGLISH\\nWith the <button type=\\\"button\\\" style=\\\"background-color: yellow;\\\">Play Orig</button> button you can always replay the original soundtrack.\\n<ol style=\\\"margin-top: 0px; margin-bottom: 0px; padding-left: 20px;\\\">\\n  <li class=\\\"howTo phase1\\\">Click <button type=\\\"button\\\">Start Record Audio</button> and say the name of your favorite city when Leonidas would say Sparta. Then click <button style=\\\"background-color:red;\\\" type=\\\"button\\\">Stop Record Audio</button> immediately.</li>\\n  <li class=\\\"howTo phase2\\\">Check the correct timing of your recording by clicking <button type=\\\"button\\\" style=\\\"background-color: blue;\\\">Play Dub</button></li>\\n  <li class=\\\"howTo phase1\\\">Now set the value in \\\"Inner Dub-Track Delay Milliseconds\\\" to 1600 and click <button type=\\\"button\\\">Set Dub-Track Delay</button>, so the original soundtrack will be audible until your dub. Check again with <button type=\\\"button\\\" style=\\\"background-color: blue;\\\">Play Dub</button> and fine-tune the delay-value as necessary.</li>\\n  <li class=\\\"howTo phase2\\\">Now you can start the Video 3 more seconds before Your Dub-Track by changing the \\\"Video-Start-Secs\\\" from 49 to 46 and click <button type=\\\"button\\\">Set Cutting Data</button>. You'll notice that the value of \\\"Dub-Track Delay Milliseconds\\\" will change accordingly, meaning that the Dub-Track will start some Time after the Video. Clicking <button type=\\\"button\\\" style=\\\"background-color: blue;\\\">Play Dub</button> will show the changes.</li>\\n  <li class=\\\"howTo phase1\\\">Now you can share the Dub-Track by clicking <button type=\\\"button\\\" style=\\\"background-color: green;\\\">Share Video</button>. After short time you'll see right above the video an url that you can share for direct access. You can also share via whatsapp on smartphones.</li>\\n</ol>\\n/ENGLISH \"],[0,\"\\n\"],[2,\" DEUTSCH \"],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "sparta/templates/components/how-to.hbs"
    }
  });

  _exports.default = _default;
});
;define("sparta/templates/components/sound-track-creator", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "aN9Y/ZDI",
    "block": "{\"symbols\":[\"n\",\"sharedDubTrackData\",\"idx\",\"&default\"],\"statements\":[[15,4],[0,\"\\n\\n\"],[7,\"div\"],[11,\"style\",\"position: fixed; top: 10px; left: 100px; width: 400px;\"],[9],[0,\"\\n\"],[4,\"if\",[[29,\"and\",[[25,[\"initialPlayed\"]],[29,\"or\",[[29,\"not\",[[25,[\"hideTitleSecs\"]]],null],[25,[\"initialPlayedWithHiddenTitle\"]]],null]],null]],null,{\"statements\":[[4,\"if\",[[29,\"and\",[[25,[\"audioBuffer\"]],[25,[\"recordingDuration\"]]],null]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[9],[0,\"\\n  \"],[7,\"button\"],[11,\"style\",\"background-color: green; float: right;\"],[11,\"type\",\"button\"],[9],[0,\"Share Video\"],[3,\"action\",[[24,0,[]],\"shareVideo\"]],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null],[10],[0,\"\\n\"],[7,\"hr\"],[9],[10],[0,\"\\n\"],[4,\"each\",[[25,[\"sharedDubTrackUrls\"]]],null,{\"statements\":[[0,\"  \"],[7,\"img\"],[11,\"style\",\"border; 0px;\"],[12,\"src\",[30,[\"https://img.youtube.com/vi/\",[24,2,[\"videoId\"]],\"/default.jpg\"]]],[9],[10],[0,\" -\\n\"],[4,\"if\",[[25,[\"application\",\"isMobile\"]]],null,{\"statements\":[[0,\"  \"],[7,\"a\"],[12,\"href\",[30,[\"whatsapp://send?text=\",[24,2,[\"whatsAppText\"]]]]],[11,\"data-action\",\"share/whatsapp/share\"],[9],[0,\"Share via Whatsapp\"],[10],[0,\" or\\n\"]],\"parameters\":[]},null],[0,\"  \"],[7,\"a\"],[12,\"href\",[30,[[24,2,[\"dubTrackUrl\"]]]]],[11,\"target\",\"dubTrack\"],[9],[7,\"input\"],[11,\"readonly\",\"\"],[12,\"id\",[30,[\"share_\",[24,3,[]]]]],[12,\"value\",[30,[[24,2,[\"dubTrackUrl\"]]]]],[11,\"style\",\"width: 300px; border: 0px; color: blue;\"],[9],[10],[10],[0,\"\\n  \"],[7,\"button\"],[11,\"type\",\"button\"],[9],[0,\"Copy Link to Clipboard\"],[3,\"action\",[[24,0,[]],\"copyToClipboard\",[29,\"append\",[\"#share\",[24,3,[]],\"_\"],null]]],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"\\n\"]],\"parameters\":[2,3]},null],[0,\"\\n\"],[7,\"div\"],[11,\"id\",\"cutting-data-editor\"],[9],[0,\"\\n\"],[4,\"if\",[[29,\"or\",[[25,[\"showVideoEditor\"]],[25,[\"showHowTo\"]],[29,\"eq\",[[25,[\"router\",\"currentRouteName\"]],\"new\"],null]],null]],null,{\"statements\":[[0,\"    \"],[7,\"button\"],[12,\"onclick\",[29,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"showVideoEditor\"]]],null],false],null]],[11,\"type\",\"button\"],[9],[0,\"-\"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"initialPlayed\"]]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"style\",\"float: right; background-color: #3198af;\"],[9],[0,\"\\n      Show HowTo \"],[1,[29,\"input\",null,[[\"type\",\"name\",\"checked\"],[\"checkbox\",\"showHowTo\",[25,[\"showHowTo\"]]]]],false],[0,\"\\n      \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"\\n\"],[4,\"if\",[[29,\"or\",[[29,\"not\",[[25,[\"showHowTo\"]]],null],[29,\"lt\",[[25,[\"currentHowToStep\"]],3],null]],null]],null,{\"statements\":[[0,\"      \"],[7,\"br\"],[11,\"style\",\"clear: both;\"],[9],[10],[0,\"\\n      Titel: \"],[1,[29,\"input\",null,[[\"id\",\"value\"],[\"videoTitle\",[25,[\"videoTitle\"]]]]],false],[7,\"br\"],[9],[10],[0,\"\\n      Video-Url: \"],[1,[29,\"input\",null,[[\"id\",\"value\"],[\"videoUrl\",[25,[\"videoUrl\"]]]]],false],[0,\" oder Video-Id: \"],[7,\"input\"],[11,\"id\",\"videoId\"],[12,\"value\",[30,[[23,\"videoId\"]]]],[9],[10],[7,\"br\"],[9],[10],[0,\"\\n      Szene-Start: \"],[1,[29,\"input\",null,[[\"min\",\"step\",\"id\",\"value\"],[\"0\",\"1\",\"startSecs\",[25,[\"newStartFmtd\"]]]]],false],[0,\" hh:mm:ss\"],[4,\"if\",[[25,[\"videoId\"]]],null,{\"statements\":[[0,\".xx\"]],\"parameters\":[]},null],[0,\" (aktuell: \"],[1,[23,\"startFmtd\"],false],[0,\")\"],[7,\"br\"],[9],[10],[0,\"\\n      Szene-Ende: \"],[1,[29,\"input\",null,[[\"min\",\"step\",\"id\",\"value\"],[\"0\",\"1\",\"endSecs\",[25,[\"newEndFmtd\"]]]]],false],[0,\" hh:mm:ss\"],[4,\"if\",[[25,[\"videoId\"]]],null,{\"statements\":[[0,\".xx\"]],\"parameters\":[]},null],[0,\" (aktuell: \"],[1,[23,\"endFmtd\"],false],[0,\")\"],[7,\"br\"],[9],[10],[0,\"\\n      \"],[7,\"button\"],[11,\"id\",\"setCuttingData\"],[11,\"type\",\"button\"],[9],[0,\"Set Cutting Data\"],[3,\"action\",[[24,0,[]],\"setVideoId\"]],[10],[0,\"\\n\"],[4,\"unless\",[[29,\"eq\",[[25,[\"router\",\"currentRouteName\"]],\"new\"],null]],null,{\"statements\":[[0,\"        \"],[7,\"div\"],[11,\"style\",\"float: right; margin: 0px 10px 0px 0px;\"],[9],[4,\"link-to\",null,[[\"route\"],[\"new\"]],{\"statements\":[[7,\"button\"],[11,\"style\",\"background-color: blue; float: right;\"],[11,\"type\",\"button\"],[9],[0,\"Neues Video\"],[10]],\"parameters\":[]},null],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null],[0,\"\\n\"],[4,\"if\",[[29,\"and\",[[25,[\"showHowTo\"]],[29,\"lt\",[[25,[\"currentHowToStep\"]],3],null]],null]],null,{\"statements\":[[0,\"      \"],[7,\"br\"],[9],[10],[0,\"\\n      \"],[7,\"div\"],[12,\"style\",[30,[\"width: \",[23,\"playerWidth\"],\"px; margin-top: 7px; padding: 0px 0px 20px 0px;\"]]],[11,\"class\",\"howTo phase1\"],[9],[0,\"\\n        \"],[1,[29,\"how-to\",null,[[\"subject\",\"isMobile\"],[[24,0,[]],[25,[\"application\",\"isMobile\"]]]]],false],[0,\"\\n      \"],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[29,\"or\",[[29,\"and\",[[25,[\"initialPlayed\"]],[29,\"or\",[[29,\"not\",[[25,[\"hideTitleSecs\"]]],null],[25,[\"initialPlayedWithHiddenTitle\"]]],null]],null],[25,[\"showHowTo\"]]],null]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"style\",\"float: left;\"],[9],[7,\"button\"],[11,\"type\",\"button\"],[9],[0,\"+\"],[10],[0,\" Videoszenedaten bearbeiten\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"showVideoEditor\"]]],null],true]],[10],[0,\"\\n      \"],[7,\"div\"],[11,\"style\",\"float: right; background-color: #3198af;\"],[9],[0,\"\\n      Show HowTo \"],[1,[29,\"input\",null,[[\"type\",\"name\",\"checked\"],[\"checkbox\",\"showHowTo\",[25,[\"showHowTo\"]]]]],false],[0,\"\\n      \"],[10],[0,\"\\n      \"],[7,\"br\"],[11,\"style\",\"clear: both;\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"span\"],[9],[1,[23,\"videoTitle\"],false],[10],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]}],[0,\"  \"],[7,\"hr\"],[9],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[4,\"if\",[[29,\"and\",[[25,[\"showHowTo\"]],[29,\"gte\",[[25,[\"currentHowToStep\"]],3],null]],null]],null,{\"statements\":[[7,\"div\"],[12,\"style\",[30,[\"width: \",[23,\"playerWidth\"],\"px; padding: 0px 0px 20px 0px;\"]]],[11,\"class\",\"howTo phase1\"],[9],[0,\"\\n  \"],[1,[29,\"how-to\",null,[[\"subject\",\"isMobile\"],[[24,0,[]],[25,[\"application\",\"isMobile\"]]]]],false],[0,\"\\n\"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"\\n\"],[4,\"if\",[[25,[\"dubSpecReady\"]]],null,{\"statements\":[[7,\"table\"],[11,\"class\",\"video-editor\"],[9],[0,\"\\n  \"],[7,\"tr\"],[9],[0,\"\\n    \"],[7,\"td\"],[9],[0,\"\\n      \"],[7,\"div\"],[11,\"id\",\"video\"],[9],[10],[0,\"\\n\"],[4,\"if\",[[29,\"and\",[[25,[\"initialPlayed\"]],[29,\"or\",[[29,\"not\",[[25,[\"hideTitleSecs\"]]],null],[25,[\"initialPlayedWithHiddenTitle\"]]],null]],null]],null,{\"statements\":[[0,\"      \"],[7,\"br\"],[9],[10],[0,\"\\n      \"],[7,\"input\"],[12,\"disabled\",[29,\"or\",[[25,[\"disableControls\"]],[29,\"or\",[[29,\"and\",[[25,[\"videoStarted\"]],[29,\"not\",[[29,\"and\",[[25,[\"videoPaused\"]],[25,[\"orig\"]]],null]],null]],null],[25,[\"recording\"]]],null]],null]],[11,\"style\",\"width: 300px;\"],[11,\"list\",\"video_position_units\"],[11,\"class\",\"select_video_position\"],[12,\"min\",[30,[[29,\"mult\",[[25,[\"start\"]],1000],null]]]],[12,\"max\",[30,[[29,\"mult\",[[25,[\"end\"]],1000],null]]]],[12,\"value\",[30,[[23,\"videoMilliSecsPos\"]]]],[11,\"step\",\"100\"],[12,\"oninput\",[29,\"action\",[[24,0,[]],\"setVideoMilliSecs\"],[[\"value\"],[\"target.value\"]]]],[11,\"type\",\"range\"],[9],[10],[0,\"\\n\"],[0,\"      \"],[7,\"div\"],[11,\"id\",\"recordedRange\"],[11,\"style\",\"width: 0px;\"],[9],[0,\" \"],[10],[0,\"\\n      \"],[7,\"div\"],[11,\"style\",\"position: relative; top: -20px; left: -3px; width: 300px; z-index: -10;\"],[9],[0,\"\\n\"],[4,\"each\",[[29,\"range\",[0,[29,\"sub\",[[25,[\"end\"]],[25,[\"start\"]]],null]],null]],null,{\"statements\":[[0,\"        \"],[7,\"div\"],[12,\"style\",[29,\"append\",[[29,\"append\",[\"font-size: 8px; position: absolute; left: \",[29,\"sub\",[[29,\"round\",[[29,\"mult\",[300,[29,\"div\",[[24,1,[]],[29,\"sub\",[[25,[\"end\"]],[25,[\"start\"]]],null]],null]],null]],null],[29,\"round\",[[29,\"mult\",[[29,\"sub\",[[25,[\"end\"]],[25,[\"start\"]]],null],[29,\"div\",[[24,1,[]],[29,\"sub\",[[25,[\"end\"]],[25,[\"start\"]]],null]],null]],null]],null]],null],\"\"],null],\"px; width: 15px; float: left; z-index: -10; text-align: center;\",\"\"],null]],[9],[0,\"\\n          \"],[7,\"span\"],[11,\"style\",\"position: absolute; left: 7px; top: -10px;\"],[9],[0,\"|\"],[10],[1,[24,1,[]],false],[0,\"\\n        \"],[10],[0,\"\\n\"]],\"parameters\":[1]},null],[4,\"if\",[[25,[\"videoSnippetStartMillis\"]]],null,{\"statements\":[[0,\"        \"],[7,\"div\"],[12,\"style\",[29,\"append\",[[29,\"append\",[\"color: red; font-size: 8px; position: absolute; top: 7px; left: \",[29,\"sub\",[[29,\"round\",[[29,\"mult\",[300,[29,\"div\",[[29,\"div\",[[25,[\"videoSnippetStartMillis\"]],1000],null],[29,\"sub\",[[25,[\"end\"]],[25,[\"start\"]]],null]],null]],null]],null],[29,\"round\",[[29,\"mult\",[[29,\"sub\",[[25,[\"end\"]],[25,[\"start\"]]],null],[29,\"div\",[[29,\"div\",[[25,[\"videoSnippetStartMillis\"]],1000],null],[29,\"sub\",[[25,[\"end\"]],[25,[\"start\"]]],null]],null]],null]],null]],null],\"\"],null],\"px; width: 15px; float: left; z-index: -10; text-align: center;\",\"\"],null]],[9],[0,\"\\n          \"],[7,\"span\"],[11,\"style\",\"position: absolute; left: 7px; top: -17px;\"],[9],[0,\"|\"],[10],[1,[29,\"format-float\",[[29,\"div\",[[25,[\"videoSnippetStartMillis\"]],1000],null]],null],false],[0,\"\\n        \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"      \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[29,\"or\",[[29,\"and\",[[25,[\"initialPlayed\"]],[29,\"or\",[[29,\"not\",[[25,[\"hideTitleSecs\"]]],null],[25,[\"initialPlayedWithHiddenTitle\"]]],null]],null],[25,[\"showHowTo\"]]],null]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"style\",\"position: relative; top: -5px;\"],[9],[0,\"\\n        \"],[7,\"div\"],[11,\"style\",\"height: 20px; margin: 0px 5px 0px 0px; float: left;\"],[9],[0,\"Timecode\"],[10],[0,\"\\n\"],[0,\"        \"],[7,\"button\"],[12,\"disabled\",[29,\"or\",[[25,[\"disableControls\"]],[29,\"or\",[[29,\"and\",[[25,[\"videoStarted\"]],[29,\"not\",[[29,\"and\",[[25,[\"videoPaused\"]],[25,[\"orig\"]]],null]],null]],null],[25,[\"recording\"]]],null],[25,[\"pauseVideoAfterSeekTo\"]]],null]],[11,\"class\",\"time-code-marker\"],[11,\"style\",\"float: left; margin: 0px 5px 0px 0px; padding: 0px 5px 0px 5px;\"],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"setVideoMilliSecs\",[29,\"mult\",[[25,[\"start\"]],1000],null]],null]],[11,\"type\",\"button\"],[9],[0,\"0\"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"style\",\"height: 20px; margin: 0px 5px 0px 5px; float: left;\"],[9],[0,\"oder Marker\"],[10],[0,\"\\n        \"],[7,\"button\"],[12,\"disabled\",[29,\"or\",[[25,[\"disableControls\"]],[29,\"or\",[[29,\"and\",[[25,[\"videoStarted\"]],[29,\"not\",[[25,[\"pauseVideoOnPlay\"]]],null]],null],[25,[\"recording\"]]],null],[25,[\"pauseVideoAfterSeekTo\"]]],null]],[11,\"class\",\"time-code-marker\"],[11,\"style\",\"float: left; margin: 0px 5px 0px 0px; padding: 0px 5px 0px 5px;\"],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"setVideoMilliSecs\",[29,\"inc\",[[29,\"add\",[[29,\"mult\",[[25,[\"start\"]],1000],null],[29,\"or\",[[25,[\"videoMilliSecs\"]],0],null]],null],-100],null]],null]],[11,\"type\",\"button\"],[9],[0,\"-\"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"id\",\"video-milli-secs\"],[11,\"class\",\"time-code-marker\"],[11,\"style\",\"width: 60px; height: 20px; border-color: black !important; border: solid 1px; font-weight: 800; text-align: right; float: left;\"],[9],[0,\"\\n          \"],[1,[29,\"format-float\",[[29,\"div\",[[25,[\"videoMilliSecs\"]],1000],null]],null],false],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"button\"],[12,\"disabled\",[29,\"or\",[[25,[\"disableControls\"]],[29,\"or\",[[29,\"and\",[[25,[\"videoStarted\"]],[29,\"not\",[[25,[\"pauseVideoOnPlay\"]]],null]],null],[25,[\"recording\"]]],null],[25,[\"pauseVideoAfterSeekTo\"]]],null]],[11,\"class\",\"time-code-marker\"],[11,\"style\",\"float: left; margin: 0px 0px 0px 5px; padding: 0px 5px 0px 5px;\"],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"setVideoMilliSecs\",[29,\"inc\",[[29,\"add\",[[29,\"mult\",[[25,[\"start\"]],1000],null],[29,\"or\",[[25,[\"videoMilliSecs\"]],0],null]],null],100],null]],null]],[11,\"type\",\"button\"],[9],[0,\"+\"],[10],[0,\"\\n\"],[0,\"      \"],[10],[0,\"\\n\"],[4,\"if\",[[29,\"and\",[[25,[\"enableInnerDubDelay\"]],[25,[\"audioBuffer\"]]],null]],null,{\"statements\":[[0,\"      \"],[7,\"button\"],[11,\"style\",\"height: 20px; margin-left: 10px;\"],[11,\"type\",\"button\"],[9],[0,\"Set Synchronisation Start\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"newInnerDubTrackDelay\"]]],null],[25,[\"videoMilliSecs\"]]]],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[29,\"and\",[[29,\"or\",[[25,[\"hideTitleSecs\"]],[25,[\"initialPlayedWithHiddenTitle\"]]],null],[29,\"not\",[[25,[\"featurePresentation\"]]],null]],null]],null,{\"statements\":[[4,\"if\",[[25,[\"autoplay\"]]],null,{\"statements\":[[4,\"if\",[[29,\"and\",[[25,[\"videoCountdownSecs\"]],[29,\"gte\",[[25,[\"videoCountdownSecs\"]],0],null]],null]],null,{\"statements\":[[0,\"        \"],[7,\"img\"],[11,\"src\",\"/assets/images/busy.gif\"],[9],[10],[0,\"\\n        \"],[7,\"br\"],[9],[10],[7,\"br\"],[9],[10],[0,\"\\n\"],[4,\"if\",[[29,\"gt\",[[25,[\"videoCountdownSecs\"]],0],null]],null,{\"statements\":[[0,\"          Video startet in \"],[1,[23,\"videoCountdownSecs\"],false],[0,\" Sekunden\\n\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[29,\"and\",[[25,[\"hideTitleSecs\"]],[29,\"or\",[[29,\"eq\",[[25,[\"videoCountdownSecs\"]],null],null],[29,\"gt\",[[25,[\"videoCountdownSecs\"]],0],null]],null]],null]],null,{\"statements\":[[0,\"          \"],[7,\"img\"],[11,\"src\",\"/assets/images/busy.gif\"],[9],[10],[0,\"\\n          \"],[7,\"br\"],[9],[10],[7,\"br\"],[9],[10],[0,\"\\n\"],[0,\"          Player wird initialisiert ...\\n\\n\"]],\"parameters\":[]},null]],\"parameters\":[]}]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"hr\"],[9],[10],[0,\"\\n      \"],[7,\"button\"],[11,\"id\",\"play_dub\"],[12,\"disabled\",[29,\"not\",[[25,[\"initialPlayed\"]]],null]],[11,\"style\",\"background-color: blue;\"],[11,\"type\",\"button\"],[9],[0,\"Play Dub\"],[3,\"action\",[[24,0,[]],\"playVideo\",false]],[10],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null]],\"parameters\":[]}],[0,\"    \"],[10],[0,\"\\n\"],[0,\"  \"],[10],[0,\"\\n  \"],[7,\"tr\"],[11,\"style\",\"vertical-align: top; height: 75px;\"],[9],[0,\"\\n    \"],[7,\"td\"],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"playerReady\"]]],null,{\"statements\":[[4,\"if\",[[29,\"and\",[[29,\"and\",[[25,[\"initialPlayed\"]],[29,\"or\",[[29,\"not\",[[25,[\"hideTitleSecs\"]]],null],[25,[\"initialPlayedWithHiddenTitle\"]]],null]],null],[25,[\"displayControls\"]]],null]],null,{\"statements\":[[0,\"      \"],[7,\"table\"],[9],[0,\"\\n        \"],[7,\"tr\"],[9],[0,\"\\n          \"],[7,\"td\"],[9],[0,\"\\n      \"],[7,\"div\"],[11,\"style\",\"float: left; margin: 0px 10px 0px 0px;\"],[9],[0,\"\\n        \"],[7,\"button\"],[11,\"id\",\"play_orig\"],[12,\"disabled\",[29,\"or\",[[29,\"and\",[[25,[\"disableControls\"]],[29,\"not\",[[25,[\"videoStarted\"]]],null]],null],[29,\"or\",[[25,[\"recording\"]],[29,\"and\",[[29,\"or\",[[25,[\"videoStarted\"]],[25,[\"videoPaused\"]]],null],[29,\"not\",[[25,[\"orig\"]]],null]],null]],null],[25,[\"pauseVideoAfterSeekTo\"]]],null]],[11,\"class\",\"orig\"],[11,\"type\",\"button\"],[9],[4,\"if\",[[29,\"and\",[[25,[\"videoPaused\"]],[25,[\"orig\"]]],null]],null,{\"statements\":[[0,\"Continue\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[25,[\"videoStarted\"]]],null,{\"statements\":[[0,\"Pause\"]],\"parameters\":[]},{\"statements\":[[0,\"Play\"]],\"parameters\":[]}]],\"parameters\":[]}],[0,\" Orig\"],[3,\"action\",[[24,0,[]],\"playVideo\"]],[10],[0,\"\\n      \"],[10],[0,\"\\n          \"],[10],[0,\"\\n          \"],[7,\"td\"],[9],[0,\"\\n      \"],[7,\"div\"],[11,\"style\",\"float: left; margin: 0px 10px 0px 10px;\"],[9],[0,\"\\n\"],[4,\"unless\",[[25,[\"recorded\"]]],null,{\"statements\":[[4,\"unless\",[[29,\"and\",[[25,[\"recording\"]],[25,[\"videoStarted\"]]],null]],null,{\"statements\":[[0,\"        \"],[7,\"button\"],[11,\"id\",\"rec_ctrl\"],[12,\"disabled\",[29,\"or\",[[25,[\"disableControls\"]],[29,\"or\",[[25,[\"recording\"]],[29,\"or\",[[25,[\"videoStarted\"]],[25,[\"recorded\"]]],null]],null],[25,[\"pauseVideoAfterSeekTo\"]]],null]],[11,\"style\",\"background-color:rgb(147,241,164,1);\"],[11,\"type\",\"button\"],[9],[4,\"unless\",[[25,[\"recording\"]]],null,{\"statements\":[[0,\"Start Record Audio\"]],\"parameters\":[]},{\"statements\":[[0,\"Video wird gestartet\"]],\"parameters\":[]}],[3,\"action\",[[24,0,[]],\"startRecording\"]],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"        \"],[7,\"button\"],[11,\"style\",\"background-color:rgb(255,0,0,1);\"],[11,\"type\",\"button\"],[9],[0,\"Stop Record Audio\"],[3,\"action\",[[24,0,[]],\"stopRecording\"]],[10],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},{\"statements\":[[0,\"        \"],[7,\"span\"],[9],[0,\"Audio Saved\"],[10],[0,\"\\n\"]],\"parameters\":[]}],[0,\"      \"],[10],[0,\"\\n          \"],[10],[0,\"\\n          \"],[7,\"td\"],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"audioBuffer\"]]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[9],[0,\"\\n        \"],[7,\"button\"],[11,\"id\",\"play_dub\"],[12,\"disabled\",[29,\"or\",[[25,[\"disableControls\"]],[29,\"or\",[[25,[\"recording\"]],[25,[\"videoStarted\"]]],null],[25,[\"pauseVideoAfterSeekTo\"]]],null]],[11,\"style\",\"background-color: blue;\"],[11,\"type\",\"button\"],[9],[4,\"if\",[[29,\"and\",[[25,[\"videoPaused\"]],[29,\"not\",[[25,[\"orig\"]]],null]],null]],null,{\"statements\":[[0,\"Continue\"]],\"parameters\":[]},{\"statements\":[[0,\"Play\"]],\"parameters\":[]}],[0,\" Dub\"],[3,\"action\",[[24,0,[]],\"playVideo\",false]],[10],[0,\"\\n      \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"          \"],[10],[0,\"\\n        \"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"videoSnippetStartMillis\"]]],null,{\"statements\":[[0,\"        \"],[7,\"tr\"],[9],[0,\"\\n          \"],[7,\"td\"],[11,\"colspan\",\"3\"],[9],[0,\"\\n\"],[0,\"      \"],[7,\"div\"],[11,\"style\",\"float: left; margin: 0px 10px 0px 0px;\"],[9],[0,\"\\n\"],[0,\"        \"],[7,\"button\"],[11,\"id\",\"play_snippet\"],[12,\"disabled\",[29,\"or\",[[25,[\"disableControls\"]],[29,\"or\",[[25,[\"recording\"]],[29,\"and\",[[25,[\"videoStarted\"]],[29,\"not\",[[29,\"and\",[[25,[\"videoPaused\"]],[25,[\"orig\"]]],null]],null]],null]],null],[25,[\"pauseVideoAfterSeekTo\"]]],null]],[11,\"class\",\"orig\"],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"setVideoMilliSecs\",[29,\"add\",[[29,\"mult\",[[25,[\"start\"]],1000],null],[25,[\"videoSnippetStartMillis\"]]],null],true],null]],[11,\"type\",\"button\"],[9],[0,\"Play Orig Snippet\"],[10],[7,\"span\"],[11,\"style\",\"font-size: 10px; margin-left: 10px;\"],[9],[1,[29,\"div\",[[25,[\"videoSnippetDurationMillis\"]],1000],null],false],[0,\" Sek. ab Marker-Timecode\"],[10],[0,\"\\n      \"],[10],[0,\"\\n          \"],[10],[0,\"\\n        \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"      \"],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null],[0,\"    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"\\n\"],[4,\"if\",[[29,\"or\",[[29,\"and\",[[25,[\"initialPlayed\"]],[29,\"or\",[[29,\"not\",[[25,[\"hideTitleSecs\"]]],null],[25,[\"initialPlayedWithHiddenTitle\"]]],null]],null],[25,[\"showHowTo\"]]],null]],null,{\"statements\":[[4,\"if\",[[29,\"and\",[[25,[\"audioBuffer\"]],[25,[\"recordingDuration\"]]],null]],null,{\"statements\":[[7,\"br\"],[9],[10],[0,\"\\n\"],[7,\"div\"],[9],[0,\"\\n  \"],[1,[29,\"input\",null,[[\"type\",\"id\",\"value\"],[\"hidden\",\"dubTrackDelayMillis\",[25,[\"dubTrackDelay\"]]]]],false],[0,\"\\n  \"],[7,\"div\"],[11,\"style\",\"height: 20px; margin: 0px 5px 0px 0px; float: left;\"],[9],[0,\"Aufnahme-Beginn verschieben zu Timecode\"],[10],[0,\"\\n  \"],[7,\"button\"],[12,\"disabled\",[23,\"videoStarted\"]],[11,\"class\",\"recording-range\"],[11,\"style\",\"float: left; margin: 0px 5px 0px 0px; padding: 0px 5px 0px 5px;\"],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"setDubTrackSecs\",[29,\"add\",[[29,\"or\",[[25,[\"dubTrackDelay\"]],0],null],-100],null]],null]],[11,\"type\",\"button\"],[9],[0,\"-\"],[10],[0,\"\\n\"],[0,\"  \"],[7,\"button\"],[11,\"id\",\"video-milli-secs\"],[11,\"class\",\"recording-range\"],[11,\"style\",\"float: left;\"],[11,\"type\",\"button\"],[9],[1,[29,\"format-float\",[[29,\"div\",[[25,[\"dubTrackDelay\"]],1000],null]],null],false],[3,\"action\",[[24,0,[]],\"setVideoMilliSecs\",[29,\"add\",[[29,\"mult\",[[25,[\"start\"]],1000],null],[25,[\"dubTrackDelay\"]]],null]]],[10],[0,\"\\n  \"],[7,\"button\"],[12,\"disabled\",[23,\"videoStarted\"]],[11,\"class\",\"recording-range\"],[11,\"style\",\"float: left; margin: 0px 0px 0px 5px; padding: 0px 5px 0px 5px;\"],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"setDubTrackSecs\",[29,\"add\",[[29,\"or\",[[25,[\"dubTrackDelay\"]],0],null],100],null]],null]],[11,\"type\",\"button\"],[9],[0,\"+\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"br\"],[11,\"style\",\"clear: both;\"],[9],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"enableInnerDubDelay\"]]],null,{\"statements\":[[0,\"Synchronisations-Start nach Aufnahme-Start: \"],[1,[29,\"input\",null,[[\"type\",\"min\",\"step\",\"id\",\"value\"],[\"number\",\"0\",\"100\",\"innerDubTrackDelayMillis\",[25,[\"newInnerDubTrackDelay\"]]]]],false],[0,\" Millisekunden (aktuell: \"],[1,[23,\"innerDubTrackDelay\"],false],[0,\")\"],[7,\"br\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"Aufnahme-Dauer: \"],[1,[29,\"format-float\",[[29,\"div\",[[25,[\"recordingDuration\"]],1000],null]],null],false],[0,\" Sekunden (Timecode \"],[1,[29,\"format-float\",[[29,\"div\",[[24,0,[\"dubTrackDelay\"]],1000],null]],null],false],[0,\" - \"],[1,[29,\"format-float\",[[29,\"div\",[[29,\"add\",[[24,0,[\"dubTrackDelay\"]],[24,0,[\"recordingDuration\"]]],null],1000],null]],null],false],[0,\")\"],[7,\"br\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},null],[7,\"br\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[2,\"\\n<button type=\\\"button\\\" {{action \\\"newDubTrack\\\"}}>Create new Dub-Track</button>\\n\"],[0,\"\\n\"]],\"parameters\":[]}]],\"hasEval\":false}",
    "meta": {
      "moduleName": "sparta/templates/components/sound-track-creator.hbs"
    }
  });

  _exports.default = _default;
});
;define("sparta/templates/index", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "AMuzEVpC",
    "block": "{\"symbols\":[],\"statements\":[[1,[23,\"sound-track-creator\"],false],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "sparta/templates/index.hbs"
    }
  });

  _exports.default = _default;
});
;define("sparta/templates/library", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "BzsU0/zC",
    "block": "{\"symbols\":[],\"statements\":[[1,[23,\"dub-track-library\"],false],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "sparta/templates/library.hbs"
    }
  });

  _exports.default = _default;
});
;define("sparta/templates/new", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "m9EYo5we",
    "block": "{\"symbols\":[],\"statements\":[[1,[29,\"sound-track-creator\",null,[[\"skipSample\"],[true]]],false],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "sparta/templates/new.hbs"
    }
  });

  _exports.default = _default;
});
;

;define('sparta/config/environment', [], function() {
  var prefix = 'sparta';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(decodeURIComponent(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

;
          if (!runningTests) {
            require("sparta/app")["default"].create({"backendUrlPrefix":"http://localhost:3003/api","name":"sparta","version":"0.0.0+1aef1aa3"});
          }
        
//# sourceMappingURL=sparta.map
