# for use in class:
# import ClipboardActor from "../mixins/clipboard-actor"

export default Ember.Mixin.create
  actions:
    copyToClipboard: (selector) ->
      copyDatainput  = document.querySelector(selector)
      copyDatainput.select()
      document.execCommand('copy')
