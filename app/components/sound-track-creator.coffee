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
    try
      AudioContext = window.AudioContext||window.webkitAudioContext;
      @.set '_audioPlayer', new AudioContext()
    catch error
      console.log('no audio-player-support', error)
    tag = document.createElement('script')
    tag.src = "//www.youtube.com/player_api"
    firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore tag, firstScriptTag
    window.onYouTubePlayerAPIReady = @.onYouTubePlayerAPIReady.bind(@)
  ).on('init')
  actions:
    playVideo: ->
      @.get('player').playVideo()
      # preload video for next playo
      @.get('player').loadVideoById
        'videoId': @.get('videoId')
        'startSeconds': @.get('start')
        'endSeconds': @.get('end')
  onYouTubePlayerAPIReady: ->
    videoSrc = $('#video').attr('src')
    @.set 'videoId', videoSrc.match(/embed\/([^\/&?]+)/)[1]
    @.set 'start', videoSrc.match(/[?&]start=([^&]+)/)[1]
    @.set 'end', videoSrc.match(/[?&]end=([^&]+)/)[1]
    @.set 'player', new YT.Player 'video',
      events:
        'onReady': @.onYouTubePlayerReady.bind(@)
        'onStateChange': @.onYouTubePlayerStateChange.bind(@)
  onYouTubePlayerReady: ->
    @.get('player').mute()
    @.get('player').setVolume 0
    @.set 'playerReady', true
  onYouTubePlayerStateChange: (event) ->
    if event.data == 1
      console.log 'yt-player started playing ...'
      @.playSound "/das_ist_kreuzberg.wav"
  playSound: (filePath, callback = null) ->
    if @.get('_audioPlayer')?
      audio1 = @.get('_audioPlayer').createBufferSource()
      stopCB = () ->
        audio1.stop()
        #audio1.currentTime = 0
      bufferLoader = new BufferLoader(
        @.get('_audioPlayer'),
        [
          filePath
        ],
        (bufferList) =>
            audio1.buffer = bufferList[0]
            audio1.connect @.get('_audioPlayer.destination')
            if callback?
              audio1.onended = () ->
                  callback {msg: 'finished'}
            audio1.start(0)
        )
      bufferLoader.load()
      stopCB

export default SoundTrackCreatorComponent
