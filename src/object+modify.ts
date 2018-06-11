import { JSObject, Nullable, Try, TryResult } from 'javascriptutilities';
import { Impl, Type } from './object';
import { empty } from './object+utility';
import { shallowClone } from './util';

export type EKVMapFn = (value: Try<any>) => TryResult<any>;

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
     * @param {Nullable<any>} value Any value.
     * @returns {Type} A Type instance.
     */
    updatingValue(path: string, value: Nullable<any>): Type;

    /**
     * Remove value at a certain path.
     * @param {string} path The path at which to remove value.
     * @returns {Type} A Type instance.
     */
    removingValue(path: string): Type;

    /**
     * Update values from some object.
     * @param {Nullable<JSObject<any>>} object A JSObject instance.
     * @returns {Type} A Type instance.
     */
    updatingValues(object: Nullable<JSObject<any>>): Type;

    /**
     * Copy value from one node to another.
     * @param {string} src The source path.
     * @param {string} dest The destination path.
     * @returns {Type<T>} A Type instance.
     */
    copyingValue(src: string, dest: string): Type;

    /**
     * Move value from one node to another.
     * @param {string} src The source path.
     * @param {string} dest The destination path.
     * @returns {Type<T>} A Type instance.
     */
    movingValue(src: string, dest: string): Type;
  }

  export interface Impl extends Type {
    /**
     * Map value at a certain path by modifying an external object. This method
     * should not be used anywhere else except internally.
     * @param {JSObject<any>} object The object to modify.
     * @param {string} path The path at which to update value.
     * @param {EKVMapFn} mapFn Mapping function.
     * @returns {Impl} An Impl instance.
     */
    _mappingValue(object: JSObject<any>, path: string, mapFn: EKVMapFn): Impl;

    /**
     * Update value at a certain path by modifying an external object. This
     * method should not be used anywhere else except internally.
     * @param {JSObject<any>} object The object to modify.
     * @param {string} path The path at which to update value.
     * @param {Nullable<any>} value Any value.
     * @returns {Impl} An Impl instance.
     */
    _updatingValue(object: JSObject<any>, path: string, value: Nullable<any>): Impl;
  }
}

Impl.prototype.emptying = function (): Type {
  return empty();
};

Impl.prototype._mappingValue = function (object: JSObject<any>, path: string, mapFn: EKVMapFn): Impl {
  try {
    let subpaths = path.split(this.pathSeparator);
    let objectCopy = object;
    let currentResult = objectCopy;

    for (let i = 0, length = subpaths.length; i < length; i++) {
      let subpath = subpaths[i];
      let interValue = currentResult[subpath];

      if (i === length - 1) {
        currentResult[subpath] = shallowClone(Try.unwrap(mapFn(Try.unwrap(interValue))).value);
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
        interValue = Object.assign({}, interValue);
      }

      currentResult[subpath] = interValue;
      currentResult = interValue;
    }

    return new Impl()
      .copyingPropertiesUnsafely(this)
      .settingObjectUnsafely(objectCopy);
  } catch (e) {
    return this.cloneBuilder().build() as Impl;
  }
};

Impl.prototype.mappingValue = function (path: string, mapFn: EKVMapFn): Type {
  return this._mappingValue(this.shallowClonedObject, path, mapFn);
};

Impl.prototype._updatingValue = function (object: JSObject<any>, path: string, value: Nullable<any>): Impl {
  return this._mappingValue(object, path, () => value);
};

Impl.prototype.updatingValue = function (path: string, value: Nullable<any>): Type {
  return this.mappingValue(path, () => value);
};

Impl.prototype.removingValue = function (path: string): Type {
  return this.updatingValue(path, undefined);
};

Impl.prototype.updatingValues = function (object: JSObject<any>): Type {
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

Impl.prototype.copyingValue = function (src: string, dest: string): Type {
  let sourceValue = this.valueAtNode(src);
  return this.updatingValue(dest, sourceValue.value);
};

Impl.prototype.movingValue = function (src: string, dest: string): Type {
  return this.copyingValue(src, dest).removingValue(src);
};
