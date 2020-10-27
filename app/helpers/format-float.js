import { helper } from '@ember/component/helper';

// format 2 digits
export function formatFloat(params, _hash) {
  return (''+Math.round(params[0] * 100) * 10 / 1000).
         replace(/(\...).$/, '$1').
         replace(/(\..)$/, '$10').
         replace(/([^.]{3})$/, '$1.00').
         replace(/(.)(...\...)$/, '$1.$2')/*.replace(/\.(..)$/, ',$1')*/.
         replace(/^(-?)\./, '$1').
         replace(/^([^.]+)$/, '$1.00');
}

export default helper(formatFloat);
