import { Builder, EKVObjectType, Impl, Type } from './object';

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
 * @param {EKVObjectType} object An EKVObjectType instance.
 * @returns {Type} A Type instance.
 */
export function just(object: EKVObjectType): Type {
  if (object instanceof Impl) {
    return object;
  } else {
    return builder().withObject(object).build();
  }
}
