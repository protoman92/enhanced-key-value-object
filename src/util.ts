import {Never} from 'javascriptutilities';
import {DeleteKey} from './param';

export function shallowCloneObject(object: {}): {} {
  return Object.assign({}, object);
}

export function shallowClone<T>(object: Never<T>): Never<T> {
  if (object instanceof DeleteKey) {
    return object;
  } else if (object === undefined || object === null) {
    return object;
  } else if (
    typeof object === 'boolean' ||
    typeof object === 'number' ||
    typeof object === 'string'
  ) {
    return object;
  } else if (object instanceof Array) {
    return [...object] as any;
  } else {
    return shallowCloneObject(object) as T;
  }
}

export function join(sep: string, ...paths: any[]) {
  return paths.join(sep);
}
