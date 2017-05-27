export default Ember.Service.extend 
  # callbackContext ... {context: ..., success: (data) ->, error: (error) ->}
  request: (url, method, params = null, callbackContext = null) ->
    console.log 'BackendAdapter - request: url = ' + url + ', method = ' + method + ', callbackContext? = '+callbackContext?
    promise = new Ember.RSVP.Promise (resolve, reject) ->
        #console.log 'BackendAdapter - setup request ...'
        options = {}
        # options.beforeSend = (xhr) ->
        #     xhr.setRequestHeader('Access-Control-Allow-Origin', '*')
        #     # xhr.setRequestHeader('X-CSRF-Token', $('meta[name=csrf-token]').first().attr('content'))
        if params?
          options.data = params
          options.cache = false
          options.contentType = false
          options.processData = false
        options.dataType = 'json'
        if method.trim().toLowerCase() == 'patch'
          options.method = 'POST'
          params._method = 'PATCH'
        else
          options.method = method
        options.success = (data) ->
            if data.success? && (!data.success)
              reject data
            else
              resolve data
        options.error = (error) ->
            console.log 'error'
            reject error
        if callbackContext?
          options.success = callbackContext.success.bind callbackContext.context
          options.error = callbackContext.error.bind callbackContext.context
        Ember.$.ajax url, options
    if callbackContext?
      promise.then callbackContext.success, callbackContext.error
      true
    else
      promise
