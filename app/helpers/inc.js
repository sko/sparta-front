import { helper } from '@ember/component/helper';

// increase with numbers, include/append with strings is abuse
export function inc(params, _hash) {
  return params[0] + (params[1] || 1);
}

export default helper(inc);
