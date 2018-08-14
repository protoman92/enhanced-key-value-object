import { JSObject, Nullable, Objects, Try, TryResult } from 'javascriptutilities';
import { Impl, Type } from './object';
import { empty } from './object+utility';
import { DeleteKey, DELETE_KEY } from './param';
import { shallowClone, shallowCloneObject } from './util';
export type EKVMapFn = (value: Try<unknown>) => TryResult<unknown>;
export type EKVRawMapFn = (value: Nullable<unknown>) => Nullable<unknown>;

declare module './object' {
  export interface Type {
    /**
     * Empty the current object.
     * @returns {Type} A Type instance.
     */
    emptying(): Type;

    /**
     * Map the value at a certain path to another value.
     * @param {string} path The path at which to map the value.
     * @param {EKVMapFn} mapFn Mapping function.
     * @returns {Type} A Type instance.
     */
    mappingValue(path: string, mapFn: EKVMapFn): Type;

    /**
     * Update value at a certain path.
     * @param {string} path The path at which to update value.
     * @param {Nullable<unknown>} value Unknown value.
     * @returns {Type} A Type instance.
     */
    updatingValue(path: string, value: Nullable<unknown>): Type;

    /**
     * Remove value at a certain path.
     * @param {string} path The path at which to remove value.
     * @returns {Type} A Type instance.
     */
    removingValue(path: string): Type;

    /**
     * Update values from some object.
     * @param {Nullable<JSObject<unknown>>} object A JSObject instance.
     * @returns {Type} A Type instance.
     */
    updatingValues(object: Nullable<JSObject<unknown>>): Type;

    /**
     * Assuming that each key in the external object consists of subkeys joined
     * by a separator, update the current object with values from said keys.
     * @param {JSObject<unknown>} values A JSObject instance.
     * @param {string} [separator] Optional separator, defaults to the inner
     * path separator.
     * @returns {Type} A Type instance.
     */
    updatingValuesWithFullPaths(values: JSObject<unknown>, separator?: string): Type;

    /**
     * Copy value from one node to another.
     * @param {string} src The source path.
     * @param {string} dest The destination path.
     * @returns {Type} A Type instance.
     */
    copyingValue(src: string, dest: string): Type;

    /**
     * Move value from one node to another.
     * @param {string} src The source path.
     * @param {string} dest The destination path.
     * @returns {Type} A Type instance.
     */
    movingValue(src: string, dest: string): Type;

    /**
     * Swap the values between two paths.
     * @param {string} path1 The first path.
     * @param {string} path2 The second path.
     * @returns {Type} A Type instance.
     */
    swappingValue(path1: string, path2: string): Type;
  }

  export interface Impl extends Type {
    /**
     * Clone with a new object.
     * @param {JSObject<unknown>} object A JSObject instance.
     * @returns {Impl} An Impl instance.
     */
    _cloneWithNewObject(object: JSObject<unknown>): Impl;

    /**
     * Map value at a certain path by modifying an external object. This method
     * should not be used anywhere else except internally.
     * @param {JSObject<unknown>} object The object to modify.
     * @param {string} path The path at which to update value.
     * @param {EKVRawMapFn} mapFn Mapping function.
     * @returns {Impl} An Impl instance.
     */
    _mappingValue(object: JSObject<unknown>, path: string, mapFn: EKVRawMapFn): Impl;

    /**
     * Update value at a certain path by modifying an external object. This
     * method should not be used anywhere else except internally.
     * @param {JSObject<unknown>} object The object to modify.
     * @param {string} path The path at which to update value.
     * @param {Nullable<unknown>} value Unknown value.
     * @returns {Impl} An Impl instance.
     */
    _updatingValue(object: JSObject<unknown>, path: string, value: Nullable<unknown>): Impl;

    /**
     * Remove value at a by modifying an external object.
     * @param {JSObject<unknown>} object The object to modify.
     * @param {string} path The path at which to remove value.
     * @returns {Impl} An Impl instance.
     */
    _removingValue(object: JSObject<unknown>, path: string): Impl;

    /**
     * Copy value from one node to another by modifying an external object.
     * @param {string} src The source path.
     * @param {string} dest The destination path.
     * @returns {Impl} An Impl instance.
     */
    _copyingValue(object: JSObject<any>, src: string, dest: string): Impl;

