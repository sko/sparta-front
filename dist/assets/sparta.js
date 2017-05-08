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
define('sparta/components/sound-track-creator', ['exports', 'ember', 'recorder'], function (exports, _ember, _recorder) {
  var SoundTrackCreatorComponent;

  SoundTrackCreatorComponent = _ember['default'].Component.extend({
    recordAudio: _ember['default'].inject.service(),
    backendAdapter: _ember['default'].inject.service(),
    audioContext: _ember['default'].computed.alias('recordAudio.audioContext'),
    dubSpecReady: false,
    initialPlayed: false,
    player: null,
    playerReady: (function () {
      return false;
    }).property(),
    videoId: null,
    start: -1,
    end: -1,
    orig: true,
    volume: -1,
    videoStarted: false,
    stopAudioCallback: null,
    setupAudioTracking: (function () {
      var AudioContext, constraints, dubIdMatch, error, gUM, url;
      try {
        AudioContext = window.AudioContext || window.webkitAudioContext;
        this.set('audioContext', new AudioContext());
      } catch (error1) {
        error = error1;
        console.log('no audio-player-support', error);
      }
      if (Modernizr.getusermedia) {
        if ((dubIdMatch = location.search.match(/[?&]dubId=([^&]+)/)) != null) {
          this.set('dubTrackJSON', null);
          url = $('#dub-data-url').val().replace(/:dubId/, dubIdMatch[1]);
          this.get('backendAdapter').request(url, 'GET').then((function (_this) {
            return function (dubData) {
              _this.set('videoId', dubData.video_id);
              _this.set('start', dubData.start_secs);
              _this.set('end', dubData.end_secs);
              _this.createDownloadLink(dubData.dub_track_url);
              _this.set('dubSpecReady', true);
              if (_this.get('player') != null && !_this.get('initialPlayed')) {
                return _this.send('playVideo', false);
              }
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
            console.log('Reeeejected!', e);
            return alert('Reeeejected!');
          };
        })(this));
      }
    }).on('init'),
    setupYoutubeAPI: (function () {
      var firstScriptTag, tag;
      tag = document.createElement('script');
      tag.src = "//www.youtube.com/player_api";
      firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      return window.onYouTubePlayerAPIReady = this.onYouTubePlayerAPIReady.bind(this);
    }).on('init'),
    initialDubTrack: (function () {
      var dubData;
      if (this.get('dubTrackJSON') != null) {
        dubData = JSON.parse(this.get('dubTrackJSON'));
        this.set('videoId', dubData.video_id);
        this.set('start', dubData.start_secs);
        this.set('end', dubData.end_secs);
        this.createDownloadLink(dubData.dub_track_url);
        this.set('dubSpecReady', true);
        if (this.get('player') != null && !this.get('initialPlayed')) {
          return this.send('playVideo', false);
        }
      }
    }).on('didInsertElement'),
    actions: {
      setVideoId: function setVideoId() {
        this.set('videoId', $('#videoId').val());
        this.set('start', parseInt($('#startSecs').val()));
        this.set('end', parseInt($('#endSecs').val()));
        return $('#video').attr('src', $('#video').attr('src').replace(/embed\/[^?]+/, 'embed/' + $('#videoId').val()).replace(/([?&])start=[^&]+/, '$1start=' + $('#startSecs').val()).replace(/([?&])end=[^&]+/, '$1end=' + $('#endSecs').val()));
      },
      playVideo: function playVideo(orig) {
        if (orig == null) {
          orig = true;
        }
        if (!this.get('initialPlayed')) {
          this.set('initialPlayed', true);
        }
        this.set('orig', orig);
        if (orig) {
          this.get('player').unMute();
          this.get('player').setVolume(this.get('volume') || 100);
        } else {
          this.get('player').mute();
        }
        this.get('player').playVideo();
        return this.get('player').loadVideoById({
          'videoId': this.get('videoId'),
          'startSeconds': this.get('start'),
          'endSeconds': this.get('end')
        });
      },
      startRecording: function startRecording() {
        this.set('recording', true);
        return this.send('playVideo', false);
      },
      stopRecording: function stopRecording() {
        console.log('stop recording audio-track ...');
        this.set('recording', false);
        this.get('audioRecorder').stop();
        this.get('audioRecorder').exportWAV((function (_this) {
          return function (blob) {
            _this.set('audioBlob', blob);
            return _this.createDownloadLink(_this.set('dubTrackUrl', URL.createObjectURL(blob)));
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
              return $('body').prepend("<a href='" + dubTrackUrl + "' target='dubTrack'>" + dubTrackUrl + "</a><br>");
            });
          };
        })(this);
        return reader.readAsDataURL(this.get('audioBlob'));
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
            _this.get('player').setVolume(_this.get('volume') || 100);
            return _this.initAudioBuffer(audioFileUrl);
          }
        };
      })(this)));
    },
    onYouTubePlayerAPIReady: function onYouTubePlayerAPIReady() {
      this.set('player', new YT.Player('video', {
        events: {
          'onReady': this.onYouTubePlayerReady.bind(this),
          'onStateChange': this.onYouTubePlayerStateChange.bind(this)
        }
      }));
      return this.set('volume', 100);
    },
    onYouTubePlayerReady: function onYouTubePlayerReady() {
      this.set('playerReady', true);
      if (this.get('dubSpecReady') && !this.get('initialPlayed')) {
        return this.send('playVideo', false);
      }
    },
    onYouTubePlayerStateChange: function onYouTubePlayerStateChange(event) {
      var stopAudio;
      console.log('yt-player-state: ' + event.data + ', videoStarted = ' + this.get('videoStarted') + ', playerState = ' + this.get('player').getPlayerState() + ', videoLoaded = ' + this.get('player').getVideoLoadedFraction() + ', recording = ' + this.get('recording'));
      switch (event.data) {
        case 1:
          $('#play_orig').attr("disabled", true);
          $('#play_dub').attr("disabled", true);
          if ((stopAudio = this.get('stopAudioCallback')) != null) {
            stopAudio();
          }
          this.set('videoStarted', true);
          console.log('yt-player started playing ...');
          if (!this.get('orig')) {
            if (this.get('player').getVideoLoadedFraction() !== 0) {
              if (this.get('recording')) {
                console.log('start recording audio-track ...');
                return this.get('audioRecorder').record();
              } else {
                console.log('start playing audio-track; player.startSeconds = ' + this.get('start') + ', player.getCurrentTime = ' + this.get('player').getCurrentTime());
                this.set('audioBufferStarted', true);
                $('audio')[0].currentTime = 0.2;
                console.log('currentTime = ' + $('audio')[0].currentTime);
                return $('audio')[0].play();
              }
            }
          }
          break;
        case 0:
          this.set('videoStarted', false);
          this.set('stopAudioCallback', null);
          $('#play_orig').attr("disabled", false);
          $('#play_dub').attr("disabled", false);
          return $('#rec_ctrl').attr("disabled", false);
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
            console.log('continue with original audio ...');
            $('#rec_ctrl').attr("disabled", true);
            _this.get('player').unMute();
            return _this.get('player').setVolume(_this.get('volume') || 100);
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
              debugger;
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
define('sparta/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('sparta/router', ['exports', 'ember', 'sparta/config/environment'], function (exports, _ember, _spartaConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _spartaConfigEnvironment['default'].locationType,
    rootURL: _spartaConfigEnvironment['default'].rootURL
  });

  Router.map(function () {});

  exports['default'] = Router;
});
define('sparta/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _emberAjaxServicesAjax) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxServicesAjax['default'];
    }
  });
});
define('sparta/services/backend_adapter', ['exports', 'ember'], function (exports, _ember) {
  var BackendAdapterService;

  BackendAdapterService = _ember['default'].Service.extend({
    request: function request(url, method, params, callbackContext) {
      var promise;
      if (params == null) {
        params = null;
      }
      if (callbackContext == null) {
        callbackContext = null;
      }
      console.log('BackendAdapter - request: url = ' + url + ', method = ' + method + ', callbackContext? = ' + (callbackContext != null));
      promise = new _ember['default'].RSVP.Promise(function (resolve, reject) {
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
        return _ember['default'].$.ajax(url, options);
      });
      if (callbackContext != null) {
        promise.then(callbackContext.success, callbackContext.error);
        return true;
      } else {
        return promise;
      }
    }
  });

  exports['default'] = BackendAdapterService;
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
  exports["default"] = Ember.HTMLBars.template({ "id": "gUrFUpez", "block": "{\"statements\":[[\"comment\",\"\\n<input id=\\\"publish-url\\\" type=\\\"hidden\\\" value=\\\"//localhost:3003/sparta/dub_track\\\" />\\n<input id=\\\"dub-data-url\\\" type=\\\"hidden\\\" value=\\\"//localhost:3003/sparta/dub_track/:dubId\\\" />\\n\"],[\"text\",\"\\n\"],[\"comment\",\"\"],[\"text\",\"\\n\"],[\"open-element\",\"input\",[]],[\"static-attr\",\"id\",\"publish-url\"],[\"static-attr\",\"type\",\"hidden\"],[\"static-attr\",\"value\",\"/sparta/dub_track\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"input\",[]],[\"static-attr\",\"id\",\"dub-data-url\"],[\"static-attr\",\"type\",\"hidden\"],[\"static-attr\",\"value\",\"/sparta/dub_track/:dubId\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"append\",[\"helper\",[\"sound-track-creator\"],null,[[\"dubTrackJSON\"],[\"{\\\"video_id\\\": \\\"haNzpiLYdEk\\\", \\\"start_secs\\\": 49, \\\"end_secs\\\": 55, \\\"dub_track_url\\\": \\\"das_ist_kreuzberg.wav\\\"}\"]]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "sparta/templates/application.hbs" } });
});
define("sparta/templates/components/sound-track-creator", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "QHF9xHr/", "block": "{\"statements\":[[\"yield\",\"default\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"dubSpecReady\"]]],null,3],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"playerReady\"]]],null,2],[\"text\",\"\\n\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\nVideoId: \"],[\"open-element\",\"input\",[]],[\"static-attr\",\"id\",\"videoId\"],[\"dynamic-attr\",\"value\",[\"concat\",[[\"unknown\",[\"videoId\"]]]]],[\"flush-element\"],[\"close-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\nStart Seconds: \"],[\"open-element\",\"input\",[]],[\"static-attr\",\"id\",\"startSecs\"],[\"dynamic-attr\",\"value\",[\"concat\",[[\"unknown\",[\"start\"]]]]],[\"flush-element\"],[\"close-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\nEnd Seconds: \"],[\"open-element\",\"input\",[]],[\"static-attr\",\"id\",\"endSecs\"],[\"dynamic-attr\",\"value\",[\"concat\",[[\"unknown\",[\"end\"]]]]],[\"flush-element\"],[\"close-element\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"setVideoId\",false]],[\"flush-element\"],[\"text\",\"Set Cutting Data\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[\"default\"],\"blocks\":[{\"statements\":[[\"open-element\",\"button\",[]],[\"static-attr\",\"style\",\"background-color:red;\"],[\"static-attr\",\"type\",\"button\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"stopRecording\"]],[\"flush-element\"],[\"text\",\"Stop Record Audio\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"button\",[]],[\"static-attr\",\"id\",\"rec_ctrl\"],[\"static-attr\",\"type\",\"button\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"startRecording\"]],[\"flush-element\"],[\"text\",\"Start Record Audio\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"span\",[]],[\"static-attr\",\"style\",\"float: left; margin-left: 0px 10px 0px 10px;\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"id\",\"play_orig\"],[\"static-attr\",\"type\",\"button\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"playVideo\"]],[\"flush-element\"],[\"text\",\"Play Orig\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"style\",\"float: left; margin-left: 0px 10px 0px 10px;\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"id\",\"play_dub\"],[\"static-attr\",\"type\",\"button\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"playVideo\",false]],[\"flush-element\"],[\"text\",\"Play Dub\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"unless\"],[[\"get\",[\"recording\"]]],null,1,0],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"style\",\"margin: 0px 0px 0px 20px;\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"shareVideo\"]],[\"flush-element\"],[\"text\",\"Share Video\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"iframe\",[]],[\"static-attr\",\"id\",\"video\"],[\"static-attr\",\"width\",\"560\"],[\"static-attr\",\"height\",\"315\"],[\"dynamic-attr\",\"src\",[\"concat\",[\"//www.youtube.com/embed/\",[\"unknown\",[\"videoId\"]],\"?start=\",[\"unknown\",[\"start\"]],\"&end=\",[\"unknown\",[\"end\"]],\"&showinfo=0&controls=0&version=3&enablejsapi=1&html5=1\"]]],[\"static-attr\",\"frameborder\",\"0\"],[\"static-attr\",\"allowfullscreen\",\"\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"br\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "sparta/templates/components/sound-track-creator.hbs" } });
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
  require("sparta/app")["default"].create({"name":"sparta","version":"0.0.0+3d63ef8e"});
}

/* jshint ignore:end */
//# sourceMappingURL=sparta.map
