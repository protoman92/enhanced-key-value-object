import { Nullable } from 'javascriptutilities';

import {
  Builder,
  EKVObjectType,
  Impl,
  Type,
  objectKey,
  pathSeparatorKey,
} from './object';

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
 * @returns {Type} A Type instance.
 */
export function just(object: Nullable<EKVObjectType>): Type {
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
          .withObject(innerObject)
          .withPathSeparator(pathSeparator)
          .build();
      } else {
        return builder().withObject(object).build();
      }
    }
  } else {
    return empty();
  }
}