    /**
     * Move value from one node to another by modifying an external object.
     * @param {JSObject<unknown>} object The object to modify.
     * @param {string} src The source path.
     * @param {string} dest The destination path.
     * @returns {Type} An Impl instance.
     */
    _movingValue(object: JSObject<unknown>, src: string, dest: string): Impl;
  }
}

Impl.prototype._cloneWithNewObject = function (object) {
  return new Impl().copyingPropertiesUnsafely(this).settingObjectUnsafely(object);
};

Impl.prototype._mappingValue = function (object, path, mapFn) {
  try {
    let subpaths = path.split(this.pathSeparator);
    let objectCopy = object;
    let currentResult: any = objectCopy;

    for (let i = 0, length = subpaths.length; i < length; i++) {
      let subpath = subpaths[i];
      let interValue = currentResult[subpath];

      if (i === length - 1) {
        let newValue = mapFn(interValue);

        if (newValue instanceof DeleteKey) {
          delete currentResult[subpath];
        } else {
          currentResult[subpath] = shallowClone(newValue);
        }

        break;
      }

      if (
        interValue === undefined ||
        interValue === null ||
        !Object.isExtensible(interValue)
      ) {
        interValue = {};
      } else {
        /**
         * If an object exists at this path, shallow clone it to remove the
         * reference pointing to said object. This means many EKVObjects may
         * share the same references to some inner objects, but every time we
         * update at those paths we clone these to avoid state sharing.
         */
        interValue = shallowCloneObject(interValue);
      }

      currentResult[subpath] = interValue;
      currentResult = interValue;
    }

    return this._cloneWithNewObject(objectCopy);
  } catch (e) {
    return this.cloneBuilder().build() as Impl;
  }
};

Impl.prototype._updatingValue = function (object, path, value) {
  return this._mappingValue(object, path, () => value);
};

Impl.prototype._removingValue = function (object, path) {
  return this._updatingValue(object, path, DELETE_KEY);
};

Impl.prototype._copyingValue = function (object, src, dest) {
  let sourceValue = this._valueAtNode(object, src);
  return this._updatingValue(object, dest, sourceValue.value);
};

Impl.prototype._movingValue = function (object, src, dest) {
  return this._copyingValue(object, src, dest)._removingValue(object, src);
};

Impl.prototype.emptying = function (): Type {
  return empty();
};

Impl.prototype.mappingValue = function (path, mapFn) {
  return this._mappingValue(this.shallowClonedObject, path, v => {
    return Try.unwrap(mapFn(Try.unwrap(v))).value;
  });
};

Impl.prototype.updatingValue = function (path, value) {
  return this._updatingValue(this.shallowClonedObject, path, value);
};

Impl.prototype.removingValue = function (path) {
  return this._removingValue(this.shallowClonedObject, path);
};

Impl.prototype.updatingValues = function (object) {
  try {
    let currentObject = this;
    let clonedTarget = JSON.parse(JSON.stringify(object));
    let newObject = Object.assign(currentObject, clonedTarget);

    return new Impl()
      .copyingPropertiesUnsafely(this)
      .settingObjectUnsafely(newObject);
  } catch (e) {
    return this.cloneBuilder().build();
  }
};

Impl.prototype.updatingValuesWithFullPaths = function (object, separator?) {
  let pathSeparator = this.pathSeparator;
  let sep = separator || pathSeparator;
  let shouldReconstruct = sep !== pathSeparator;
  let result = this;
  let resultObject = this.shallowClonedObject;

  Objects.entries(object).forEach(([key, value]) => {
    let actualKey = shouldReconstruct ? key.split(sep).join(pathSeparator) : key;
    result = result._updatingValue(resultObject, actualKey, value);
  });

  return result;
};

Impl.prototype.copyingValue = function (src, dest): Type {
  return this._copyingValue(this.shallowClonedObject, src, dest);
};

Impl.prototype.movingValue = function (src, dest) {
  return this._movingValue(this.shallowClonedObject, src, dest);
};

Impl.prototype.swappingValue = function (path1, path2) {
  let clonedObject = this.shallowClonedObject;
  let value1 = this._valueAtNode(clonedObject, path1).value;
  let value2 = this._valueAtNode(clonedObject, path2).value;
  let result = this._updatingValue(clonedObject, path2, value1);
  result = this._updatingValue(clonedObject, path1, value2);
  return result;
};
