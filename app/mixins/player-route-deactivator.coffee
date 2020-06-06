# for use in class:
# import LoadingIndicator from "../mixins/player-route-deactivator"

export default Ember.Mixin.create
  application: (->
    Ember.getOwner(@).lookup('controller:application')
  ).property()

  deactivate: ->
    @._super()
    if @.get('application.sTC.player')?
      @.get('application.sTC.player').destroy()
    true
