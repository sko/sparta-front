// for use in each loops, e.g {{#each (range 2 4) as |n|}}<div>n<div>{{/each}} -> <div>2</div> <div>3</div> <div>4</div>
//                       or  {{#each (range 0 60 true restaurant.timeSlotLength) as |minutes|}}
// params[0] ... from
// params[1] ... to
// params[2](optional) ... true: < to (instead of <=)
// params[3](optional) ... step (default 1)
import { helper } from '@ember/component/helper';

// increase with numbers, include/append with strings is abuse
export function range(params, _hash) {
  // (i for i in [params[0]..params[1]-(if params[2] then 1 else 0)] by (params[3]||1))
  let range = [];
  for (var i=params[0] ; i<=(params[1]-(params[2] ? 1 : 0)) ; i+=(params[3]||1)) {
    range.push(i);
  }
  return range;
}

export default helper(range);
