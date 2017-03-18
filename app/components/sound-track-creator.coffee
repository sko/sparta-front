import Ember from 'ember'

SoundTrackCreatorComponent = Ember.Component.extend
  player: null
  playerReady: ( ->
    false
  ).property()
  videoId: null
  start: -1
  end: -1
  orig: true
  volume: -1
  videoStarted: false
  stopAudioCallback: null
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
    playVideo: (orig = true) ->
      @.set 'orig', orig
      if orig
        @.get('player').unMute()
        @.get('player').setVolume @.get('volume')
      else
        @.get('player').mute()
        #@.get('player').setVolume 0
      @.get('player').playVideo()
      # preload video for next play
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
    @.set 'volume', 100 # @.get('player').getVolume()
  onYouTubePlayerReady: ->
    @.set 'playerReady', true
  onYouTubePlayerStateChange: (event) ->
    console.log 'yt-player-state: '+event.data+', videoStarted = '+@.get('videoStarted')
    switch event.data
      when 1
        if (stopAudio = @.get('stopAudioCallback'))?
          stopAudio()
        @.set 'videoStarted', true
        console.log 'yt-player started playing ...'
        unless @.get('orig')
          console.log 'starting audio-track ...'
          @.playSound "/das_ist_kreuzberg.wav"
      when 0
        @.set 'videoStarted', false
        @.set 'stopAudioCallback', null
  playSound: (filePath, callback = null) ->
    if @.get('_audioPlayer')?
      audio1 = @.get('_audioPlayer').createBufferSource()
      bufferLoader = new BufferLoader(
        @.get('_audioPlayer'),
        [
          filePath
        ],
        (bufferList) =>
            if @.get('videoStarted')
              ((audio1) =>
                  @.set 'stopAudioCallback', () ->
                      audio1.stop()
                      #audio1.currentTime = 0
              )(audio1)
              audio1.buffer = bufferList[0]
              audio1.connect @.get('_audioPlayer.destination')
              if callback?
                audio1.onended = () ->
                    callback {msg: 'finished'}
              audio1.start(0)
        )
      bufferLoader.load()

export default SoundTrackCreatorComponent
