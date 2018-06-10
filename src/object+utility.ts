import { Builder, Type } from './object';

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
