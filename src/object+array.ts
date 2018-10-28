import {
  Collections,
  JSObject,
  Never,
  Try,
  TryResult
} from 'javascriptutilities';
import { Impl } from './object';
import { join } from './util';
export type EKVMapFn = (value: Try<unknown>) => TryResult<unknown>;
export type EKVRawMapFn = (value: Never<unknown>) => Never<unknown>;
type CompareFn = (v1: unknown, v2: unknown) => boolean;

declare module './object' {
  export interface Type {
    /**
     * Assuming that the value found at the specified path is an Array, or an
     * Object which is convertible to an Array (i.e. all its keys are number
     * strings), delete the value found at the specified index and shift all
     * subsequent values one index up.
     * @param {string} path The path of the Array-compatible object.
     * @param {number} index The index to remove value.
     * @returns {Type} A Type instance.
     */
    removingArrayIndex(path: string, index: number): Type;

    /**
     * Check if the object found at the specified path, and if it is, upsert
     * a value there dependending on whether there is any object that equals it
     * in some way.
     * @param {string} path The path of the Array-compatible object.
     * @param {unknown} object Unknown object.
     * @param {CompareFn} [compareFn] Comparison function that defauls to
     * equality check.
     * @returns {Type} A Type instance.
     */
    upsertingInArray(
      path: string,
      object: unknown,
      compareFn?: CompareFn
    ): Type;
  }

  export interface Impl extends Type {
    /**
     * Update an inner array with a mapping function by modifying an external
     * object. This assumes the value at the specified path is either an Array
     * or an Array-compatible object.
     * @param {JSObject<unknown>} object The object to modify.
     * @param {string} path The path at which to update value.
     * @param {(object: JSObject<unknown>, lastIndex: number) => Impl} arrayFn
     * Array index side effect. This may mutate the parameter object.
     * @returns {Impl} An Impl instance.
     */
    _updatingArray(
      object: JSObject<unknown>,
      path: string,
      arrayFn: (object: JSObject<unknown>, lastIndex: number) => Impl
    ): Impl;
  }
}

Impl.prototype._updatingArray = function(object, path, arrayFn) {
  const arrayObject = this._valueAtNode(object, path)
    .map(v => {
      return v instanceof Object ? v : {};
    })
    .getOrElse(() => ({}));

  const keys = Object.keys(arrayObject);
  if (keys.length === 0) return arrayFn(object, -1);

  try {
    const lastKey = Collections.last(keys).getOrThrow();
    const lastIndex = parseInt(lastKey, undefined);

    if (!isNaN(lastIndex)) {
      return arrayFn(object, lastIndex);
    }
  } catch {}

  return this.cloneBuilder().build() as Impl;
};

Impl.prototype.removingArrayIndex = function(path, index) {
  return this._updatingArray(this.shallowClonedObject, path, (v, lastIndex) => {
    const sep = this.pathSeparator;
    const buildPath = (i: number) => join(sep, path, i);
    let newState = this;

    for (let i = index; i <= lastIndex; i += 1) {
      if (i === lastIndex) {
        newState = newState._removingValue(v, buildPath(i));
      } else {
        newState = newState._movingValue(v, buildPath(i + 1), buildPath(i));
      }
    }

    return newState;
  });
};

Impl.prototype.upsertingInArray = function(path, value, fn) {
  const compareFn = fn || ((v1: unknown, v2: unknown) => v1 === v2);

  return this._updatingArray(this.shallowClonedObject, path, (v, lastIndex) => {
    const newState = this;
    const buildPath = (i: number) => join(this.pathSeparator, path, i);

    for (let i = 0; i <= lastIndex; i += 1) {
      const indexPath = buildPath(i);
      const valueAtIndex = this._valueAtNode(v, indexPath).value;

      if (valueAtIndex !== undefined && valueAtIndex !== null) {
        if (compareFn(valueAtIndex, value)) {
          return newState._updatingValue(v, indexPath, value);
        }
      } else {
        continue;
      }
    }

    const lastIndexPath = buildPath(lastIndex + 1);
    return newState._updatingValue(v, lastIndexPath, value);
  });
};
