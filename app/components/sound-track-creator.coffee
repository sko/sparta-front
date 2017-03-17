import Ember from 'ember'

SoundTrackCreatorComponent = Ember.Component.extend
  player: ( ->
    null
  ).property()
  playerReady: ( ->
    false
  ).property()
  setupYoutubeAPI: ( ->
    tag = document.createElement('script')
    tag.src = "//www.youtube.com/player_api"
    firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore tag, firstScriptTag
    window.onYouTubePlayerAPIReady = @.getYouTubePlayerAPIReadyCallback.bind(@)
  ).on('init')
  actions:
    playVideo: ->
      @.get('player').playVideo()
  getYouTubePlayerAPIReadyCallback: ->
    @.set 'player', new YT.Player 'video',
      events:
        'onReady': @.onYouTubePlayerReady.bind(@)
        'onStateChange': @.onYouTubePlayerStateChange.bind(@)
  onYouTubePlayerReady: ->
    @.set 'playerReady', true
  onYouTubePlayerStateChange: (event) ->
    if event.data == 1
      console.log 'yt-player started playing ...'

export default SoundTrackCreatorComponent
