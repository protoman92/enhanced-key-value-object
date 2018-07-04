import { Collections, JSObject, Nullable, Try, TryResult } from 'javascriptutilities';
import { Impl } from './object';
import { join } from './util';

export type EKVMapFn = (value: Try<any>) => TryResult<any>;
export type EKVRawMapFn = (value: Nullable<any>) => Nullable<any>;

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
  }

  export interface Impl extends Type {
    /**
     * Update an inner array with a mapping function by modifying an external
     * object. This assumes the value at the specified path is either an Array
     * or an Array-compatible object.
     * @param {JSObject<any>} object The object to modify.
     * @param {string} path The path at which to update value.
     * @param {(object: JSObject<any>, lastIndex: number) => Impl} arrayFn
     * Array index side effect. This may mutate the parameter object.
     * @returns {Impl} An Impl instance.
     */
    _updatingArray(
      object: JSObject<any>,
      path: string,
      arrayFn: (object: JSObject<any>, lastIndex: number) => Impl,
    ): Impl;
  }
}

Impl.prototype._updatingArray = function (object, path, arrayFn) {
  let arrayObject = this._valueAtNode(object, path).getOrElse({});
  let keys = Object.keys(arrayObject);

  if (keys.length === 0) {
    return arrayFn(object, -1);
  } else {
    try {
      let lastKey = Collections.last(Object.keys(arrayObject)).getOrThrow();
      let lastIndex = parseInt(lastKey, undefined);

      if (!isNaN(lastIndex)) {
        return arrayFn(object, lastIndex);
      }
    } catch { }
  }

  return this.cloneBuilder().build() as Impl;
};

Impl.prototype.removingArrayIndex = function (path, index) {
  return this._updatingArray(this.shallowClonedObject, path, (v, lastIndex) => {
    let sep = this.pathSeparator;
    let buildPath = (i: number) => join(sep, path, i);

    if (index < lastIndex) {
      let newState = this._removingValue(v, buildPath(index));

      for (let i = index; i < lastIndex; i++) {
        newState = newState._movingValue(v, buildPath(i + 1), buildPath(i));
      }

      return newState;
    } else {
      return this._removingValue(v, buildPath(index));
    }
  });
};
