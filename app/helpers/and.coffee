export default Ember.Helper.helper (params) ->
  unless params? && params.length >= 2
    return false
  for param in params
    unless param
      return false
  true
