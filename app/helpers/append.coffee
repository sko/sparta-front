export default Ember.Helper.helper (params) ->
  unless params? && params.length == 3
    return ''
  sep = if params[0].toString().length >= 1 && params[1].toString().length >= 1 then params[2] else ''
  new Ember.String.htmlSafe(params[0].toString()+sep+params[1].toString())
