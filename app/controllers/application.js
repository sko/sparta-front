import Controller from '@ember/controller';
import { computed } from '@ember/object';
import config from '../config/environment';

export default Controller.extend({
  backendUrlPrefix: config.APP.backendUrlPrefix,
  isMobile: computed(function() {
    return navigator.userAgent.match(/Mobile|webOS/) != null;
  })
});
