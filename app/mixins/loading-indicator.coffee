# for use in class:
# import LoadingIndicator from "../mixins/loading-indicator"

export default Ember.Mixin.create
  startWaiting: ->
    $('html').addClass 'busy'
  stopWaiting: ->
    $('html').removeClass 'busy'
