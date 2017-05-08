import Ember from 'ember'

RecordAudio = Ember.Service.extend 
  audioContext: null
  stream: null
  config: null
  bufferLen: -1
  numChannels: -1
  recordBuffers: []
  recording: ( ->
    false
  ).property()
  
  newTrack: (stream, cfg) ->
    @.set 'config', cfg || {}
    @.set 'bufferLen', @.get('config.bufferLen') || 4096
    @.set 'numChannels', @.get('config.numChannels') || 2
    @.set 'stream', stream
    @.start()

    input = @.get('audioContext').createMediaStreamSource(stream)
    processor = @.get('audioContext').createScriptProcessor(1024,1,1)

    input.connect processor
    processor.connect @.get('audioContext.destination')

    processor.onaudioprocess = (e) =>
        unless @.get('recording')
          return
        for i in [0..(@.get('numChannels') - 1)]
          unless (recordBuffers = @.get('recordBuffers'))[i]?
            recordBuffers.splice i, 0, []
            @.set 'recordBuffers', recordBuffers
          console.log 'recording ...'
          @.get('recordBuffers')[i].push.apply @.get('recordBuffers')[i], e.inputBuffer.getChannelData(i)

  getData: ->
    tmp = @.get('recordBuffers')
    @.set 'recordBuffers', []
    tmp # returns an array of array containing data from various channels

  start: ->
    @.set 'recording', true

  stop: ->
    @.set 'recording', false

export default RecordAudio
