import Ember from 'ember'

SoundTrackCreatorComponent = Ember.Component.extend
  player: ( ->
    null
  ).property()
  playerReady: ( ->
    false
  ).property()
  videoId: ( ->
    null
  ).property()
  start: ( ->
    null
  ).property()
  end: ( ->
    null
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
      @.get('player').loadVideoById
        'videoId': @.get('videoId')
        'startSeconds': @.get('start')
        'endSeconds': @.get('end')
  getYouTubePlayerAPIReadyCallback: ->
    videoSrc = $('#video').attr('src')
    @.set 'videoId', videoSrc.match(/embed\/([^\/&?]+)/)[1]
    @.set 'start', videoSrc.match(/[?&]start=([^&]+)/)[1]
    @.set 'end', videoSrc.match(/[?&]end=([^&]+)/)[1]
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
