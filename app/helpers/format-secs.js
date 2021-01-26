import { helper } from '@ember/component/helper';
import moment from 'moment';

// format secs to hh:mm:ss
export function formatSecs(params, _hash) {
  let secs = params[0];

  let formatJoin = [];
  if (secs >= 60 * 60) {
    formatJoin.push(secs / 60 / 60);
    secs -= secs % (60 * 60);
  }
  if (formatJoin.length >= 1 || secs >= 60) {
    formatJoin.push(secs / 60);
    secs -= secs % (60);
  }
  formatJoin.push(secs / 60);

  return formatJoin.join(':');
}

export default helper(formatSecs);
