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
      return this.get('backendAdapter').request(url, 'GET').then(function (_this) {
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
    currentStep: 1
  });

  _exports.default = _default;
});
;define("sparta/components/sound-track-creator", ["exports", "jquery", "sparta/mixins/loading-indicator"], function (_exports, _jquery, _loadingIndicator) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  // import { A } from '@ember/array';
  var _default = Ember.Component.extend(_loadingIndicator.default, {
    recordAudio: Ember.inject.service(),
    backendAdapter: Ember.inject.service(),
    application: Ember.computed(function () {
      return Ember.getOwner(this).lookup('controller:application');
    }),
    skipSample: false,
    showHowTo: false,
    howToObserver: Ember.observer('showHowTo', function (_sender, _key, _value, _rev) {
      let videoProps = ['videoId', 'start', 'newStart', 'origDubTrackStartSecs', 'end', 'newEnd', 'audioBuffer', 'initialPlayed'];
      let dubTrackProps = ['dubTrackDelay', 'newDubTrackDelay', 'innerDubTrackDelay', 'newInnerDubTrackDelay'];

      if (this.get('showHowTo')) {
        for (let propKey of videoProps.concat(dubTrackProps)) this.set('howToOrig' + propKey, this.get(propKey)); // this.set('videoId', 'haNzpiLYdEk');
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

        for (let propKey of dubTrackProps) this.set(propKey, 0); // this.application.transitionToRoute('new');

      } else {
        for (let propKey of videoProps.concat(dubTrackProps)) this.set(propKey, this.get('howToOrig' + propKey));

        for (let propKey of videoProps.concat(dubTrackProps)) this.set('howToOrig' + propKey, null);
      }

      if (!this.get('displayControls')) this.set('displayControls', true); // this.get('player').destroy();
      // this.initPlayer(false);
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
    playerReady: Ember.computed(function () {
      false;
    }),
    videoMilliSecs: 0,
    videoMilliSecsPosSetCount: 0,
    videoMilliSecsPosFlag: null,
    videoMilliSecsPosFlag2: null,
    videoMilliSecsPos: Ember.computed('start', 'videoMilliSecsPosFlag', 'videoMilliSecsPosFlag2', function () {
      // console.log('videoMilliSecsPos: videoMilliSecs = ' + this.videoMilliSecs + ', videoMilliSecsPosFlag = ' + this.videoMilliSecsPosFlag);
      // // if (this.videoMilliSecsPosFlag != null) this.player.seekTo(this.start + Math.floor(this.videoMilliSecs / 1000), false);
      // if (this.videoMilliSecsPosFlag != null) this.send('playVideo', true);
      // // if (this.videoMilliSecsPosFlag != null) this.player.pauseVideo();
      return this.start * 1000 + this.videoMilliSecs;
    }),
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
    dubTrackDelay: 0,
    innerDubTrackDelay: 0,
    newStart: -1,
    newEnd: 1,
    newDubTrackDelay: 0,
    newInnerDubTrackDelay: 0,
    cuttingDataComplete: Ember.computed('videoId', 'start', 'end', function () {
      return (this.videoId || '') != '' && this.start >= 0 && this.end > this.start;
    }),
    changeObserver: Ember.observer('start', 'newStart', 'end', 'newEnd', 'dubTrackDelay', 'newDubTrackDelay', 'innerDubTrackDelay', 'newInnerDubTrackDelay', function (_sender, _key, _value, _rev) {
      var newCuttingData = false;

      if (this.get('start') != parseInt(this.get('newStart'))) {
        (0, _jquery.default)('#startSecs').css('background-color', 'red');
        newCuttingData = true;
      } else (0, _jquery.default)('#startSecs').css('background-color', '');

      if (this.get('end') != parseInt(this.get('newEnd'))) {
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

          if ((0, _jquery.default)('#iframe_api').length >= 1) {
            Ember.run.schedule("afterRender", () => this.initPlayer(false));
          } else {
            Ember.run.schedule("afterRender", () => this.setupYoutubeAPI(false));
          }
        } else {
          let dubIdMatch = location.search.match(/[?&]dubId=([^&]+)/) || [null, '-1'];
          let url = (0, _jquery.default)('#dub-data-url').val().replace(/:dubId/, dubIdMatch[1]);
          this.get('backendAdapter').request(url, 'GET').then(dubData => {
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
          var device = devices.filter(d => d.kind == 'audioinput' && d.getCapabilities && d.getCapabilities().sampleRate && d.getCapabilities().channelCount)[0];
          if (device == null) device = devices.filter(d => d.kind == 'audioinput')[0];
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
        if (parseInt((0, _jquery.default)('#startSecs').val()) >= parseInt((0, _jquery.default)('#endSecs').val())) (0, _jquery.default)('#endSecs').val(parseInt((0, _jquery.default)('#startSecs').val()) + this.get('end') - this.get('start'));
        if (!this.get('displayControls')) this.set('displayControls', true);
        if ([null, ""].indexOf((0, _jquery.default)('#videoUrl').val()) == -1) this.set('videoUrl', (0, _jquery.default)('#videoUrl').val());
        let noVideoChange = this.get('videoId') == (0, _jquery.default)('#videoId').val();
        var extraDubTrackDelay;
        if (noVideoChange && this.get('start') > this.get('origDubTrackStartSecs')) extraDubTrackDelay = (this.get('start') - this.get('origDubTrackStartSecs')) * 1000;else extraDubTrackDelay = 0;
        if ((0, _jquery.default)('#videoId').val() != '') this.set('videoId', (0, _jquery.default)('#videoId').val());
        let startSecsChange = parseInt((0, _jquery.default)('#startSecs').val()) - this.get('start');
        this.set('start', parseInt((0, _jquery.default)('#startSecs').val()));
        this.set('end', parseInt((0, _jquery.default)('#endSecs').val()));
        this.set('newStart', parseInt((0, _jquery.default)('#startSecs').val()));
        this.set('newEnd', parseInt((0, _jquery.default)('#endSecs').val()));

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
        this.set('dubTrackDelay', parseInt((0, _jquery.default)('#dubTrackDelayMillis').val()));
        this.set('innerDubTrackDelay', parseInt((0, _jquery.default)('#innerDubTrackDelayMillis').val()));
      },

      playVideo(orig = true) {
        this.set('orig', orig); // if (orig) {

        if (true || orig) {
          this.get('player').unMute(); // this.get('player').setVolume (this.get('volume') || 100)
        } // else {
        // this.get('player').mute()
        // // this.get('player').setVolume 0
        // }
        // this.get('player').playVideo()


        this.get('player').loadVideoById({
          'videoId': this.get('videoId'),
          // 'startSeconds': this.get('start') + (this.videoMilliSecsPosFlag == null ? 0 : this.videoMilliSecs / 1000),
          'startSeconds': this.get('start') + (this.videoMilliSecsPosFlag == null && this.videoSnippetStartMillis == null ? 0 : (this.videoSnippetStartMillis != null ? this.videoSnippetStartMillis : this.videoMilliSecs) / 1000),
          // 'endSeconds': this.videoMilliSecsPosFlag == null ? this.get('end') : this.get('start') + this.videoMilliSecs / 1000 + Math.min(this.videoSnippetDurationMillis / 1000, this.end - this.start)
          'endSeconds': this.videoMilliSecsPosFlag == null && this.videoSnippetStartMillis == null ? this.get('end') : this.get('start') + (this.videoSnippetStartMillis != null ? this.videoSnippetStartMillis : this.videoMilliSecs) / 1000 + Math.min(this.videoSnippetDurationMillis / 1000, this.end - this.start)
        });

        if (this.videoMilliSecsPosFlag != null) {
          this.setProperties({
            videoMilliSecsPosFlag: null
            /*, orig: true videoSnippetStartMillis: null*/

          });
        }
        /* else {
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
        console.log('stop recording audio-track ...'); // this.set('recording', false);
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
        // let secs = Math.floor((this.get('player').getCurrentTime() - this.start) + value / 100 * (this.end - this.start)); // / 1000;
        let milliSecs = parseInt(value); // this.set('videoMilliSecs', milliSecs - this.start * 1000);

        let videoMilliSecs = milliSecs - this.start * 1000;
        this.setProperties({
          videoMilliSecs: videoMilliSecs,
          videoSnippetStartMillis: videoMilliSecs != 0 ? videoMilliSecs : null
        });

        if (videoMilliSecs == 0) {
          console.log('setVideoMilliSecs: removing video snippet ...');
          this.setProperties({
            videoMilliSecsPosSetCount: 0,
            videoMilliSecsPosFlag: null
          });
          return;
        } // $('.select_video_position').val(Math.floor(secs / 10));


        console.log('setVideoMilliSecs: videoMilliSecsPosSetCount = ' + this.videoMilliSecsPosSetCount + ', milliSecs = ' + milliSecs + ', videoMilliSecs = ' + this.videoMilliSecs);

        if ((this.videoMilliSecsPosSetCount + 1) % 3 == 0) {
          this.setProperties({
            videoMilliSecsPosSetCount: 0
            /*, videoMilliSecsPosFlag: new Date()*/

          });
        } else {
          this.set('videoMilliSecsPosSetCount', this.videoMilliSecsPosSetCount + 1); // debounce(this, () => this.set('videoMilliSecsPosFlag', new Date()), 250);

          Ember.run.debounce(this, () => this.set('videoMilliSecsPosFlag', this.videoSnippetStartMillis != null ? new Date() : null), 250);
        } // this.player.seekTo(Math.floor(milliSecs / 1000), false);
        // this.player.pauseVideo();

      }

    },

    // audiobuffers can be started only once, so after end we setup next one for replay.
    initAudioBuffer(audioFileUrl) {
      this.set('audioBufferStarted', false);
      this.set('audioBuffer', this.connectAudioSource(audioFileUrl, data => {
        console.log('continue with original audio, videoStarted = ' + this.get('videoStarted') + ', data = ' + JSON.stringify(data)); // if (this.get('videoStarted')) {
        // // this.get('audioBuffer').disconnect()
        // this.set('videoSnippetStartMillis', null);

        (0, _jquery.default)('#rec_ctrl').attr("disabled", true);
        this.get('player').unMute(); // // this.get('player').setVolume (this.get('volume') || 100)

        return this.initAudioBuffer(audioFileUrl); // }
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
          'onStateChange': this.onYouTubePlayerStateChange.bind(this)
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
      })); // this.set('volume', 100); // this.get('player').getVolume()
    },

    onYouTubePlayerReady() {
      console.log('youTubePlayerReady ...');
      this.set('playerReady', true); // if this.get('dubSpecReady') && (!this.get('initialPlayed'))
      //   this.send 'playVideo', false

      if (this.get('showHowTo') && this.get('audioBuffer') == null) this.send('playVideo', true);
    },

    onYouTubePlayerStateChange(event) {
      console.log('yt-player-state: ' + event.data + ', videoStarted = ' + this.get('videoStarted') + ', playerState = ' + this.player.getPlayerState() + ', videoLoaded = ' + this.get('player').getVideoLoadedFraction() + ', recording = ' + this.get('recording') + ', initialPlayed = ' + this.get('initialPlayed') + ', orig = ' + this.get('orig'));

      switch (event.data) {
        // {UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5}
        case window.YT.PlayerState.PLAYING:
          if (!this.get('initialPlayed')) {
            if (this.get('orig') == null || this.get('orig')) this.set('orig', false); // this.get('player').mute()
          }

          (0, _jquery.default)('#play_orig').attr("disabled", true);
          (0, _jquery.default)('#play_dub').attr("disabled", true);
          var stopAudio = this.get('stopAudioCallback');
          if (stopAudio != null && this.get('audioBufferStarted')) stopAudio();
          this.set('videoStarted', true);
          console.log('yt-player started playing, orig = ' + this.get('orig') + ' ...');
          window.setTimeout(this.displayVideoMillisCallback('100'), '100');

          if (!this.get('orig')) {
            if (this.get('player').getVideoLoadedFraction() != 0) {
              if (this.get('recording')) {
                this.get('player').mute();
                console.log('start recording audio-track ...');

                if (navigator.userAgent.match(/Chrome/)) {
                  this.recordAudio.record(); // this.recordAudio.start();
                } else {
                  this.get('audioRecorder').record(300);
                }
              } else {
                if (this.get('dubTrackDelay') <= 0) this._startDubTrack(this.get('innerDubTrackDelay'));else {
                  if (this.videoSnippetStartMillis == null) window.setTimeout(this._startDubTrack.bind(this), this.get('dubTrackDelay'));else this._startDubTrack(this.get('innerDubTrackDelay'));
                }
              }
            }
          }

          break;

        case window.YT.PlayerState.ENDED:
          console.log('stopAudioCallback == null: ' + (this.get('stopAudioCallback') == null) + ', recording = ' + this.get('recording') + ', audioBufferStarted = ' + this.get('audioBufferStarted')); // this.audioContext.suspend();

          if (this.get('recording') && this.get('player').getVideoLoadedFraction() != 0) this.send('stopRecording'); // if (this.get('player').getVideoLoadedFraction() == 1) {

          if (!this.get('initialPlayed')) this.set('initialPlayed', true);

          if (this.get('videoStarted')) {
            // this.set('videoMilliSecs', 0);
            if (this.videoSnippetStartMillis == null) this.set('videoMilliSecs', 0);else this.set('videoMilliSecs', this.videoSnippetStartMillis); // this.set('videoSnippetStartMillis', null);
          }

          this.set('videoStarted', false);
          this.set('stopAudioCallback', null);
          (0, _jquery.default)('#play_orig').attr("disabled", false);
          (0, _jquery.default)('#play_dub').attr("disabled", false);
          (0, _jquery.default)('#rec_ctrl').attr("disabled", false);
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

          if (this.get('player').getCurrentTime() <= this.end
          /* && this.player.getPlayerState() != 0*/
          ) {
              Ember.run.debounce(this, () => this.set('videoMilliSecsPosFlag2', new Date()), parseInt(timeoutMillis) + 100);
              window.setTimeout(this.displayVideoMillisCallback(timeoutMillis), timeoutMillis);
            }
        }
      };
    },

    _startDubTrack() {
      if (this.videoSnippetStartMillis != null && this.videoSnippetStartMillis + this.videoSnippetDurationMillis - this.get('dubTrackDelay') <= this.get('innerDubTrackDelay')) {
        console.log('not playing dub-track if snippet will end befor dub-track ...');
        return;
      } // if (this.get('innerDubTrackDelay') <= 0)


      if (this.get('innerDubTrackDelay') <= 0 || this.videoSnippetStartMillis != null) this.get('player').mute();else // window.setTimeout(this.get('player').mute.bind(this.get('player')), this.get('innerDubTrackDelay'));
        window.setTimeout(() => this.get('player').mute(), this.get('innerDubTrackDelay'));
      console.log('start playing audio-track; player.startSeconds = ' + this.get('start') + ', player.getCurrentTime = ' + this.get('player').getCurrentTime() + ', audioContext.state = ' + this.audioContext.state + ', audioContext.currentTime = ' + this.audioContext.currentTime + ', dubTrackDelay = ' + this.get('dubTrackDelay') + ', videoMilliSecs = ' + this.videoMilliSecs + ', videoMilliSecsPos = ' + this.videoMilliSecsPos + ', videoSnippetStartMillis = ' + this.videoSnippetStartMillis);

      if (this.get('useAudioTag')) {
        (0, _jquery.default)('audio')[0].currentTime = 0.2; // this.get('player').getCurrentTime() - this.get('start');

        console.log('currentTime = ' + (0, _jquery.default)('audio')[0].currentTime);
        (0, _jquery.default)('audio')[0].play();
      } else {
        // if (this.get('audioBuffer') != null) {
        try {
          // if (this.audioContext.state == 'suspended') this.audioContext.resume();
          // this.get('audioBuffer').start(this.audioBuffer.context.currentTime + this.get('dubTrackDelay') / 1000, this.videoMilliSecs / 1000);
          // this.get('audioBuffer').start(this.audioBuffer.context.currentTime + this.get('dubTrackDelay') / 1000, Math.floor((this.videoMilliSecsPos-this.start*1000) / 1000));
          // this.get('audioBuffer').start(this.audioBuffer.context.currentTime + this.videoMilliSecs / 1000, this.get('dubTrackDelay') / 1000);
          if (this.videoSnippetStartMillis != null) {
            this.get('audioBuffer').start(0, (this.videoSnippetStartMillis - this.get('dubTrackDelay')) / 1000); // this.set('videoSnippetStartMillis', null);
          } else {
            this.get('audioBuffer').start();
          } // window.setTimeout(() => {
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
              console.log('connectAudioSource: onended ...');
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
      let url = (0, _jquery.default)('#publish-url').val();
      this.startWaiting();
      this.get('backendAdapter').request(url, 'POST', formData, null, false).then(response => {
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
;define("sparta/controllers/application", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Controller.extend({
    backendUrlPrefix: Sparta.backendUrlPrefix,
    isMobile: navigator.userAgent.match(/Mobile|webOS/) != null
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
    request(url, method, params, headers, isJson, callbackContext, noAuth) {
      params = params || null;
      headers = headers || {};
      noAuth = noAuth || false;
      if (typeof isJson == "undefined") isJson = true;
      console.log('BackendAdapter - request: url = ' + url + ', method = ' + method + ', callbackContext? = ' + (callbackContext != null));
      return this._promise(url, method, params, headers, isJson, callbackContext, noAuth, this.ajax);
    },

    _promise(url, method, params, headers, isJson, callbackContext, noAuth, ajax) {
      let promise = new Ember.RSVP.Promise((resolve, reject) => {
        // console.log 'BackendAdapter - setup request ...'
        let options = {};

        if (params != null) {
          if (isJson) options.data = JSON.stringify(params);else {
            options.data = params;
            options.cache = false;
            options.contentType = false;
            options.processData = false;
          }
        }

        if (isJson) {
          headers['Content-Type'] = 'application/json';
          options.headers = headers;
        }

        if (!noAuth && headers != null && headers['Authorization'] == null && this.get('session.session.content.authenticated.access_token') != null) headers['Authorization'] = `Bearer ${this.get('session.session.content.authenticated.access_token')}`;

        options.beforeSend = request => {
          for (let hName in Object.keys(headers)) request.setRequestHeader(hName, headers[hName]);
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
    "id": "76RksUES",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"id\",\"top-nav\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"class\",\"top-nav-button\"],[9],[4,\"link-to\",null,[[\"class\",\"route\"],[\"top-nav-button\",\"index\"]],{\"statements\":[[0,\"home\"]],\"parameters\":[]},null],[10],[0,\"\\n  \"],[7,\"span\"],[11,\"class\",\"top-nav-button\"],[9],[4,\"link-to\",null,[[\"class\",\"route\"],[\"top-nav-button\",\"library\"]],{\"statements\":[[0,\"library\"]],\"parameters\":[]},null],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"input\"],[11,\"id\",\"publish-url\"],[12,\"value\",[30,[[23,\"backendUrlPrefix\"],\"sparta/dub_track\"]]],[11,\"type\",\"hidden\"],[9],[10],[0,\"\\n\"],[7,\"input\"],[11,\"id\",\"dub-data-url\"],[12,\"value\",[30,[[23,\"backendUrlPrefix\"],\"sparta/dub_track/:dubId\"]]],[11,\"type\",\"hidden\"],[9],[10],[0,\"\\n\"],[7,\"input\"],[11,\"id\",\"dub-list-url\"],[12,\"value\",[30,[[23,\"backendUrlPrefix\"],\"sparta/dub_track_list\"]]],[11,\"type\",\"hidden\"],[9],[10],[0,\"\\n\"],[1,[23,\"outlet\"],false],[0,\"\\n\"]],\"hasEval\":false}",
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
    "id": "IbqH7nwN",
    "block": "{\"symbols\":[\"dubTrack\",\"idx\",\"&default\"],\"statements\":[[15,3],[0,\"\\n\\n\"],[4,\"each\",[[25,[\"dubTrackList\"]]],null,{\"statements\":[[7,\"img\"],[11,\"style\",\"border; 0px;\"],[12,\"src\",[30,[\"https://img.youtube.com/vi/\",[24,1,[\"videoId\"]],\"/default.jpg\"]]],[9],[10],[0,\" -\\n\"],[4,\"if\",[[25,[\"application\",\"isMobile\"]]],null,{\"statements\":[[7,\"a\"],[12,\"href\",[30,[\"whatsapp://send?text=\",[29,\"whatsappText\",[[24,1,[\"dubTrackUrl\"]]],null]]]],[11,\"data-action\",\"share/whatsapp/share\"],[9],[0,\"Share via Whatsapp\"],[10],[0,\" or\\n\"]],\"parameters\":[]},null],[7,\"a\"],[12,\"href\",[30,[[24,1,[\"dubTrackUrl\"]]]]],[11,\"target\",\"dubTrack\"],[9],[7,\"input\"],[11,\"readonly\",\"\"],[12,\"id\",[30,[\"share_\",[24,2,[]]]]],[12,\"value\",[30,[[24,1,[\"dubTrackUrl\"]]]]],[11,\"style\",\"width: 300px; border: 0px; color: blue;\"],[9],[10],[10],[0,\"\\n\"],[7,\"button\"],[11,\"type\",\"button\"],[9],[0,\"Copy Link to Clipboard\"],[3,\"action\",[[24,0,[]],\"copyToClipboard\",[29,\"append\",[\"#share\",[24,2,[]],\"_\"],null]]],[10],[0,\"\\n\"],[7,\"br\"],[9],[10],[0,\"\\n\"]],\"parameters\":[1,2]},null]],\"hasEval\":false}",
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
    "id": "kIkaGKto",
    "block": "{\"symbols\":[],\"statements\":[[4,\"if\",[[29,\"eq\",[[25,[\"currentStep\"]],1],null]],null,{\"statements\":[[0,\"  \"],[7,\"h3\"],[9],[0,\"\\n    Schritt \"],[1,[23,\"currentStep\"],false],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-left: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Weiter\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],1],null]]],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"isMobile\"]]],null,{\"statements\":[[0,\"  Wähle ein Video mit der gewünschten Filmszene auf \"],[7,\"a\"],[11,\"href\",\"https://www.youtu.be/\"],[11,\"target\",\"top\"],[9],[0,\"Youtube\"],[10],[0,\" aus und kopiere die Url über die \"],[7,\"i\"],[9],[0,\"Teilen\"],[10],[0,\"-Funktion.\"],[7,\"br\"],[9],[10],[7,\"br\"],[9],[10],[0,\"\\n  \"],[7,\"img\"],[11,\"style\",\"float: left\"],[11,\"src\",\"/assets/images/yt-teilen-1.mobile.png\"],[9],[10],[7,\"span\"],[11,\"style\",\"float: left;\"],[9],[0,\" => \"],[10],[0,\"\\n  \"],[7,\"img\"],[11,\"src\",\"/assets/images/yt-teilen-2.mobile.png\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"  Wähle ein Video mit der gewünschten Filmszene auf \"],[7,\"a\"],[11,\"href\",\"https://www.youtube.com/\"],[11,\"target\",\"top\"],[9],[0,\"Youtube\"],[10],[0,\" aus und kopiere die Url über die \"],[7,\"i\"],[9],[0,\"Teilen\"],[10],[0,\"-Funktion.\"],[7,\"br\"],[9],[10],[7,\"br\"],[9],[10],[0,\"\\n  \"],[7,\"img\"],[11,\"style\",\"float: left\"],[11,\"src\",\"/assets/images/yt-teilen-1.mobile.png\"],[9],[10],[7,\"span\"],[11,\"style\",\"float: left;\"],[9],[0,\" => \"],[10],[0,\"\\n  \"],[7,\"img\"],[11,\"src\",\"/assets/images/yt-teilen-2.png\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[29,\"eq\",[[25,[\"currentStep\"]],2],null]],null,{\"statements\":[[0,\"\\n  \"],[7,\"h3\"],[9],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-right: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Zurück\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],-1],null]]],[10],[0,\"\\n    Schritt \"],[1,[23,\"currentStep\"],false],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-left: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Weiter\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],1],null]]],[10],[0,\"\\n  \"],[10],[0,\"\\n  Füge die kopierte Url in das Formular-Feld \"],[7,\"span\"],[11,\"style\",\"background-color: white;\"],[9],[0,\"[Video-Url]\"],[10],[0,\" ein.\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[29,\"eq\",[[25,[\"currentStep\"]],3],null]],null,{\"statements\":[[0,\"  \"],[7,\"h3\"],[9],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-right: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Zurück\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],-1],null]]],[10],[0,\"\\n    Schritt \"],[1,[23,\"currentStep\"],false],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-left: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Weiter\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],1],null]]],[10],[0,\"\\n  \"],[10],[0,\"\\n  Trage die Start- und End-Sekunden der gewünschten Szene in die Formular-Felder \"],[7,\"span\"],[11,\"style\",\"background-color: white;\"],[9],[0,\"[Szene-Start]\"],[10],[0,\" und \"],[7,\"span\"],[11,\"style\",\"background-color: white;\"],[9],[0,\"[Szene-Ende]\"],[10],[0,\" ein.\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[29,\"eq\",[[25,[\"currentStep\"]],4],null]],null,{\"statements\":[[0,\"  \"],[7,\"h3\"],[9],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-right: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Zurück\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],-1],null]]],[10],[0,\"\\n    Schritt \"],[1,[23,\"currentStep\"],false],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-left: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Weiter\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],1],null]]],[10],[0,\"\\n  \"],[10],[0,\"\\n  Speichere die Angaben mit \"],[7,\"button\"],[11,\"style\",\"background-color: red;\"],[11,\"type\",\"button\"],[9],[0,\"Set Cutting Data\"],[10],[0,\" und überprüfe mit \"],[7,\"button\"],[11,\"style\",\"background-color: yellow;\"],[11,\"type\",\"button\"],[9],[0,\"Play Orig\"],[10],[0,\" die korrekte Wiedergabe der Szene.\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[29,\"eq\",[[25,[\"currentStep\"]],5],null]],null,{\"statements\":[[0,\"  \"],[7,\"h3\"],[9],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-right: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Zurück\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],-1],null]]],[10],[0,\"\\n    Schritt \"],[1,[23,\"currentStep\"],false],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-left: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Weiter\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],1],null]]],[10],[0,\"\\n  \"],[10],[0,\"\\n  Starte die Audio-Aufnahme mit \"],[7,\"button\"],[11,\"type\",\"button\"],[9],[0,\"Start Record Audio\"],[10],[0,\" und sprich deinen Text zum passenden Zeitpunkt. Danach klick sofort auf \"],[7,\"button\"],[11,\"style\",\"background-color:red;\"],[11,\"type\",\"button\"],[9],[0,\"Stop Record Audio\"],[10],[0,\" um ab diesem Zeitpunkt wieder den Originalton zu hören.\\n  Überprüfe das korrekte Timing deiner Aufnahme mit \"],[7,\"button\"],[11,\"style\",\"background-color: blue;\"],[11,\"type\",\"button\"],[9],[0,\"Play Dub\"],[10],[0,\".\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[29,\"eq\",[[25,[\"currentStep\"]],6],null]],null,{\"statements\":[[0,\"  \"],[7,\"h3\"],[9],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-right: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Zurück\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],-1],null]]],[10],[0,\"\\n    Schritt \"],[1,[23,\"currentStep\"],false],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-left: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Weiter\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],1],null]]],[10],[0,\"\\n  \"],[10],[0,\"\\n  Um den Originalton bis zu deiner Aufnahme hörbar zu machen, markiere den gewünschten Synchronisationsbeginn mit \"],[7,\"button\"],[11,\"type\",\"button\"],[9],[0,\"Set Synchronisation Start\"],[10],[0,\", wodurch der Zeitpunkt\\n  ins Formular-Feld \"],[7,\"span\"],[11,\"style\",\"background-color: white;\"],[9],[0,\"[Synchronisations-Start nach Aufnahme-Start]\"],[10],[0,\" übernommen wird. Du kannst diesen Wert später direkt im Formular-Feld noch justieren.\\n  Speichere den Wert mit \"],[7,\"button\"],[11,\"style\",\"background-color: red;\"],[11,\"type\",\"button\"],[9],[0,\"Set Dub-Track Delay\"],[10],[0,\" und überprüfe das Timing wieder mit \"],[7,\"button\"],[11,\"style\",\"background-color: blue;\"],[11,\"type\",\"button\"],[9],[0,\"Play Dub\"],[10],[0,\".\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[29,\"eq\",[[25,[\"currentStep\"]],7],null]],null,{\"statements\":[[0,\"  \"],[7,\"h3\"],[9],[0,\"\\n    \"],[7,\"button\"],[11,\"style\",\"margin-right: 20px;\"],[11,\"type\",\"button\"],[9],[0,\"Zurück\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"currentStep\"]]],null],[29,\"add\",[[25,[\"currentStep\"]],-1],null]]],[10],[0,\"\\n    Schritt \"],[1,[23,\"currentStep\"],false],[0,\"\\n\"],[0,\"  \"],[10],[0,\"\\n  Wenn alles passt, dann kannst du mit \"],[7,\"button\"],[11,\"style\",\"background-color: green;\"],[11,\"type\",\"button\"],[9],[0,\"Share Video\"],[10],[0,\" deine Szenen-Synchronisation\\n  sichern, und die App generiert eine Url die du an deine Freunde schicken kannst.\\n\"],[4,\"if\",[[25,[\"isMobile\"]]],null,{\"statements\":[[0,\"  Oder du teilst die Url mit dem \"],[7,\"a\"],[11,\"href\",\"\"],[9],[0,\"Share via Whatsapp\"],[10],[0,\"-Link.\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null]],\"parameters\":[]}]],\"parameters\":[]}]],\"parameters\":[]}]],\"parameters\":[]}]],\"parameters\":[]}]],\"parameters\":[]}],[2,\"\\n<div style=\\\"width: {{playerWidth}}px; margin-top: 7px;\\\">\\nCreating a Dub-Track involves 2 Phases: <span class=\\\"howTo phase1\\\">First you only edit the Part/Timespan where you want to replace/dub the Video's Original Audiotrack.</span><span class=\\\"howTo phase2\\\">Second, you optionally edit the actual start/end of the video if it should be different.</span>\\n</div>\\n<ol style=\\\"margin-top: 0px; margin-bottom: 0px; padding: 10px; width: {{playerWidth}}px;\\\">\\n  <li class=\\\"howTo phase1\\\">Set Youtube Video-Id, Video-Start-Secs short before the time when the Dub-Track should start and Video-End-Secs after the Dub-Track should end. <span class=\\\"howTo phase2\\\">You can later fine-tune the exact start-time of your Dub-Track, so that there's no gap between the original Audio-Track (@see 4.),</span> whereas the end-point currently can't be changed.</li>\\n  <li class=\\\"howTo phase1\\\">Click <button type=\\\"button\\\">Start Record Audio</button> and Dub the Video. The button changes to <button style=\\\"background-color:red;\\\" type=\\\"button\\\">Stop Record Audio</button> and you have to click it right after your Dub-Track is complete and the original Track shall be audible again.</li>\\n  <li class=\\\"howTo phase1\\\">After Recording check your Dub-Track by clicking <button type=\\\"button\\\" style=\\\"background-color: blue;\\\">Play Dub</button></li>\\n  <li class=\\\"howTo phase2\\\">You can also fine-tune the Dub-Track's start-time if you want the Videos original preceding Audio-Track to play longer. Set the value in \\\"Inner Dub-Track Delay Milliseconds\\\"</li>\\n  <li class=\\\"howTo phase2\\\">If you want the Video to start some Time before Your Dub-Track then you can change the Video-Start-Secs now to an earlier moment and click <button type=\\\"button\\\">Set Cutting Data</button>. You'll notice that the value of \\\"Dub-Track Delay Milliseconds\\\" will change accordingly, meaning that the Dub-Track will start some Time after the Video.</li>\\n</ol>\\n\"],[0,\"\\n\"],[2,\"The <button type=\\\"button\\\">Start Record Audio</button> will change to <button style=\\\"background-color:red;\\\" type=\\\"button\\\">Stop Record Audio</button> after clicking.\"],[0,\"\\n\"],[2,\" ENGLISH\\nWith the <button type=\\\"button\\\" style=\\\"background-color: yellow;\\\">Play Orig</button> button you can always replay the original soundtrack.\\n<ol style=\\\"margin-top: 0px; margin-bottom: 0px; padding-left: 20px;\\\">\\n  <li class=\\\"howTo phase1\\\">Click <button type=\\\"button\\\">Start Record Audio</button> and say the name of your favorite city when Leonidas would say Sparta. Then click <button style=\\\"background-color:red;\\\" type=\\\"button\\\">Stop Record Audio</button> immediately.</li>\\n  <li class=\\\"howTo phase2\\\">Check the correct timing of your recording by clicking <button type=\\\"button\\\" style=\\\"background-color: blue;\\\">Play Dub</button></li>\\n  <li class=\\\"howTo phase1\\\">Now set the value in \\\"Inner Dub-Track Delay Milliseconds\\\" to 1600 and click <button type=\\\"button\\\">Set Dub-Track Delay</button>, so the original soundtrack will be audible until your dub. Check again with <button type=\\\"button\\\" style=\\\"background-color: blue;\\\">Play Dub</button> and fine-tune the delay-value as necessary.</li>\\n  <li class=\\\"howTo phase2\\\">Now you can start the Video 3 more seconds before Your Dub-Track by changing the \\\"Video-Start-Secs\\\" from 49 to 46 and click <button type=\\\"button\\\">Set Cutting Data</button>. You'll notice that the value of \\\"Dub-Track Delay Milliseconds\\\" will change accordingly, meaning that the Dub-Track will start some Time after the Video. Clicking <button type=\\\"button\\\" style=\\\"background-color: blue;\\\">Play Dub</button> will show the changes.</li>\\n  <li class=\\\"howTo phase1\\\">Now you can share the Dub-Track by clicking <button type=\\\"button\\\" style=\\\"background-color: green;\\\">Share Video</button>. After short time you'll see right above the video an url that you can share for direct access. You can also share via whatsapp on smartphones.</li>\\n</ol>\\n/ENGLISH \"],[0,\"\\n\"],[2,\" DEUTSCH \"],[0,\"\\n\"]],\"hasEval\":false}",
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
    "id": "uXV1IAGL",
    "block": "{\"symbols\":[\"sharedDubTrackData\",\"idx\",\"&default\"],\"statements\":[[15,3],[0,\"\\n\\n\"],[7,\"div\"],[11,\"style\",\"position: fixed; top: 10px; left: 300px;\"],[9],[0,\"\\n\"],[4,\"unless\",[[29,\"eq\",[[25,[\"application\",\"currentRouteName\"]],\"new\"],null]],null,{\"statements\":[[4,\"link-to\",null,[[\"route\"],[\"new\"]],{\"statements\":[[0,\"Neues Video\"]],\"parameters\":[]},null]],\"parameters\":[]},null],[4,\"if\",[[25,[\"initialPlayed\"]]],null,{\"statements\":[[4,\"unless\",[[25,[\"showHowTo\"]]],null,{\"statements\":[[0,\"  \"],[1,[29,\"input\",null,[[\"type\",\"name\",\"checked\"],[\"checkbox\",\"showHowTo\",[25,[\"showHowTo\"]]]]],false],[0,\"Show HowTo\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null],[10],[0,\"\\n\"],[7,\"hr\"],[9],[10],[0,\"\\n\\n\"],[4,\"each\",[[25,[\"sharedDubTrackUrls\"]]],null,{\"statements\":[[7,\"img\"],[11,\"style\",\"border; 0px;\"],[12,\"src\",[30,[\"https://img.youtube.com/vi/\",[24,1,[\"videoId\"]],\"/default.jpg\"]]],[9],[10],[0,\" -\\n\"],[4,\"if\",[[25,[\"application\",\"isMobile\"]]],null,{\"statements\":[[7,\"a\"],[12,\"href\",[30,[\"whatsapp://send?text=\",[24,1,[\"whatsAppText\"]]]]],[11,\"data-action\",\"share/whatsapp/share\"],[9],[0,\"Share via Whatsapp\"],[10],[0,\" or\\n\"]],\"parameters\":[]},null],[7,\"a\"],[12,\"href\",[30,[[24,1,[\"dubTrackUrl\"]]]]],[11,\"target\",\"dubTrack\"],[9],[7,\"input\"],[11,\"readonly\",\"\"],[12,\"id\",[30,[\"share_\",[24,2,[]]]]],[12,\"value\",[30,[[24,1,[\"dubTrackUrl\"]]]]],[11,\"style\",\"width: 300px; border: 0px; color: blue;\"],[9],[10],[10],[0,\"\\n\"],[7,\"button\"],[11,\"type\",\"button\"],[9],[0,\"Copy Link to Clipboard\"],[3,\"action\",[[24,0,[]],\"copyToClipboard\",[29,\"append\",[\"#share\",[24,2,[]],\"_\"],null]]],[10],[0,\"\\n\"],[7,\"br\"],[9],[10],[0,\"\\n\"]],\"parameters\":[1,2]},null],[0,\"\\n\"],[4,\"if\",[[25,[\"dubSpecReady\"]]],null,{\"statements\":[[7,\"table\"],[9],[0,\"\\n  \"],[7,\"tr\"],[9],[0,\"\\n    \"],[7,\"td\"],[9],[0,\"\\n      \"],[7,\"div\"],[11,\"id\",\"video\"],[9],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"initialPlayed\"]]],null,{\"statements\":[[0,\"      \"],[7,\"br\"],[9],[10],[0,\"\\n\"],[0,\"      \"],[7,\"input\"],[11,\"style\",\"width: 300px;\"],[11,\"class\",\"select_video_position\"],[12,\"min\",[30,[[29,\"mult\",[[25,[\"start\"]],1000],null]]]],[12,\"max\",[30,[[29,\"mult\",[[25,[\"end\"]],1000],null]]]],[12,\"value\",[30,[[23,\"videoMilliSecsPos\"]]]],[11,\"step\",\"100\"],[12,\"oninput\",[29,\"action\",[[24,0,[]],\"setVideoMilliSecs\"],[[\"value\"],[\"target.value\"]]]],[11,\"type\",\"range\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[29,\"or\",[[25,[\"initialPlayed\"]],[25,[\"showHowTo\"]]],null]],null,{\"statements\":[[0,\"      \"],[7,\"br\"],[9],[10],[0,\"\\n      \"],[7,\"div\"],[11,\"style\",\"width: 300px;\"],[9],[0,\"\\n        \"],[7,\"div\"],[11,\"id\",\"video-milli-secs\"],[11,\"style\",\"width: 80px; height: 20px; border: solid 1px; font-weight: 800; text-align: right; float: left;\"],[9],[0,\"\\n          \"],[1,[23,\"videoMilliSecs\"],false],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"style\",\"height: 20px; margin-left: 10px; float: left;\"],[9],[0,\"Millisekunden ab Szene-Start\"],[10],[0,\"\\n      \"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"audioBuffer\"]]],null,{\"statements\":[[0,\"      \"],[7,\"button\"],[11,\"style\",\"height: 20px; margin-left: 10px;\"],[11,\"type\",\"button\"],[9],[0,\"Set Synchronisation Start\"],[3,\"action\",[[24,0,[]],[29,\"mut\",[[25,[\"newInnerDubTrackDelay\"]]],null],[25,[\"videoMilliSecs\"]]]],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null],[0,\"    \"],[10],[0,\"\\n\"],[0,\"  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"br\"],[11,\"style\",\"clear: both;\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"\\n\"],[4,\"if\",[[25,[\"playerReady\"]]],null,{\"statements\":[[4,\"if\",[[29,\"and\",[[25,[\"initialPlayed\"]],[25,[\"displayControls\"]]],null]],null,{\"statements\":[[4,\"if\",[[25,[\"audioBuffer\"]]],null,{\"statements\":[[7,\"span\"],[11,\"style\",\"float: left; margin-left: 0px 10px 0px 10px;\"],[9],[0,\"\\n\"],[7,\"button\"],[11,\"id\",\"play_dub\"],[11,\"style\",\"background-color: blue;\"],[11,\"type\",\"button\"],[9],[0,\"Play Dub\"],[3,\"action\",[[24,0,[]],\"playVideo\",false]],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[7,\"span\"],[11,\"style\",\"float: left; margin-left: 0px 10px 0px 10px;\"],[9],[0,\"\\n\"],[7,\"button\"],[11,\"id\",\"play_orig\"],[11,\"style\",\"background-color: yellow;\"],[11,\"type\",\"button\"],[9],[0,\"Play Orig\"],[3,\"action\",[[24,0,[]],\"playVideo\"]],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"span\"],[9],[0,\"\\n\"],[4,\"unless\",[[25,[\"recorded\"]]],null,{\"statements\":[[4,\"unless\",[[25,[\"recording\"]]],null,{\"statements\":[[7,\"button\"],[11,\"id\",\"rec_ctrl\"],[11,\"type\",\"button\"],[9],[0,\"Start Record Audio\"],[3,\"action\",[[24,0,[]],\"startRecording\"]],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[7,\"button\"],[11,\"style\",\"background-color:red;\"],[11,\"type\",\"button\"],[9],[0,\"Stop Record Audio\"],[3,\"action\",[[24,0,[]],\"stopRecording\"]],[10],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},{\"statements\":[[7,\"span\"],[9],[0,\"Audio Saved\"],[10],[0,\"\\n\"]],\"parameters\":[]}],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"audioBuffer\"]]],null,{\"statements\":[[7,\"span\"],[11,\"style\",\"margin: 0px 0px 0px 20px;\"],[9],[0,\"\\n\"],[7,\"button\"],[11,\"style\",\"background-color: green;\"],[11,\"type\",\"button\"],[9],[0,\"Share Video\"],[3,\"action\",[[24,0,[]],\"shareVideo\"]],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null]],\"parameters\":[]},null],[4,\"if\",[[25,[\"showHowTo\"]]],null,{\"statements\":[[7,\"br\"],[9],[10],[0,\"\\n\"],[7,\"div\"],[12,\"style\",[30,[\"width: \",[23,\"playerWidth\"],\"px; margin-top: 7px; padding: 0px 0px 20px 0px;\"]]],[11,\"class\",\"howTo phase1\"],[9],[0,\"\\n  \"],[1,[29,\"how-to\",null,[[\"isMobile\"],[[25,[\"application\",\"isMobile\"]]]]],false],[0,\"\\n\"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"\\n\"],[4,\"if\",[[29,\"or\",[[25,[\"initialPlayed\"]],[25,[\"showHowTo\"]]],null]],null,{\"statements\":[[7,\"br\"],[9],[10],[0,\"\\nVideo-Url: \"],[1,[29,\"input\",null,[[\"id\",\"value\"],[\"videoUrl\",[25,[\"videoUrl\"]]]]],false],[0,\" oder Video-Id: \"],[7,\"input\"],[11,\"id\",\"videoId\"],[12,\"value\",[30,[[23,\"videoId\"]]]],[9],[10],[7,\"br\"],[9],[10],[0,\"\\nSzene-Start: \"],[1,[29,\"input\",null,[[\"type\",\"min\",\"step\",\"id\",\"value\"],[\"number\",\"0\",\"1\",\"startSecs\",[25,[\"newStart\"]]]]],false],[0,\" Sekunden (aktuell: \"],[1,[23,\"start\"],false],[0,\")\"],[7,\"br\"],[9],[10],[0,\"\\nSzene-Ende: \"],[1,[29,\"input\",null,[[\"type\",\"min\",\"step\",\"id\",\"value\"],[\"number\",\"0\",\"1\",\"endSecs\",[25,[\"newEnd\"]]]]],false],[0,\" Sekunden (aktuell: \"],[1,[23,\"end\"],false],[0,\")\"],[7,\"br\"],[9],[10],[0,\"\\n\"],[7,\"button\"],[11,\"id\",\"setCuttingData\"],[11,\"type\",\"button\"],[9],[0,\"Set Cutting Data\"],[3,\"action\",[[24,0,[]],\"setVideoId\"]],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"audioBuffer\"]]],null,{\"statements\":[[7,\"br\"],[9],[10],[7,\"br\"],[9],[10],[0,\"\\nAufnahme-Verzögerung nach Szene-Start: \"],[1,[29,\"input\",null,[[\"type\",\"min\",\"step\",\"id\",\"value\"],[\"number\",\"0\",\"100\",\"dubTrackDelayMillis\",[25,[\"newDubTrackDelay\"]]]]],false],[0,\" Millisekunden (aktuell: \"],[1,[23,\"dubTrackDelay\"],false],[0,\")\"],[7,\"br\"],[9],[10],[0,\"\\nSynchronisations-Start nach Aufnahme-Start: \"],[1,[29,\"input\",null,[[\"type\",\"min\",\"step\",\"id\",\"value\"],[\"number\",\"0\",\"100\",\"innerDubTrackDelayMillis\",[25,[\"newInnerDubTrackDelay\"]]]]],false],[0,\" Millisekunden (aktuell: \"],[1,[23,\"innerDubTrackDelay\"],false],[0,\")\"],[7,\"br\"],[9],[10],[0,\"\\n\"],[7,\"button\"],[11,\"id\",\"setDubTrackDelay\"],[11,\"type\",\"button\"],[9],[0,\"Set Dub-Track Delay\"],[3,\"action\",[[24,0,[]],\"setDubTrackSecs\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null],[7,\"br\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[2,\"\\n<button type=\\\"button\\\" {{action \\\"newDubTrack\\\"}}>Create new Dub-Track</button>\\n\"],[0,\"\\n\"]],\"parameters\":[]}]],\"hasEval\":false}",
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
            require("sparta/app")["default"].create({"backendUrlPrefix":"https://whatsbetter.ctrl.info.tm/","name":"sparta","version":"0.0.0+9ffef880"});
          }
        
//# sourceMappingURL=sparta.map
