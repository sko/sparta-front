import Service from '@ember/service';
import { computed } from '@ember/object';
import { A } from '@ember/array';

export default Service.extend({
  audioContext: null,
  config: null,
  bufferLen: -1,
  numChannels: -1,
  recordBuffers: computed(function() {
    return [];
  }),
  recording: computed('curVideoSelector', 'resetMediaInputFlag', function() {
    return false;
  }),
  shouldStop: false,
  stopped: false,
  setupMediaRecorder(stream, cfg) {
    const config = this.set('config', {
        mimeType: cfg.mimeType || 'audio/webm',
        bufferLen: cfg.bufferLen|| 8192, // 4096
        numChannels: cfg.numChannels || 2
      });
    const mediaRecorder = this.set('mediaRecorder', new MediaRecorder(stream, config));

    const recordedChunks = this.get('recordBuffers') || this.set('recordBuffers', A([]));
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }

      if(this.shouldStop === true && this.stopped === false) {
        this.set('stopped', true);
        mediaRecorder.stop();
        this.get('stoppedRecordingCallback')();
      } else if (!this.stopped) {
        mediaRecorder.requestData();
      }
    };

    return mediaRecorder;
  },
  getData() {
    let tmp = this.get('recordBuffers').toArray();
    // console.log('recordAudio - getData: recordBuffers.length = ' + tmp.length + ', shouldStop = ' + this.shouldStop + ', stopped = ' + this.stopped + ', this.mediaRecorder.state = '+this.mediaRecorder.state);
    this.get('recordBuffers').clear();
    return tmp; // returns an array of array containing data from various channels
  },
  record() {
    this.setProperties({ shouldStop: false, stopped: false, recording: true });
    console.log('recordAudio - record: this.mediaRecorder.state = '+this.mediaRecorder.state);
    // this.mediaRecorder.state == 'recording'
    if (this.mediaRecorder.state != 'inactive') this.mediaRecorder.stop();
    this.mediaRecorder.start();
    this.mediaRecorder.requestData();
  },
  start() {
    return this.set('recording', true);
  },
  stop(stoppedRecordingCallback) {
    this.setProperties({ shouldStop: true, recording: false, stoppedRecordingCallback: stoppedRecordingCallback });
    return this.set('recording', false);
  }// ,
  // newTrack(stream, cfg) {
  //   this.set('config', cfg || {});
  //   this.set('bufferLen', this.get('config.bufferLen') || 8192);
  //   this.set('numChannels', this.get('config.numChannels') || 2); // 2
  //
  //   let input = this.get('audioContext').createMediaStreamSource(stream);
  //   let processor = this.get('audioContext').createScriptProcessor(1024,1,1);
  //
  //   input.connect(processor);
  //   processor.connect(this.get('audioContext.destination'));
  //
  //   processor.onaudioprocess = (e) => {
  //       if (!this.get('recording'))
  //         return;
  //       for (let i=0 ; i<(this.get('numChannels') - 1) ; i++) {
  //         if ((recordBuffers = this.get('recordBuffers'))[i] == null) {
  //           recordBuffers.splice(i, 0, []);
  //           this.set('recordBuffers', recordBuffers);
  //         };
  //         console.log('recording ...');
  //         this.get('recordBuffers')[i].push.apply(this.get('recordBuffers')[i], e.inputBuffer.getChannelData(i));
  //       }
  //   };
  //   return stream;
  // }
});
