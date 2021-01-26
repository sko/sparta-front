/* eslint-env node */
'use strict';

module.exports = function(deployTarget) {
  let ENV = {
    build: {}
    // include other plugin configuration that applies to all deploy targets here
  };

  ENV.revisionData = {
    type: 'git-commit'
  }

  ENV.gzip = {
    filePattern: '\*\*/\*.{js,css,json,ico,map,xml,txt,svg,eot,ttf,woff,html,pdf}',
    keep: true
  }

  if (deployTarget === 'development') {
    ENV.build.environment = 'development';
    // configure other plugins for development deploy target here
  }

  if (deployTarget === 'staging') {
    ENV.build.environment = 'production';
    // configure other plugins for staging deploy target here
  }

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';
    // configure other plugins for production deploy target here

    ENV.sftp = {
      host: process.env.SSH_HOST,
      remoteDir: '/home/sko/meme/web',
      remoteUser: process.env.SSH_USER,
      privateKey: process.env.SSH_KEY
    };
  }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};
