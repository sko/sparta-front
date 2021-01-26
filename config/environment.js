'use strict';

module.exports = function(environment) {
  var backendUrl = (typeof(process.env.BACKEND_URL) == "undefined"||process.env.BACKEND_URL==null) ? 'http://localhost:3003' : process.env.BACKEND_URL;

  var ENV = {
    modulePrefix: 'sparta',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.APP.backendUrlPrefix = backendUrl + '/api';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.backendUrlPrefix = '/';
  }

  // if (environment === 'stage') {
  //   ENV.rootURL = '/sparta/';
  //   ENV.APP.backendUrlPrefix = '/';
  // }

  if (environment === 'production') {
    // ENV.rootURL = '/';
    ENV.APP.backendUrlPrefix = backendUrl + '/api';
  }

  return ENV;
};
