import { Nullable } from 'javascriptutilities';
import { Builder, EKVObjectType, Impl, objectKey, pathSeparatorKey, Type } from './object';

/**
 * Create a new builder object.
 * @returns {Builder} A Builder instance.
 */
export function builder(): Builder {
  return new Builder();
}

/**
 * Create an empty enhanced key-value object.
 * @returns {Type} A Type instance.
 */
export function empty(): Type {
  return builder().build();
}

/**
 * Create an enhanced key-value object with an object.
 * @param {Nullable<EKVObjectType>} object An EKVObjectType instance.
 * @param {('safe' | 'unsafe')} mode If safe mode, all objects are deep cloned
 * before they are set, and otherwise for unsafe mode.
 * @returns {Type} A Type instance.
 */
export function just(object: Nullable<EKVObjectType>, mode: 'safe' | 'unsafe' = 'safe'): Type {
  if (object !== undefined && object !== null) {
    if (object instanceof Impl) {
      return object;
    } else {
      let innerObject = (object as any)[objectKey];
      let pathSeparator = (object as any)[pathSeparatorKey];

      if (
        innerObject !== undefined &&
        innerObject !== null &&
        typeof pathSeparator === 'string'
      ) {
        return builder()
          .withObject(innerObject, mode)
          .withPathSeparator(pathSeparator)
          .build();
      } else {
        return builder().withObject(object, mode).build();
      }
    }
  } else {
    return empty();
  }
}
