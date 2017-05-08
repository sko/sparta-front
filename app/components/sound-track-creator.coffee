import Ember from 'ember'
import recorder from 'recorder'

SoundTrackCreatorComponent = Ember.Component.extend
  recordAudio: Ember.inject.service()
  backendAdapter: Ember.inject.service()
  audioContext: Ember.computed.alias('recordAudio.audioContext')
  dubSpecReady: false
  initialPlayed: false
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
  setupAudioTracking: ( ->
    try
      AudioContext = window.AudioContext||window.webkitAudioContext;
      @.set 'audioContext', new AudioContext()
    catch error
      console.log('no audio-player-support', error)
    if (Modernizr.getusermedia)
      if (dubIdMatch = location.search.match(/[?&]dubId=([^&]+)/))?
        @.set 'dubTrackJSON', null
        url = $('#dub-data-url').val().replace(/:dubId/, dubIdMatch[1])
        @.get('backendAdapter').request(url, 'GET').then (dubData) =>
            @.set 'videoId', dubData.video_id
            @.set 'start', dubData.start_secs
            @.set 'end', dubData.end_secs
            @.createDownloadLink dubData.dub_track_url
            @.set 'dubSpecReady', true
            if @.get('player')? && (!@.get('initialPlayed'))
              @.send 'playVideo', false
      constraints = {audio: true}
      gUM = Modernizr.prefixed('getUserMedia', navigator)
      gUM constraints, (stream) =>
          recorderConfig =
            bufferLen: 8192
            numChannels: 1
          @.set 'audioInput', stream
          @.set 'audioRecorder', new Recorder(@.get('audioContext').createMediaStreamSource(stream), recorderConfig)
        , (e) =>
          console.log('Reeeejected!', e)
          alert('Reeeejected!')
  ).on('init')
  setupYoutubeAPI: ( ->
    tag = document.createElement('script')
    tag.src = "//www.youtube.com/player_api"
    firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore tag, firstScriptTag
    window.onYouTubePlayerAPIReady = @.onYouTubePlayerAPIReady.bind(@)
  ).on('init')
  initialDubTrack: ( ->
    if @.get('dubTrackJSON')?
      dubData = JSON.parse(@.get('dubTrackJSON'))
      @.set 'videoId', dubData.video_id
      @.set 'start', dubData.start_secs
      @.set 'end', dubData.end_secs
      @.createDownloadLink dubData.dub_track_url
      @.set 'dubSpecReady', true
      if @.get('player')? && (!@.get('initialPlayed'))
        @.send 'playVideo', false
  ).on('didInsertElement')
  actions:
    setVideoId: () ->
      @.set 'videoId', $('#videoId').val()
      @.set 'start', parseInt($('#startSecs').val())
      @.set 'end', parseInt($('#endSecs').val())
      $('#video').attr 'src', $('#video').attr('src').
                              replace(/embed\/[^?]+/, 'embed/'+$('#videoId').val()).
                              replace(/([?&])start=[^&]+/, '$1start='+$('#startSecs').val()).
                              replace(/([?&])end=[^&]+/, '$1end='+$('#endSecs').val())
    playVideo: (orig = true) ->
      unless @.get('initialPlayed')
        @.set 'initialPlayed', true
      @.set 'orig', orig
      if orig
        @.get('player').unMute()
        @.get('player').setVolume (@.get('volume') || 100)
      else
        @.get('player').mute()
        #@.get('player').setVolume 0
      @.get('player').playVideo()
      # preload video for next play
      @.get('player').loadVideoById
        'videoId': @.get('videoId')
        'startSeconds': @.get('start')
        'endSeconds': @.get('end')
    startRecording: () ->
      @.set 'recording', true
      @.send 'playVideo', false
    stopRecording: () ->
      console.log 'stop recording audio-track ...'
      @.set 'recording', false
      @.get('audioRecorder').stop()
      # TODO: yt-timecode
      @.get('audioRecorder').exportWAV (blob) =>
          @.set 'audioBlob', blob
          @.createDownloadLink @.set('dubTrackUrl', URL.createObjectURL(blob))
          # @.initAudioBuffer @.set('dubTrackUrl', URL.createObjectURL(blob))
          # @.get('audioRecorder').clear()
        #, "audio/wav"
      @.get('audioRecorder').clear()
    shareVideo: () ->
      reader = new window.FileReader()
      reader.onloadend = () =>
          @.set 'dubTrackData', reader.result
          @.uploadDubData null, (dubData) =>
              # dubTrackUrl = dubData.dub_track_url
              if (dubIdMatch = location.search.match(/([?&])dubId=[^&]+/))?
                dubTrackUrl = location.href.replace(/([?&]dubId=)[^&]+/, '$1'+dubData.id)
              else
                dubTrackUrl = location.href+'?dubId='+dubData.id
              $('body').prepend "<a href='"+dubTrackUrl+"' target='dubTrack'>"+dubTrackUrl+"</a><br>"
      reader.readAsDataURL @.get('audioBlob')
  
  # audiobuffers can be started only once, so after end we setup next one for replay.
  initAudioBuffer: (audioFileUrl) ->
    @.set 'audioBufferStarted', false
    @.set 'audioBuffer', @.connectAudioSource(audioFileUrl, (data) =>
        console.log 'continue with original audio, videoStarted = '+@.get('videoStarted')
        if @.get('videoStarted')
          # @.get('audioBuffer').disconnect()
          $('#rec_ctrl').attr("disabled", true)
          @.get('player').unMute()
          @.get('player').setVolume (@.get('volume') || 100)
          @.initAudioBuffer audioFileUrl
      )
  
  onYouTubePlayerAPIReady: ->
    # videoSrc = $('#video').attr('src')
    # @.set 'videoId', videoSrc.match(/embed\/([^\/&?]+)/)[1]
    # @.set 'start', videoSrc.match(/[?&]start=([^&]+)/)[1]
    # @.set 'end', videoSrc.match(/[?&]end=([^&]+)/)[1]
    @.set 'player', new YT.Player 'video',
      events:
        'onReady': @.onYouTubePlayerReady.bind(@)
        'onStateChange': @.onYouTubePlayerStateChange.bind(@)
    @.set 'volume', 100 # @.get('player').getVolume()
  
  onYouTubePlayerReady: ->
    @.set 'playerReady', true
    if @.get('dubSpecReady') && (!@.get('initialPlayed'))
      @.send 'playVideo', false
  
  onYouTubePlayerStateChange: (event) ->
    console.log 'yt-player-state: '+event.data+', videoStarted = '+@.get('videoStarted')+', playerState = '+@.get('player').getPlayerState()+', videoLoaded = '+@.get('player').getVideoLoadedFraction()+', recording = '+@.get('recording')
    switch event.data
      when 1
        $('#play_orig').attr("disabled", true)
        $('#play_dub').attr("disabled", true)
        if (stopAudio = @.get('stopAudioCallback'))?
          stopAudio()
        @.set 'videoStarted', true
        console.log 'yt-player started playing ...'
        unless @.get('orig')
          if @.get('player').getVideoLoadedFraction() != 0
            if @.get('recording')
              console.log 'start recording audio-track ...'
              @.get('audioRecorder').record()
            else
              console.log 'start playing audio-track; player.startSeconds = '+@.get('start')+', player.getCurrentTime = '+@.get('player').getCurrentTime()
              # @.get('audioBuffer').start(0)
              @.set 'audioBufferStarted', true
              $('audio')[0].currentTime = 0.2 # @.get('player').getCurrentTime() - @.get('start')
              console.log 'currentTime = '+$('audio')[0].currentTime
              $('audio')[0].play()
      when 0
        @.set 'videoStarted', false
        @.set 'stopAudioCallback', null
        $('#play_orig').attr("disabled", false)
        $('#play_dub').attr("disabled", false)
        $('#rec_ctrl').attr("disabled", false)
  
  createDownloadLink: (url) ->
    $('audio').remove()
    au = document.createElement('audio')
    au.controls = true
    au.volume = 1.0
    au.preload = 'auto'
    au.src = url
    $('body').append(au)
    $('audio').on 'ended', () =>
        if @.get('dubSpecReady')
          console.log 'continue with original audio ...'
          $('#rec_ctrl').attr("disabled", true)
          @.get('player').unMute()
          @.get('player').setVolume (@.get('volume') || 100)
  
  connectAudioSource: (filePath, callback = null) ->
    if @.get('audioContext')?
      console.log 'setting up audio buffersource with '+filePath+' ...'
      audio1 = @.get('audioContext').createBufferSource()
      bufferLoader = new BufferLoader(
        @.get('audioContext'),
        [
          filePath
        ],
        (bufferList) =>
            @.set 'stopAudioCallback', () =>
                debugger
                audio1.stop()
                #audio1.currentTime = 0
            audio1.buffer = bufferList[0]
            audio1.connect @.get('audioContext.destination')
            if callback?
              audio1.onended = () ->
                  callback {msg: 'finished'}
        )
      bufferLoader.load()
    audio1
  
  setupForm: (challengeResponseToken = null) ->
    formData = new FormData()
    formData.append ('dub_data[video_id]'), @.get('videoId')
    formData.append ('dub_data[start_secs]'), @.get('start')
    formData.append ('dub_data[end_secs]'), @.get('end')
    formData.append ('dub_data[dub_track]'), @.get('dubTrackData')
    formData
  
  uploadDubData: (challengeResponseToken = null, callBack = null) ->
    formData = @.setupForm()
    url = $('#publish-url').val()
    @.get('backendAdapter').request(url, 'POST', formData).then (response) =>
        console.log('response.message OK = '+response.success)
        callBack(response.dub_data)
      , (error) =>
        alert 'error'


export default SoundTrackCreatorComponent
