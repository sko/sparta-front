"use strict";

/* jshint ignore:start */



/* jshint ignore:end */

define('sparta/app', ['exports', 'ember', 'sparta/resolver', 'ember-load-initializers', 'sparta/config/environment'], function (exports, _ember, _spartaResolver, _emberLoadInitializers, _spartaConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _spartaConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _spartaConfigEnvironment['default'].podModulePrefix,
    Resolver: _spartaResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _spartaConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});
define('sparta/components/sound-track-creator', ['exports', 'recorder'], function (exports, _recorder) {
  var SoundTrackCreatorComponent;

  SoundTrackCreatorComponent = Ember.Component.extend({
    recordAudio: Ember.inject.service(),
    backendAdapter: Ember.inject.service(),
    application: (function () {
      return Ember.getOwner(this).lookup('controller:application');
    }).property(),
    skipSample: false,
    showHowTo: false,
    howToObserver: Ember.observer('showHowTo', function () {
      var dubTrackProps, i, j, k, l, len, len1, len2, len3, propKey, ref, ref1, ref2, videoProps;
      videoProps = ['videoId', 'start', 'newStart', 'origDubTrackStartSecs', 'end', 'newEnd', 'audioBuffer', 'initialPlayed'];
      dubTrackProps = ['dubTrackDelay', 'newDubTrackDelay', 'innerDubTrackDelay', 'newInnerDubTrackDelay'];
      if (this.get('showHowTo')) {
        ref = videoProps.concat(dubTrackProps);
        for (i = 0, len = ref.length; i < len; i++) {
          propKey = ref[i];
          this.set('howToOrig' + propKey, this.get(propKey));
        }
        this.set('videoId', 'haNzpiLYdEk');
        this.set('origDubTrackStartSecs', this.set('newStart', this.set('start', 49)));
        this.set('newEnd', this.set('end', 55));
        this.set('audioBuffer', null);
        this.set('initialPlayed', true);
        this.set('orig', true);
        for (j = 0, len1 = dubTrackProps.length; j < len1; j++) {
          propKey = dubTrackProps[j];
          this.set(propKey, 0);
        }
      } else {
        ref1 = videoProps.concat(dubTrackProps);
        for (k = 0, len2 = ref1.length; k < len2; k++) {
          propKey = ref1[k];
          this.set(propKey, this.get('howToOrig' + propKey));
        }
        ref2 = videoProps.concat(dubTrackProps);
        for (l = 0, len3 = ref2.length; l < len3; l++) {
          propKey = ref2[l];
          this.set('howToOrig' + propKey, null);
        }
      }
      if (!this.get('displayControls')) {
        this.set('displayControls', true);
      }
      this.get('player').destroy();
      return this.initPlayer();
    }),
    audioContext: Ember.computed.alias('recordAudio.audioContext'),
    dubSpecReady: false,
    displayControls: true,
    initialPlayed: false,
    useAudioTag: (function () {
      return false;
    }).property(),
    player: null,
    playerWidth: (function () {
      return 560;
    }).property(),
    playerHeight: (function () {
      return 315;
    }).property(),
    playerReady: (function () {
      return false;
    }).property(),
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
    changeObserver: Ember.observer('start', 'newStart', 'end', 'newEnd', 'dubTrackDelay', 'newDubTrackDelay', 'innerDubTrackDelay', 'newInnerDubTrackDelay', function () {
      var newCuttingData, newDubTrackDelay;
      newCuttingData = false;
      if (this.get('start') !== parseInt(this.get('newStart'))) {
        $('#startSecs').css('background-color', 'red');
        newCuttingData = true;
      } else {
        $('#startSecs').css('background-color', '');
      }
      if (this.get('end') !== parseInt(this.get('newEnd'))) {
        $('#endSecs').css('background-color', 'red');
        newCuttingData = true;
      } else {
        $('#endSecs').css('background-color', '');
      }
      if (newCuttingData) {
        $('#setCuttingData').css('background-color', 'red');
      } else {
        $('#setCuttingData').css('background-color', '');
      }
      newDubTrackDelay = false;
      if (this.get('dubTrackDelay') !== parseInt(this.get('newDubTrackDelay'))) {
        $('#dubTrackDelayMillis').css('background-color', 'red');
        newDubTrackDelay = true;
      } else {
        $('#dubTrackDelayMillis').css('background-color', '');
      }
      if (this.get('innerDubTrackDelay') !== parseInt(this.get('newInnerDubTrackDelay'))) {
        $('#innerDubTrackDelayMillis').css('background-color', 'red');
        newDubTrackDelay = true;
      } else {
        $('#innerDubTrackDelayMillis').css('background-color', '');
      }
      if (newDubTrackDelay) {
        return $('#setDubTrackDelay').css('background-color', 'red');
      } else {
        return $('#setDubTrackDelay').css('background-color', '');
      }
    }),
    orig: true,
    volume: null,
    videoStarted: false,
    stopAudioCallback: null,
    setupAudioTracking: (function () {
      var AudioContext, constraints, dubIdMatch, error, gUM, url;
      this.set('application.sTC', this);
      try {
        AudioContext = window.AudioContext || window.webkitAudioContext;
        this.set('audioContext', new AudioContext());
      } catch (error1) {
        error = error1;
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
            Ember.run.schedule("afterRender", (function (_this) {
              return function () {
                return _this.initPlayer();
              };
            })(this));
          } else {
            Ember.run.schedule("afterRender", (function (_this) {
              return function () {
                return _this.setupYoutubeAPI();
              };
            })(this));
          }
        } else {
          dubIdMatch = location.search.match(/[?&]dubId=([^&]+)/) || [null, '-1'];
          url = $('#dub-data-url').val().replace(/:dubId/, dubIdMatch[1]);
          this.get('backendAdapter').request(url, 'GET').then((function (_this) {
            return function (dubData) {
              _this.set('videoId', dubData.video_id);
              _this.set('origDubTrackStartSecs', dubData.start_secs + dubData.delay_millis / 1000);
              _this.set('start', dubData.start_secs);
              _this.set('end', dubData.end_secs);
              _this.set('dubTrackDelay', dubData.delay_millis);
              _this.set('innerDubTrackDelay', dubData.inner_delay_millis);
              _this.set('newStart', dubData.start_secs);
              _this.set('newEnd', dubData.end_secs);
              _this.set('newDubTrackDelay', dubData.delay_millis);
              _this.set('newInnerDubTrackDelay', dubData.inner_delay_millis);
              if (_this.get('useAudioTag')) {
                _this.createDownloadLink(dubData.dub_track_url);
              } else {
                _this.initAudioBuffer(_this.set('dubTrackUrl', dubData.dub_track_url));
              }
              _this.set('dubSpecReady', true);
              return Ember.run.schedule("afterRender", function () {
                return _this.setupYoutubeAPI();
              });
            };
          })(this));
        }
        constraints = {
          audio: true
        };
        gUM = Modernizr.prefixed('getUserMedia', navigator);
        return gUM(constraints, (function (_this) {
          return function (stream) {
            var recorderConfig;
            recorderConfig = {
              bufferLen: 8192,
              numChannels: 1
            };
            _this.set('audioInput', stream);
            return _this.set('audioRecorder', new Recorder(_this.get('audioContext').createMediaStreamSource(stream), recorderConfig));
          };
        })(this), (function (_this) {
          return function (e) {
            return console.log('Reeeejected!', e);
          };
        })(this));
      }
    }).on('init'),
    actions: {
      setVideoId: function setVideoId() {
        var extraDubTrackDelay, newDubTrackDelay, noVideoChange, startSecsChange;
        if (parseInt($('#startSecs').val()) >= parseInt($('#endSecs').val())) {
          $('#endSecs').val(parseInt($('#startSecs').val()) + this.get('end') - this.get('start'));
        }
        if (!this.get('displayControls')) {
          this.set('displayControls', true);
        }
        noVideoChange = this.get('videoId') === $('#videoId').val();
        if (noVideoChange && this.get('start') > this.get('origDubTrackStartSecs')) {
          extraDubTrackDelay = (this.get('start') - this.get('origDubTrackStartSecs')) * 1000;
        } else {
          extraDubTrackDelay = 0;
        }
        this.set('videoId', $('#videoId').val());
        startSecsChange = parseInt($('#startSecs').val()) - this.get('start');
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
        return this.initPlayer();
      },
      setDubTrackSecs: function setDubTrackSecs() {
        this.set('dubTrackDelay', parseInt($('#dubTrackDelayMillis').val()));
        return this.set('innerDubTrackDelay', parseInt($('#innerDubTrackDelayMillis').val()));
      },
      playVideo: function playVideo(orig) {
        if (orig == null) {
          orig = true;
        }
        this.set('orig', orig);
        if (orig) {
          this.get('player').unMute();
        }
        return this.get('player').loadVideoById({
          'videoId': this.get('videoId'),
          'startSeconds': this.get('start'),
          'endSeconds': this.get('end')
        });
      },
      startRecording: function startRecording() {
        this.set('dubTrackDelay', 0);
        this.set('innerDubTrackDelay', 0);
        this.set('newDubTrackDelay', 0);
        this.set('newInnerDubTrackDelay', 0);
        this.set('recording', true);
        return this.send('playVideo', false);
      },
      stopRecording: function stopRecording() {
        console.log('stop recording audio-track ...');
        this.set('recording', false);
        this.set('recorded', true);
        this.get('audioRecorder').stop();
        this.get('player').unMute();
        this.get('audioRecorder').exportWAV((function (_this) {
          return function (blob) {
            _this.set('audioBlob', blob);
            if (_this.get('useAudioTag')) {
              return _this.createDownloadLink(_this.set('dubTrackUrl', URL.createObjectURL(blob)));
            } else {
              return _this.initAudioBuffer(_this.set('dubTrackUrl', URL.createObjectURL(blob)));
            }
          };
        })(this));
        return this.get('audioRecorder').clear();
      },
      shareVideo: function shareVideo() {
        var reader;
        reader = new window.FileReader();
        reader.onloadend = (function (_this) {
          return function () {
            _this.set('dubTrackData', reader.result);
            return _this.uploadDubData(null, function (dubData) {
              var dubIdMatch, dubTrackUrl;
              if ((dubIdMatch = location.search.match(/([?&])dubId=[^&]+/)) != null) {
                dubTrackUrl = location.href.replace(/([?&]dubId=)[^&]+/, '$1' + dubData.id);
              } else {
                dubTrackUrl = location.href + '?dubId=' + dubData.id;
              }
              if (_this.get('application.isMobile')) {
                return _this.set('sharedDubTrackUrls', _this.get('sharedDubTrackUrls').concat([{
                  videoId: _this.get('videoId'),
                  dubTrackUrl: dubTrackUrl,
                  whatsAppText: encodeURI('DubTrack => ' + dubTrackUrl)
                }]));
              } else {
                return _this.set('sharedDubTrackUrls', _this.get('sharedDubTrackUrls').concat([{
                  videoId: _this.get('videoId'),
                  dubTrackUrl: dubTrackUrl
                }]));
              }
            });
          };
        })(this);
        return reader.readAsDataURL(this.get('audioBlob'));
      },
      copyToClipboard: function copyToClipboard(selector) {
        var copyDatainput;
        copyDatainput = document.querySelector(selector);
        copyDatainput.select();
        return document.execCommand('copy');
      },
      newDubTrack: function newDubTrack() {
        return this.get('router').transitionTo('new');
      }
    },
    initAudioBuffer: function initAudioBuffer(audioFileUrl) {
      this.set('audioBufferStarted', false);
      return this.set('audioBuffer', this.connectAudioSource(audioFileUrl, (function (_this) {
        return function (data) {
          console.log('continue with original audio, videoStarted = ' + _this.get('videoStarted'));
          if (_this.get('videoStarted')) {
            $('#rec_ctrl').attr("disabled", true);
            _this.get('player').unMute();
            return _this.initAudioBuffer(audioFileUrl);
          }
        };
      })(this)));
    },
    setupYoutubeAPI: function setupYoutubeAPI() {
      var firstScriptTag, tag;
      window.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this);
      tag = document.createElement('script');
      tag.id = "iframe_api";
      tag.src = "//www.youtube.com/iframe_api";
      firstScriptTag = document.getElementsByTagName('script')[0];
      return firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    },
    onYouTubeIframeAPIReady: function onYouTubeIframeAPIReady() {
      console.log('youTubeIframeAPIReady ...');
      return this.initPlayer();
    },
    initPlayer: function initPlayer() {
      return this.set('player', new YT.Player('video', {
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
          html5: 1
        }
      }));
    },
    onYouTubePlayerReady: function onYouTubePlayerReady() {
      console.log('youTubePlayerReady ...');
      this.set('playerReady', true);
      if (this.get('showHowTo') && this.get('audioBuffer') == null) {
        return this.send('playVideo', true);
      }
    },
    onYouTubePlayerStateChange: function onYouTubePlayerStateChange(event) {
      var stopAudio;
      console.log('yt-player-state: ' + event.data + ', videoStarted = ' + this.get('videoStarted') + ', videoLoaded = ' + this.get('player').getVideoLoadedFraction() + ', recording = ' + this.get('recording') + ', initialPlayed = ' + this.get('initialPlayed') + ', orig = ' + this.get('orig'));
      switch (event.data) {
        case 1:
          if (!this.get('initialPlayed')) {
            if (this.get('orig') == null || this.get('orig')) {
              this.set('orig', false);
            }
          }
          $('#play_orig').attr("disabled", true);
          $('#play_dub').attr("disabled", true);
          if ((stopAudio = this.get('stopAudioCallback')) != null && this.get('audioBufferStarted')) {
            stopAudio();
          }
          this.set('videoStarted', true);
          console.log('yt-player started playing, orig = ' + this.get('orig') + ' ...');
          if (!this.get('orig')) {
            if (this.get('player').getVideoLoadedFraction() !== 0) {
              if (this.get('recording')) {
                this.get('player').mute();
                console.log('start recording audio-track ...');
                return this.get('audioRecorder').record(300);
              } else {
                if (this.get('dubTrackDelay') <= 0) {
                  return this.startDubTrack(this.get('innerDubTrackDelay'));
                } else {
                  return window.setTimeout(this.startDubTrack.bind(this), this.get('dubTrackDelay'));
                }
              }
            }
          }
          break;
        case 0:
          console.log('stopAudioCallback = ' + this.get('stopAudioCallback') + ', recording = ' + this.get('recording') + ', audioBufferStarted = ' + this.get('audioBufferStarted'));
          if (this.get('recording') && this.get('player').getVideoLoadedFraction() !== 0) {
            this.send('stopRecording');
          }
          if (!this.get('initialPlayed')) {
            this.set('initialPlayed', true);
          }
          this.set('videoStarted', false);
          this.set('stopAudioCallback', null);
          $('#play_orig').attr("disabled", false);
          $('#play_dub').attr("disabled", false);
          $('#rec_ctrl').attr("disabled", false);
          return this.set('recorded', false);
      }
    },
    startDubTrack: function startDubTrack() {
      if (this.get('innerDubTrackDelay') <= 0) {
        this.get('player').mute();
      } else {
        window.setTimeout(this.get('player').mute.bind(this.get('player')), this.get('innerDubTrackDelay'));
      }
      console.log('start playing audio-track; player.startSeconds = ' + this.get('start') + ', player.getCurrentTime = ' + this.get('player').getCurrentTime());
      if (this.get('useAudioTag')) {
        $('audio')[0].currentTime = 0.2;
        console.log('currentTime = ' + $('audio')[0].currentTime);
        return $('audio')[0].play();
      } else {
        this.get('audioBuffer').start();
        return this.set('audioBufferStarted', true);
      }
    },
    createDownloadLink: function createDownloadLink(url) {
      var au;
      $('audio').remove();
      au = document.createElement('audio');
      au.controls = true;
      au.volume = 1.0;
      au.preload = 'auto';
      au.src = url;
      $('body').append(au);
      return $('audio').on('ended', (function (_this) {
        return function () {
          if (_this.get('dubSpecReady')) {
            console.log('continue with original audio, videoStarted = ' + _this.get('videoStarted'));
            $('#rec_ctrl').attr("disabled", true);
            return _this.get('player').unMute();
          }
        };
      })(this));
    },
    connectAudioSource: function connectAudioSource(filePath, callback) {
      var audio1, bufferLoader;
      if (callback == null) {
        callback = null;
      }
      if (this.get('audioContext') != null) {
        console.log('setting up audio buffersource with ' + filePath + ' ...');
        audio1 = this.get('audioContext').createBufferSource();
        bufferLoader = new BufferLoader(this.get('audioContext'), [filePath], (function (_this) {
          return function (bufferList) {
            _this.set('stopAudioCallback', function () {
              return audio1.stop();
            });
            audio1.buffer = bufferList[0];
            audio1.connect(_this.get('audioContext.destination'));
            if (callback != null) {
              return audio1.onended = function () {
                return callback({
                  msg: 'finished'
                });
              };
            }
          };
        })(this));
        bufferLoader.load();
      }
      return audio1;
    },
    setupForm: function setupForm(challengeResponseToken) {
      var formData;
      if (challengeResponseToken == null) {
        challengeResponseToken = null;
      }
      formData = new FormData();
      formData.append('dub_data[video_id]', this.get('videoId'));
      formData.append('dub_data[start_secs]', this.get('start'));
      formData.append('dub_data[end_secs]', this.get('end'));
      formData.append('dub_data[delay_millis]', this.get('dubTrackDelay'));
      formData.append('dub_data[inner_delay_millis]', this.get('innerDubTrackDelay'));
      formData.append('dub_data[dub_track]', this.get('dubTrackData'));
      return formData;
    },
    uploadDubData: function uploadDubData(challengeResponseToken, callBack) {
      var formData, url;
      if (challengeResponseToken == null) {
        challengeResponseToken = null;
      }
      if (callBack == null) {
        callBack = null;
      }
      formData = this.setupForm();
      url = $('#publish-url').val();
      return this.get('backendAdapter').request(url, 'POST', formData).then((function (_this) {
        return function (response) {
          console.log('response.message OK = ' + response.success);
          return callBack(response.dub_data);
        };
      })(this), (function (_this) {
        return function (error) {
          return alert('error');
        };
      })(this));
    }
  });

  exports['default'] = SoundTrackCreatorComponent;
});
define("sparta/controllers/application", ["exports"], function (exports) {
  exports["default"] = Ember.Controller.extend({
    backendUrlPrefix: Sparta.backendUrlPrefix,
    isMobile: navigator.userAgent.match(/Mobile|webOS/) != null
  });
});
define("sparta/controllers/index", ["exports"], function (exports) {
  exports["default"] = Ember.Controller.extend();
});
define("sparta/controllers/new", ["exports"], function (exports) {
  exports["default"] = Ember.Controller.extend();
});
define("sparta/helpers/and", ["exports"], function (exports) {
  exports["default"] = Ember.Helper.helper(function (params) {
    var i, len, param;
    if (!(params != null && params.length >= 2)) {
      return false;
    }
    for (i = 0, len = params.length; i < len; i++) {
      param = params[i];
      if (!param) {
        return false;
      }
    }
    return true;
  });
});
define('sparta/helpers/app-version', ['exports', 'ember', 'sparta/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _ember, _spartaConfigEnvironment, _emberCliAppVersionUtilsRegexp) {
  exports.appVersion = appVersion;
  var version = _spartaConfigEnvironment['default'].APP.version;

  function appVersion(_) {
    var hash = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (hash.hideSha) {
      return version.match(_emberCliAppVersionUtilsRegexp.versionRegExp)[0];
    }

    if (hash.hideVersion) {
      return version.match(_emberCliAppVersionUtilsRegexp.shaRegExp)[0];
    }

    return version;
  }

  exports['default'] = _ember['default'].Helper.helper(appVersion);
});
define('sparta/helpers/append', ['exports'], function (exports) {
  exports['default'] = Ember.Helper.helper(function (params) {
    var sep;
    if (!(params != null && params.length === 3)) {
      return '';
    }
    sep = params[0].toString().length >= 1 && params[1].toString().length >= 1 ? params[2] : '';
    return new Ember.String.htmlSafe(params[0].toString() + sep + params[1].toString());
  });
});
define("sparta/helpers/or", ["exports"], function (exports) {
  exports["default"] = Ember.Helper.helper(function (params) {
    var i, len, param;
    if (!(params != null && params.length >= 2)) {
      return false;
    }
    for (i = 0, len = params.length; i < len; i++) {
      param = params[i];
      if (param) {
        return true;
      }
    }
    return false;
  });
});
define('sparta/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _emberInflectorLibHelpersPluralize) {
  exports['default'] = _emberInflectorLibHelpersPluralize['default'];
});
define('sparta/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _emberInflectorLibHelpersSingularize) {
  exports['default'] = _emberInflectorLibHelpersSingularize['default'];
});
define('sparta/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'sparta/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _spartaConfigEnvironment) {
  var _config$APP = _spartaConfigEnvironment['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(name, version)
  };
});
define('sparta/initializers/component-router-injector', ['exports'], function (exports) {
  var CRIInit;

  CRIInit = {
    name: 'component-router-injector',
    initialize: function initialize(application) {
      return application.inject('component', 'router', 'router:main');
    }
  };

  exports['default'] = CRIInit;
});
define('sparta/initializers/container-debug-adapter', ['exports', 'ember-resolver/container-debug-adapter'], function (exports, _emberResolverContainerDebugAdapter) {
  exports['default'] = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _emberResolverContainerDebugAdapter['default']);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('sparta/initializers/data-adapter', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `data-adapter` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('sparta/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data/-private/core'], function (exports, _emberDataSetupContainer, _emberDataPrivateCore) {

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    App.StoreService = DS.Store.extend({
      adapter: 'custom'
    });
  
    App.PostsController = Ember.Controller.extend({
      // ...
    });
  
    When the application is initialized, `App.ApplicationStore` will automatically be
    instantiated, and the instance of `App.PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */

  exports['default'] = {
    name: 'ember-data',
    initialize: _emberDataSetupContainer['default']
  };
});
define('sparta/initializers/export-application-global', ['exports', 'ember', 'sparta/config/environment'], function (exports, _ember, _spartaConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_spartaConfigEnvironment['default'].exportApplicationGlobal !== false) {
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

      var value = _spartaConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_spartaConfigEnvironment['default'].modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('sparta/initializers/injectStore', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `injectStore` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('sparta/initializers/store', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `store` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('sparta/initializers/transforms', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `transforms` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define("sparta/instance-initializers/ember-data", ["exports", "ember-data/-private/instance-initializers/initialize-store-service"], function (exports, _emberDataPrivateInstanceInitializersInitializeStoreService) {
  exports["default"] = {
    name: "ember-data",
    initialize: _emberDataPrivateInstanceInitializersInitializeStoreService["default"]
  };
});
define('sparta/mixins/player-route-deactivator', ['exports'], function (exports) {
  exports['default'] = Ember.Mixin.create({
    application: (function () {
      return Ember.getOwner(this).lookup('controller:application');
    }).property(),
    deactivate: function deactivate() {
      this._super();
      if (this.get('application.sTC.player') != null) {
        this.get('application.sTC.player').destroy();
      }
      return true;
    }
  });
});
define('sparta/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('sparta/router', ['exports', 'ember', 'sparta/config/environment'], function (exports, _ember, _spartaConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _spartaConfigEnvironment['default'].locationType,
    rootURL: _spartaConfigEnvironment['default'].rootURL
  });

  Router.map(function () {
    this.route('new', { path: '/new' });
  });

  exports['default'] = Router;
});
define("sparta/routes/index", ["exports", "sparta/mixins/player-route-deactivator"], function (exports, _spartaMixinsPlayerRouteDeactivator) {
  exports["default"] = Ember.Route.extend(_spartaMixinsPlayerRouteDeactivator["default"], {
    model: function model() {
      return {
        todo: 'load user environment'
      };
    }
  });
});
define('sparta/routes/new', ['exports'], function (exports) {
  exports['default'] = Ember.Route.extend({
    model: function model() {
      return {
        todo: 'load user environment'
      };
    }
  });
});
define('sparta/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _emberAjaxServicesAjax) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxServicesAjax['default'];
    }
  });
});
define('sparta/services/backend_adapter', ['exports'], function (exports) {
  exports['default'] = Ember.Service.extend({
    request: function request(url, method, params, callbackContext) {
      var promise;
      if (params == null) {
        params = null;
      }
      if (callbackContext == null) {
        callbackContext = null;
      }
      console.log('BackendAdapter - request: url = ' + url + ', method = ' + method + ', callbackContext? = ' + (callbackContext != null));
      promise = new Ember.RSVP.Promise(function (resolve, reject) {
        var options;
        options = {};
        if (params != null) {
          options.data = params;
          options.cache = false;
          options.contentType = false;
          options.processData = false;
        }
        options.dataType = 'json';
        if (method.trim().toLowerCase() === 'patch') {
          options.method = 'POST';
          params._method = 'PATCH';
        } else {
          options.method = method;
        }
        options.success = function (data) {
          if (data.success != null && !data.success) {
            return reject(data);
          } else {
            return resolve(data);
          }
        };
        options.error = function (error) {
          console.log('error');
          return reject(error);
        };
        if (callbackContext != null) {
          options.success = callbackContext.success.bind(callbackContext.context);
          options.error = callbackContext.error.bind(callbackContext.context);
        }
        return Ember.$.ajax(url, options);
      });
      if (callbackContext != null) {
        promise.then(callbackContext.success, callbackContext.error);
        return true;
      } else {
        return promise;
      }
    }
  });
});
define('sparta/services/record_audio', ['exports', 'ember'], function (exports, _ember) {
  var RecordAudio;

  RecordAudio = _ember['default'].Service.extend({
    audioContext: null,
    stream: null,
    config: null,
    bufferLen: -1,
    numChannels: -1,
    recordBuffers: [],
    recording: (function () {
      return false;
    }).property(),
    newTrack: function newTrack(stream, cfg) {
      var input, processor;
      this.set('config', cfg || {});
      this.set('bufferLen', this.get('config.bufferLen') || 4096);
      this.set('numChannels', this.get('config.numChannels') || 2);
      this.set('stream', stream);
      this.start();
      input = this.get('audioContext').createMediaStreamSource(stream);
      processor = this.get('audioContext').createScriptProcessor(1024, 1, 1);
      input.connect(processor);
      processor.connect(this.get('audioContext.destination'));
      return processor.onaudioprocess = (function (_this) {
        return function (e) {
          var i, j, recordBuffers, ref, results;
          if (!_this.get('recording')) {
            return;
          }
          results = [];
          for (i = j = 0, ref = _this.get('numChannels') - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
            if ((recordBuffers = _this.get('recordBuffers'))[i] == null) {
              recordBuffers.splice(i, 0, []);
              _this.set('recordBuffers', recordBuffers);
            }
            console.log('recording ...');
            results.push(_this.get('recordBuffers')[i].push.apply(_this.get('recordBuffers')[i], e.inputBuffer.getChannelData(i)));
          }
          return results;
        };
      })(this);
    },
    getData: function getData() {
      var tmp;
      tmp = this.get('recordBuffers');
      this.set('recordBuffers', []);
      return tmp;
    },
    start: function start() {
      return this.set('recording', true);
    },
    stop: function stop() {
      return this.set('recording', false);
    }
  });

  exports['default'] = RecordAudio;
});
define("sparta/templates/application", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "96y+5Y2t", "block": "{\"statements\":[[\"open-element\",\"input\",[]],[\"static-attr\",\"id\",\"publish-url\"],[\"static-attr\",\"type\",\"hidden\"],[\"dynamic-attr\",\"value\",[\"concat\",[[\"unknown\",[\"backendUrlPrefix\"]],\"sparta/dub_track\"]]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"input\",[]],[\"static-attr\",\"id\",\"dub-data-url\"],[\"static-attr\",\"type\",\"hidden\"],[\"dynamic-attr\",\"value\",[\"concat\",[[\"unknown\",[\"backendUrlPrefix\"]],\"sparta/dub_track/:dubId\"]]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "sparta/templates/application.hbs" } });
});
define("sparta/templates/components/sound-track-creator", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "i89+ERHt", "block": "{\"statements\":[[\"yield\",\"default\"],[\"text\",\"\\n\\n\"],[\"block\",[\"each\"],[[\"get\",[\"sharedDubTrackUrls\"]]],null,12],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"dubSpecReady\"]]],null,10],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"playerReady\"]]],null,9],[\"text\",\"\\n\"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"name\",\"checked\"],[\"checkbox\",\"showHowTo\",[\"get\",[\"showHowTo\"]]]]],false],[\"text\",\"Show HowTo\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"showHowTo\"]]],null,2],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"helper\",[\"or\"],[[\"get\",[\"initialPlayed\"]],[\"get\",[\"showHowTo\"]]],null]],null,1,0]],\"locals\":[],\"named\":[],\"yields\":[\"default\"],\"blocks\":[{\"statements\":[[\"comment\",\"\\n<button type=\\\"button\\\" {{action \\\"newDubTrack\\\"}}>Create new Dub-Track</button>\\n\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\nVideoId: \"],[\"open-element\",\"input\",[]],[\"static-attr\",\"id\",\"videoId\"],[\"dynamic-attr\",\"value\",[\"concat\",[[\"unknown\",[\"videoId\"]]]]],[\"flush-element\"],[\"close-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\nVideo Start Seconds: \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"min\",\"step\",\"id\",\"value\"],[\"number\",\"0\",\"1\",\"startSecs\",[\"get\",[\"newStart\"]]]]],false],[\"text\",\" (current value: \"],[\"append\",[\"unknown\",[\"start\"]],false],[\"text\",\"; change will update Dub-Track Delay Milliseconds)\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\nVideo End Seconds: \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"min\",\"step\",\"id\",\"value\"],[\"number\",\"0\",\"1\",\"endSecs\",[\"get\",[\"newEnd\"]]]]],false],[\"text\",\" (current value: \"],[\"append\",[\"unknown\",[\"end\"]],false],[\"text\",\")\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"id\",\"setCuttingData\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"setVideoId\"]],[\"flush-element\"],[\"text\",\"Set Cutting Data\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\nDub-Track Delay Milliseconds: \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"min\",\"step\",\"id\",\"value\"],[\"number\",\"0\",\"100\",\"dubTrackDelayMillis\",[\"get\",[\"newDubTrackDelay\"]]]]],false],[\"text\",\" (current value: \"],[\"append\",[\"unknown\",[\"dubTrackDelay\"]],false],[\"text\",\")\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\nInner Dub-Track Delay Milliseconds: \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"min\",\"step\",\"id\",\"value\"],[\"number\",\"0\",\"100\",\"innerDubTrackDelayMillis\",[\"get\",[\"newInnerDubTrackDelay\"]]]]],false],[\"text\",\" (current value: \"],[\"append\",[\"unknown\",[\"innerDubTrackDelay\"]],false],[\"text\",\")\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"id\",\"setDubTrackDelay\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"setDubTrackSecs\"]],[\"flush-element\"],[\"text\",\"Set Dub-Track Delay\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"comment\",\"\\n<div style=\\\"width: {{playerWidth}}px; margin-top: 7px;\\\">\\nCreating a Dub-Track involves 2 Phases: <span class=\\\"howTo phase1\\\">First you only edit the Part/Timespan where you want to replace/dub the Video's Original Audiotrack.</span><span class=\\\"howTo phase2\\\">Second, you optionally edit the actual start/end of the video if it should be different.</span>\\n</div>\\n<ol style=\\\"margin-top: 0px; margin-bottom: 0px; padding: 10px; width: {{playerWidth}}px;\\\">\\n  <li class=\\\"howTo phase1\\\">Set Youtube Video-Id, Video-Start-Secs short before the time when the Dub-Track should start and Video-End-Secs after the Dub-Track should end. <span class=\\\"howTo phase2\\\">You can later fine-tune the exact start-time of your Dub-Track, so that there's no gap between the original Audio-Track (@see 4.),</span> whereas the end-point currently can't be changed.</li>\\n  <li class=\\\"howTo phase1\\\">Click <button type=\\\"button\\\">Start Record Audio</button> and Dub the Video. The button changes to <button style=\\\"background-color:red;\\\" type=\\\"button\\\">Stop Record Audio</button> and you have to click it right after your Dub-Track is complete and the original Track shall be audible again.</li>\\n  <li class=\\\"howTo phase1\\\">After Recording check your Dub-Track by clicking <button type=\\\"button\\\" style=\\\"background-color: blue;\\\">Play Dub</button></li>\\n  <li class=\\\"howTo phase2\\\">You can also fine-tune the Dub-Track's start-time if you want the Videos original preceding Audio-Track to play longer. Set the value in \\\"Inner Dub-Track Delay Milliseconds\\\"</li>\\n  <li class=\\\"howTo phase2\\\">If you want the Video to start some Time before Your Dub-Track then you can change the Video-Start-Secs now to an earlier moment and click <button type=\\\"button\\\">Set Cutting Data</button>. You'll notice that the value of \\\"Dub-Track Delay Milliseconds\\\" will change accordingly, meaning that the Dub-Track will start some Time after the Video.</li>\\n</ol>\\n\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"dynamic-attr\",\"style\",[\"concat\",[\"width: \",[\"unknown\",[\"playerWidth\"]],\"px; margin-top: 7px;\"]]],[\"flush-element\"],[\"text\",\"\\nWith the \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"style\",\"background-color: yellow;\"],[\"flush-element\"],[\"text\",\"Play Orig\"],[\"close-element\"],[\"text\",\" button you can always replay the original soundtrack. After clicking \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"text\",\"Start Record Audio\"],[\"close-element\"],[\"text\",\" the button changes to \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"style\",\"background-color:red;\"],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"text\",\"Stop Record Audio\"],[\"close-element\"],[\"text\",\".\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"ol\",[]],[\"dynamic-attr\",\"style\",[\"concat\",[\"margin-top: 0px; margin-bottom: 0px; padding: 10px; width: \",[\"unknown\",[\"playerWidth\"]],\"px;\"]]],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"howTo phase1\"],[\"flush-element\"],[\"text\",\"Click \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"text\",\"Start Record Audio\"],[\"close-element\"],[\"text\",\" and say the name of your favorite city when Leonidas would say Sparta. Then click \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"style\",\"background-color:red;\"],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"text\",\"Stop Record Audio\"],[\"close-element\"],[\"text\",\" immediately.\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"howTo phase2\"],[\"flush-element\"],[\"text\",\"Check the correct moment of your recording by clicking \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"style\",\"background-color: blue;\"],[\"flush-element\"],[\"text\",\"Play Dub\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"howTo phase1\"],[\"flush-element\"],[\"text\",\"Now set the value in \\\"Inner Dub-Track Delay Milliseconds\\\" to 1600 and click \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"text\",\"Set Dub-Track Delay\"],[\"close-element\"],[\"text\",\", so the original soundtrack will be audible until your dub. Check again with \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"style\",\"background-color: blue;\"],[\"flush-element\"],[\"text\",\"Play Dub\"],[\"close-element\"],[\"text\",\" and fine-tune the delay-value as necessary.\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"howTo phase2\"],[\"flush-element\"],[\"text\",\"Now you can start the Video 3 more seconds before Your Dub-Track by changing the Video-Start-Secs from 49 to 46 and click \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"text\",\"Set Cutting Data\"],[\"close-element\"],[\"text\",\". You'll notice that the value of \\\"Dub-Track Delay Milliseconds\\\" will change accordingly, meaning that the Dub-Track will start some Time after the Video. Clicking \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"style\",\"background-color: blue;\"],[\"flush-element\"],[\"text\",\"Play Dub\"],[\"close-element\"],[\"text\",\" will show the changes.\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"howTo phase1\"],[\"flush-element\"],[\"text\",\"Now you can share the Dub-Track by clicking \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"style\",\"background-color: green;\"],[\"flush-element\"],[\"text\",\"Share Video\"],[\"close-element\"],[\"text\",\". After short time you'll see right above the video an url that you can share for direct access. You can also share via whatsapp on smartphones.\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"Audio Saved\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"button\",[]],[\"static-attr\",\"style\",\"background-color:red;\"],[\"static-attr\",\"type\",\"button\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"stopRecording\"]],[\"flush-element\"],[\"text\",\"Stop Record Audio\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"button\",[]],[\"static-attr\",\"id\",\"rec_ctrl\"],[\"static-attr\",\"type\",\"button\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"startRecording\"]],[\"flush-element\"],[\"text\",\"Start Record Audio\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"unless\"],[[\"get\",[\"recording\"]]],null,5,4]],\"locals\":[]},{\"statements\":[[\"open-element\",\"span\",[]],[\"static-attr\",\"style\",\"float: left; margin-left: 0px 10px 0px 10px;\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"id\",\"play_dub\"],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"style\",\"background-color: blue;\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"playVideo\",false]],[\"flush-element\"],[\"text\",\"Play Dub\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"audioBuffer\"]]],null,7],[\"open-element\",\"span\",[]],[\"static-attr\",\"style\",\"float: left; margin-left: 0px 10px 0px 10px;\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"id\",\"play_orig\"],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"style\",\"background-color: yellow;\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"playVideo\"]],[\"flush-element\"],[\"text\",\"Play Orig\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"unless\"],[[\"get\",[\"recorded\"]]],null,6,3],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"style\",\"margin: 0px 0px 0px 20px;\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"style\",\"background-color: green;\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"shareVideo\"]],[\"flush-element\"],[\"text\",\"Share Video\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"helper\",[\"and\"],[[\"get\",[\"initialPlayed\"]],[\"get\",[\"displayControls\"]]],null]],null,8]],\"locals\":[]},{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"video\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"a\",[]],[\"dynamic-attr\",\"href\",[\"concat\",[\"whatsapp://send?text=\",[\"unknown\",[\"sharedDubTrackData\",\"whatsAppText\"]]]]],[\"static-attr\",\"data-action\",\"share/whatsapp/share\"],[\"flush-element\"],[\"text\",\"Share via Whatsapp\"],[\"close-element\"],[\"text\",\" or\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"img\",[]],[\"static-attr\",\"style\",\"border; 0px;\"],[\"dynamic-attr\",\"src\",[\"concat\",[\"https://img.youtube.com/vi/\",[\"unknown\",[\"sharedDubTrackData\",\"videoId\"]],\"/default.jpg\"]]],[\"flush-element\"],[\"close-element\"],[\"text\",\" -\\n\"],[\"block\",[\"if\"],[[\"get\",[\"application\",\"isMobile\"]]],null,11],[\"open-element\",\"a\",[]],[\"dynamic-attr\",\"href\",[\"concat\",[[\"unknown\",[\"sharedDubTrackData\",\"dubTrackUrl\"]]]]],[\"static-attr\",\"target\",\"dubTrack\"],[\"flush-element\"],[\"open-element\",\"input\",[]],[\"static-attr\",\"readonly\",\"\"],[\"dynamic-attr\",\"id\",[\"concat\",[\"share_\",[\"get\",[\"idx\"]]]]],[\"dynamic-attr\",\"value\",[\"concat\",[[\"unknown\",[\"sharedDubTrackData\",\"dubTrackUrl\"]]]]],[\"static-attr\",\"style\",\"width: 300px; border: 0px; color: blue;\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"copyToClipboard\",[\"helper\",[\"append\"],[\"#share\",[\"get\",[\"idx\"]],\"_\"],null]]],[\"flush-element\"],[\"text\",\"Copy Link to Clipboard\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"sharedDubTrackData\",\"idx\"]}],\"hasPartials\":false}", "meta": { "moduleName": "sparta/templates/components/sound-track-creator.hbs" } });
});
define("sparta/templates/index", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "o8AUuinb", "block": "{\"statements\":[[\"append\",[\"unknown\",[\"sound-track-creator\"]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "sparta/templates/index.hbs" } });
});
define("sparta/templates/new", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "PPSBRkPt", "block": "{\"statements\":[[\"append\",[\"helper\",[\"sound-track-creator\"],null,[[\"skipSample\"],[true]]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "sparta/templates/new.hbs" } });
});
/* jshint ignore:start */



/* jshint ignore:end */

/* jshint ignore:start */

define('sparta/config/environment', ['ember'], function(Ember) {
  var prefix = 'sparta';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

/* jshint ignore:end */

/* jshint ignore:start */

if (!runningTests) {
  require("sparta/app")["default"].create({"backendUrlPrefix":"/","name":"sparta","version":"0.0.0+4c55b711"});
}

/* jshint ignore:end */
//# sourceMappingURL=sparta.map
