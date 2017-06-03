# import Ember from 'ember'
import recorder from 'recorder'

SoundTrackCreatorComponent = Ember.Component.extend
  recordAudio: Ember.inject.service()
  backendAdapter: Ember.inject.service()
  application: (->
    Ember.getOwner(@).lookup('controller:application')
  ).property()
  skipSample: false
  showHowTo: false
  howToObserver: Ember.observer 'showHowTo', ->
    videoProps = ['videoId', 'start', 'newStart', 'origDubTrackStartSecs', 'end', 'newEnd', 'audioBuffer', 'initialPlayed']
    dubTrackProps = ['dubTrackDelay', 'newDubTrackDelay', 'innerDubTrackDelay', 'newInnerDubTrackDelay']
    if @.get('showHowTo')
      for propKey in videoProps.concat(dubTrackProps)
        @.set 'howToOrig'+propKey, @.get(propKey)
      @.set 'videoId', 'haNzpiLYdEk'
      @.set 'origDubTrackStartSecs', @.set('newStart', @.set('start', 49))
      @.set 'newEnd', @.set('end', 55)
      @.set 'audioBuffer', null
      @.set 'initialPlayed', true
      @.set 'orig', true
      for propKey in dubTrackProps
        @.set propKey, 0
    else
      for propKey in videoProps.concat(dubTrackProps)
        @.set propKey, @.get('howToOrig'+propKey)
      for propKey in videoProps.concat(dubTrackProps)
        @.set 'howToOrig'+propKey, null
    unless @.get('displayControls')
      @.set 'displayControls', true
    @.get('player').destroy()
    @.initPlayer()
  audioContext: Ember.computed.alias('recordAudio.audioContext')
  dubSpecReady: false
  displayControls: true
  initialPlayed: false
  useAudioTag: ( ->
    false # mobile / browser dependent
  ).property()
  player: null
  playerWidth: ( ->
    560
  ).property()
  playerHeight: ( ->
    315
  ).property()
  playerReady: ( ->
    false
  ).property()
  sharedDubTrackUrls: []
  videoId: null
  origDubTrackStartSecs: -1
  start: -1
  end: 1
  dubTrackDelay: 0
  innerDubTrackDelay: 0
  newStart: -1
  newEnd: 1
  newDubTrackDelay: 0
  newInnerDubTrackDelay: 0
  changeObserver: Ember.observer 'start', 'newStart', 'end', 'newEnd', 'dubTrackDelay', 'newDubTrackDelay', 'innerDubTrackDelay', 'newInnerDubTrackDelay', ->
    newCuttingData = false
    if @.get('start') != parseInt(@.get('newStart'))
      $('#startSecs').css 'background-color', 'red'
      newCuttingData = true
    else
      $('#startSecs').css 'background-color', ''
    if @.get('end') != parseInt(@.get('newEnd'))
      $('#endSecs').css 'background-color', 'red'
      newCuttingData = true
    else
      $('#endSecs').css 'background-color', ''
    if newCuttingData
      $('#setCuttingData').css 'background-color', 'red'
    else
      $('#setCuttingData').css 'background-color', ''

    newDubTrackDelay = false
    if @.get('dubTrackDelay') != parseInt(@.get('newDubTrackDelay'))
      $('#dubTrackDelayMillis').css 'background-color', 'red'
      newDubTrackDelay = true
    else
      $('#dubTrackDelayMillis').css 'background-color', ''
    if @.get('innerDubTrackDelay') != parseInt(@.get('newInnerDubTrackDelay'))
      $('#innerDubTrackDelayMillis').css 'background-color', 'red'
      newDubTrackDelay = true
    else
      $('#innerDubTrackDelayMillis').css 'background-color', ''
    if newDubTrackDelay
      $('#setDubTrackDelay').css 'background-color', 'red'
    else
      $('#setDubTrackDelay').css 'background-color', ''
  orig: true
  volume: null
  videoStarted: false
  stopAudioCallback: null
  setupAudioTracking: ( ->
    @.set 'application.sTC', @
    try
      AudioContext = window.AudioContext||window.webkitAudioContext;
      @.set 'audioContext', new AudioContext()
    catch error
      console.log('no audio-player-support', error)
    if (Modernizr.getusermedia)
      if @.get('skipSample')
        @.set 'dubSpecReady', true
        @.set 'initialPlayed', true
        @.set 'displayControls', false
        @.set 'start', 0
        @.set 'end', 1
        @.set 'newStart', 0
        @.set 'newEnd', 1
        if $('#iframe_api').length >= 1
          Ember.run.schedule "afterRender", =>
              @.initPlayer()
        else
          Ember.run.schedule "afterRender", =>
              @.setupYoutubeAPI()
      else
        dubIdMatch = (location.search.match(/[?&]dubId=([^&]+)/) || [null, '-1'])
        url = $('#dub-data-url').val().replace(/:dubId/, dubIdMatch[1])
        @.get('backendAdapter').request(url, 'GET').then (dubData) =>
            @.set 'videoId', dubData.video_id
            @.set 'origDubTrackStartSecs', dubData.start_secs + dubData.delay_millis / 1000
            @.set 'start', dubData.start_secs
            @.set 'end', dubData.end_secs
            @.set 'dubTrackDelay', dubData.delay_millis
            @.set 'innerDubTrackDelay', dubData.inner_delay_millis
            @.set 'newStart', dubData.start_secs
            @.set 'newEnd', dubData.end_secs
            @.set 'newDubTrackDelay', dubData.delay_millis
            @.set 'newInnerDubTrackDelay', dubData.inner_delay_millis
            if @.get('useAudioTag')
              @.createDownloadLink dubData.dub_track_url
            else
              @.initAudioBuffer @.set('dubTrackUrl', dubData.dub_track_url)
            @.set 'dubSpecReady', true
            Ember.run.schedule "afterRender", =>
                @.setupYoutubeAPI()
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
          # alert('Reeeejected!')
  ).on('init')
  actions:
    setVideoId: () ->
      if parseInt($('#startSecs').val()) >= parseInt($('#endSecs').val())
        $('#endSecs').val (parseInt($('#startSecs').val()) + @.get('end') - @.get('start'))
      unless @.get('displayControls')
        @.set 'displayControls', true
      noVideoChange = @.get('videoId') == $('#videoId').val()
      if noVideoChange && (@.get('start') > @.get('origDubTrackStartSecs'))
        extraDubTrackDelay = (@.get('start') - @.get('origDubTrackStartSecs')) * 1000
      else
        extraDubTrackDelay = 0
      @.set 'videoId', $('#videoId').val()
      startSecsChange = parseInt($('#startSecs').val()) - @.get('start')
      @.set 'start', parseInt($('#startSecs').val())
      @.set 'end', parseInt($('#endSecs').val())
      @.set 'newStart', parseInt($('#startSecs').val())
      @.set 'newEnd', parseInt($('#endSecs').val())
      if noVideoChange
        if (newDubTrackDelay = @.get('dubTrackDelay') - startSecsChange * 1000 - extraDubTrackDelay) < 0
          @.set 'dubTrackDelay', 0
          @.set 'newDubTrackDelay', 0
        else
          @.set 'dubTrackDelay', newDubTrackDelay
          @.set 'newDubTrackDelay', newDubTrackDelay
      else
        @.set 'dubTrackDelay', 0
        @.set 'innerDubTrackDelay', 0
        @.set 'newDubTrackDelay', 0
        @.set 'newInnerDubTrackDelay', 0

      @.get('player').destroy()
      @.initPlayer()
    setDubTrackSecs: () ->
      @.set 'dubTrackDelay', parseInt($('#dubTrackDelayMillis').val())
      @.set 'innerDubTrackDelay', parseInt($('#innerDubTrackDelayMillis').val())
    playVideo: (orig = true) ->
      @.set 'orig', orig
      if orig
        @.get('player').unMute()
        # @.get('player').setVolume (@.get('volume') || 100)
      # else
      #   @.get('player').mute()
        # @.get('player').setVolume 0
      # @.get('player').playVideo()
      @.get('player').loadVideoById
        'videoId': @.get('videoId')
        'startSeconds': @.get('start')
        'endSeconds': @.get('end')
    startRecording: () ->
      @.set 'dubTrackDelay', 0
      @.set 'innerDubTrackDelay', 0
      @.set 'newDubTrackDelay', 0
      @.set 'newInnerDubTrackDelay', 0
      @.set 'recording', true
      @.send 'playVideo', false
    stopRecording: () ->
      console.log 'stop recording audio-track ...'
      @.set 'recording', false
      @.set 'recorded', true
      @.get('audioRecorder').stop()
      @.get('player').unMute()
      # TODO: yt-timecode
      @.get('audioRecorder').exportWAV (blob) =>
          @.set 'audioBlob', blob
          if @.get('useAudioTag')
            @.createDownloadLink @.set('dubTrackUrl', URL.createObjectURL(blob))
          else
            @.initAudioBuffer @.set('dubTrackUrl', URL.createObjectURL(blob))
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
              if @.get('application.isMobile')
                @.set 'sharedDubTrackUrls', @.get('sharedDubTrackUrls').concat([{videoId: @.get('videoId'), dubTrackUrl: dubTrackUrl, whatsAppText: encodeURI('DubTrack => ' + dubTrackUrl)}])
              else
                @.set 'sharedDubTrackUrls', @.get('sharedDubTrackUrls').concat([{videoId: @.get('videoId'), dubTrackUrl: dubTrackUrl}])
      reader.readAsDataURL @.get('audioBlob')
    copyToClipboard: (selector) ->
      copyDatainput  = document.querySelector(selector)
      copyDatainput.select()
      document.execCommand('copy')
    newDubTrack: () ->
      @.get('router').transitionTo 'new'

  # audiobuffers can be started only once, so after end we setup next one for replay.
  initAudioBuffer: (audioFileUrl) ->
    @.set 'audioBufferStarted', false
    @.set 'audioBuffer', @.connectAudioSource(audioFileUrl, (data) =>
        console.log 'continue with original audio, videoStarted = '+@.get('videoStarted')
        if @.get('videoStarted')
          # @.get('audioBuffer').disconnect()
          $('#rec_ctrl').attr("disabled", true)
          @.get('player').unMute()
          # @.get('player').setVolume (@.get('volume') || 100)
          @.initAudioBuffer audioFileUrl
      )
  
  setupYoutubeAPI: ->
    window.onYouTubeIframeAPIReady = @.onYouTubeIframeAPIReady.bind(@)
    tag = document.createElement('script')
    tag.id = "iframe_api"
    tag.src = "//www.youtube.com/iframe_api"
    firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore tag, firstScriptTag
  
  onYouTubeIframeAPIReady: ->
    console.log 'youTubeIframeAPIReady ...'
    @.initPlayer()

  initPlayer: ->
    @.set 'player', new YT.Player 'video',
      width: @.get('playerWidth')
      height: @.get('playerHeight')
      videoId: @.get('videoId')
      events:
        'onReady': @.onYouTubePlayerReady.bind(@)
        'onStateChange': @.onYouTubePlayerStateChange.bind(@)
      playerVars:
        start: @.get('start')
        end: @.get('end')
        showinfo: 0
        controls: 0
        version: 3
        enablejsapi: 1
        html5: 1
    # @.set 'volume', 100 # @.get('player').getVolume()
  
  onYouTubePlayerReady: ->
    console.log 'youTubePlayerReady ...'
    @.set 'playerReady', true
    # if @.get('dubSpecReady') && (!@.get('initialPlayed'))
    #   @.send 'playVideo', false
    if @.get('showHowTo') && (!@.get('audioBuffer')?)
      @.send 'playVideo', true
  
  onYouTubePlayerStateChange: (event) ->
    console.log 'yt-player-state: '+event.data+', videoStarted = '+@.get('videoStarted')+', videoLoaded = '+@.get('player').getVideoLoadedFraction()+', recording = '+@.get('recording')+', initialPlayed = '+@.get('initialPlayed')+', orig = '+@.get('orig')
    switch event.data
      when 1
        unless @.get('initialPlayed')
          if (!@.get('orig')?) || @.get('orig')
            @.set 'orig', false
            # @.get('player').mute()
        $('#play_orig').attr("disabled", true)
        $('#play_dub').attr("disabled", true)
        # if (stopAudio = @.get('stopAudioCallback'))?
        if (stopAudio = @.get('stopAudioCallback'))? && @.get('audioBufferStarted')
          stopAudio()
        @.set 'videoStarted', true
        console.log 'yt-player started playing, orig = '+@.get('orig')+' ...'
        unless @.get('orig')
          if @.get('player').getVideoLoadedFraction() != 0
            if @.get('recording')
              @.get('player').mute()
              console.log 'start recording audio-track ...'
              @.get('audioRecorder').record(300)
            else
              if @.get('dubTrackDelay') <= 0
                @.startDubTrack @.get('innerDubTrackDelay')
              else
                window.setTimeout @.startDubTrack.bind(@), @.get('dubTrackDelay')
      when 0
        console.log 'stopAudioCallback = '+@.get('stopAudioCallback')+', recording = '+@.get('recording')+', audioBufferStarted = '+@.get('audioBufferStarted')
        if @.get('recording') && (@.get('player').getVideoLoadedFraction() != 0)
          @.send 'stopRecording'
        unless @.get('initialPlayed')
          @.set 'initialPlayed', true
        @.set 'videoStarted', false
        @.set 'stopAudioCallback', null
        $('#play_orig').attr("disabled", false)
        $('#play_dub').attr("disabled", false)
        $('#rec_ctrl').attr("disabled", false)
        @.set 'recorded', false

  startDubTrack: ->
    if @.get('innerDubTrackDelay') <= 0
      @.get('player').mute()
    else
      window.setTimeout @.get('player').mute.bind(@.get('player')), @.get('innerDubTrackDelay')
    console.log 'start playing audio-track; player.startSeconds = '+@.get('start')+', player.getCurrentTime = '+@.get('player').getCurrentTime()
    if @.get('useAudioTag')
      $('audio')[0].currentTime = 0.2 # @.get('player').getCurrentTime() - @.get('start')
      console.log 'currentTime = '+$('audio')[0].currentTime
      $('audio')[0].play()
    else
      # @.get('audioBuffer').start(0, @.get('innerDubTrackDelay')/1000) # @.get('player').getCurrentTime() - @.get('start')
      @.get('audioBuffer').start() # @.get('player').getCurrentTime() - @.get('start')
      @.set 'audioBufferStarted', true
  
  createDownloadLink: (url) ->
    $('audio').remove()
    au = document.createElement('audio')
    au.controls = true
    # au.muted = true
    au.volume = 1.0
    au.preload = 'auto'
    au.src = url
    $('body').append(au)
    $('audio').on 'ended', () =>
        if @.get('dubSpecReady')
          console.log 'continue with original audio, videoStarted = '+@.get('videoStarted')
          $('#rec_ctrl').attr("disabled", true)
          @.get('player').unMute()
          # @.get('player').setVolume (@.get('volume') || 100)
  
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
    formData.append ('dub_data[delay_millis]'), @.get('dubTrackDelay')
    formData.append ('dub_data[inner_delay_millis]'), @.get('innerDubTrackDelay')
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
