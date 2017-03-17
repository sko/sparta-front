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
define('sparta/components/sound-track-creator', ['exports', 'ember'], function (exports, _ember) {
  var SoundTrackCreatorComponent;

  SoundTrackCreatorComponent = _ember['default'].Component.extend({
    player: (function () {
      return null;
    }).property(),
    playerReady: (function () {
      return false;
    }).property(),
    setupYoutubeAPI: (function () {
      var firstScriptTag, tag;
      tag = document.createElement('script');
      tag.src = "//www.youtube.com/player_api";
      firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      return window.onYouTubePlayerAPIReady = this.getYouTubePlayerAPIReadyCallback();
    }).on('init'),
    actions: {
      playVideo: function playVideo() {
        return this.get('player').playVideo();
      }
    },
    getYouTubePlayerAPIReadyCallback: function getYouTubePlayerAPIReadyCallback() {
      return (function (_this) {
        return function () {
          return _this.set('player', new YT.Player('video', {
            events: {
              'onReady': _this.onYouTubePlayerReady.bind(_this),
              'onStateChange': _this.onYouTubePlayerStateChange.bind(_this)
            }
          }));
        };
      })(this);
    },
    onYouTubePlayerReady: function onYouTubePlayerReady() {
      return this.set('playerReady', true);
    },
    onYouTubePlayerStateChange: function onYouTubePlayerStateChange(event) {
      if (event.data === 1) {
        return console.log('yt-player started playing ...');
      }
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
define("sparta/templates/application", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "TXM69FTk", "block": "{\"statements\":[[\"open-element\",\"iframe\",[]],[\"static-attr\",\"id\",\"video\"],[\"static-attr\",\"width\",\"560\"],[\"static-attr\",\"height\",\"315\"],[\"static-attr\",\"src\",\"//www.youtube.com/embed/smUCKTDdMWE?start=55&end=58&version=2&enablejsapi=1&html5=1\"],[\"static-attr\",\"frameborder\",\"0\"],[\"static-attr\",\"allowfullscreen\",\"\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"append\",[\"unknown\",[\"sound-track-creator\"]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "sparta/templates/application.hbs" } });
});
define("sparta/templates/components/sound-track-creator", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "fxEO0UBR", "block": "{\"statements\":[[\"yield\",\"default\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"playerReady\"]]],null,0]],\"locals\":[],\"named\":[],\"yields\":[\"default\"],\"blocks\":[{\"statements\":[[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"playVideo\"]],[\"flush-element\"],[\"text\",\"Play\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "sparta/templates/components/sound-track-creator.hbs" } });
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
  require("sparta/app")["default"].create({"name":"sparta","version":"0.0.0+163b1102"});
}

/* jshint ignore:end */
//# sourceMappingURL=sparta.map
