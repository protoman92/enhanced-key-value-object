import { Never } from 'javascriptutilities';
import { DeleteKey } from './param';

export function shallowCloneObject(object: {}): {} {
  return Object.assign({}, object);
}

export function shallowClone<T>(object: Never<T>): Never<T> {
  if (object instanceof DeleteKey) {
    return object;
  }

  if (object === undefined || object === null) {
    return object;
  }

  if (
    typeof object === 'boolean' ||
    typeof object === 'number' ||
    typeof object === 'string'
  ) {
    return object;
  }

  if (object instanceof Array) {
    return [...object] as any;
  }

  const prototype = Object.getPrototypeOf(object);

  // Complex objects should be left alone.
  if (prototype && Object.getPrototypeOf(prototype)) {
    return object;
  }

  return shallowCloneObject(object) as T;
}

export function join(sep: string, ...paths: any[]) {
  return paths.join(sep);
}
