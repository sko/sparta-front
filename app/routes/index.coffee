import PlayerRouteDeactivator from "../mixins/player-route-deactivator"

export default Ember.Route.extend PlayerRouteDeactivator,
  model: ->
    todo: 'load user environment'
