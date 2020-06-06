export default Ember.Helper.helper (params) ->
  unless params? && params.length == 1
    return ''
  new Ember.String.htmlSafe(encodeURI('DubTrack => ' + params[0]))
