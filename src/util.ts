import { Nullable } from 'javascriptutilities';

export function shallowClone<T>(object: Nullable<T>): Nullable<T> {
  if (object === undefined || object === null) {
    return object;
  } else if (
    typeof object === 'boolean' ||
    typeof object === 'number' ||
    typeof object === 'string'
  ) {
    return object;
  } else if (object instanceof Array) {
    return object.map(v => v) as any;
  } else {
    return Object.assign({}, object);
  }
}
