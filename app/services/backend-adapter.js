import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { getOwner } from '@ember/application';
import { Promise } from 'rsvp';
// import { A } from '@ember/array';

export default Service.extend({
  ajax: service(),
  // session: service(),
  application: computed(function() {
    return getOwner(this).lookup('controller:application');
  }),
  // callbackContext ... {context: ..., success: (data) ->, error: (error) ->}
  // request: (url, method, params = null, headers = {}, isJson = true, callbackContext = null) ->
  request(url, method, params, headers, isJson, callbackContext, noAuth, crossDomain) {
    noAuth = noAuth || false;
    if (typeof(isJson) == "undefined") isJson = true;
    // console.log('BackendAdapter - request: url = ' + url + ', method = ' + method + ', callbackContext? = '+(callbackContext!=null));
    return this._promise(url, method, params, headers||{}, isJson, callbackContext, noAuth, this.ajax, crossDomain);
  },
  _promise(url, method, params, headers, isJson, callbackContext, noAuth, ajax, crossDomain) {
    let promise = new Promise((resolve, reject) => {
        // console.log 'BackendAdapter - setup request ...'
        let options = {};

        if (crossDomain) options.crossDomain = true;

        if (params != null) {
          if (isJson)
            options.data = JSON.stringify(params);
          else {
            options.data = params;
            options.cache = false;
            options.contentType = false;
            options.processData = false;
          }
        }

        if (!noAuth && headers != null && headers['Authorization'] == null && this.get('session.session.content.authenticated.access_token') != null)
          headers['Authorization'] = `Bearer ${this.get('session.session.content.authenticated.access_token')}`;

        if (isJson) {
          headers['Content-Type'] = 'application/json';
          options.headers = headers;
        }

        options.beforeSend = (request) => {
            for(let hName of Object.keys(headers)) request.setRequestHeader(hName, headers[hName]);
          };
        // if window.RAILS_ENV? && window.RAILS_ENV == 'test'
        //   if method.trim().toLowerCase() == 'patch'
        //     options.method = 'POST'
        //     params._method = 'PATCH'
        //   else
        //     options.method = method
        // else
          options.method = method;
        if (isJson) options.dataType = 'json'; // expect json-response
        // options.crossDomain = true
        options.success = (data) => {
            if (data.type == 'auth_challenge') {
              // this.router.transitionTo('auth.login');
              this.get('application').on401(headers, data, params);
              return true;
            }
            if (data.success != null && !data.success) reject(data);
            else resolve(data);
        };
        options.error = (error) => {
            if (error.responseJSON != null)
              reject(error.responseJSON);
            else if(error.responseText != null)
              reject({ error: "Internal Server Error" }); // error.responseText });
            else
              reject(error);
        };
        if (callbackContext != null) {
          options.success = callbackContext.success.bind(callbackContext.context);
          options.error = callbackContext.error.bind(callbackContext.context);
        }
        // Ember.$.ajax url, options
        // let response = await fetch(url);
        return ajax.request(url, options);
    });
    if (callbackContext != null) {
      promise.then(callbackContext.success, callbackContext.error);
      return true;
    } else
      return promise;
  }
});
