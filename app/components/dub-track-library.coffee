# import Ember from 'ember'
import LoadingIndicator from "../mixins/loading-indicator"
import ClipboardActor from "../mixins/clipboard-actor"

DubTrackLibraryComponent = Ember.Component.extend LoadingIndicator, ClipboardActor,
  backendAdapter: Ember.inject.service()
  application: (->
    Ember.getOwner(@).lookup('controller:application')
  ).property()
  dubTrackList: []
  loadLibrary: ( ->
    url = $('#dub-list-url').val()
    @.get('backendAdapter').request(url, 'GET', null, null, null, null, false, true).then (dubTrackList) =>
        for dubTrack in dubTrackList
          if (dubIdMatch = location.search.match(/([?&])dubId=[^&]+/))?
            dubTrack.dubTrackUrl = location.href.replace(/library\/?/, '').replace(/([?&]dubId=)[^&]+/, '$1'+dubTrack.id)
          else
            dubTrack.dubTrackUrl = location.href.replace(/library\/?/, '')+'?dubId='+dubTrack.id
          for attr in Object.keys(dubTrack)
            if attr.indexOf('_') >= 0 && (!dubTrack[attr.camelize()]?)
              dubTrack[attr.camelize()] = dubTrack[attr]

        @.set 'dubTrackList', dubTrackList
  ).on('init')
  actions:
    todo: ->
      alert('todo')

export default DubTrackLibraryComponent
