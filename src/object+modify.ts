import { JSObject, Nullable, Try } from 'javascriptutilities';
import { Impl, Type } from './object';
import { empty } from './object+utility';

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
     * @param {(value: Try<any>) => Try<any>} mapFn Mapping function.
     * @returns {Type} A Type instance.
     */
    mappingValue(path: string, mapFn: (value: Try<any>) => Try<any>): Type;

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

  export interface Impl extends Type { }
}

Impl.prototype.emptying = function (): Type {
  return empty();
};

Impl.prototype.mappingValue = function (path: string, mapFn: (value: Try<any>) => Try<any>): Type {
  try {
    let subpaths = path.split(this._pathSeparator);
    let objectCopy = this.clonedObject;
    let currentResult = objectCopy;

    for (let i = 0, length = subpaths.length; i < length; i++) {
      let subpath = subpaths[i];
      let intermediateValue = currentResult[subpath];

      if (i === length - 1) {
        currentResult[subpath] = mapFn(Try.unwrap(intermediateValue)).value;
        break;
      }

      if (
        intermediateValue === undefined ||
        intermediateValue === null ||
        !Object.isExtensible(intermediateValue) ||
        intermediateValue instanceof Array
      ) {
        intermediateValue = {};
        currentResult[subpath] = intermediateValue;
      }

      currentResult = intermediateValue;
    }

    return this.cloneBuilder().withObject(objectCopy).build();
  } catch (e) {
    return this.cloneBuilder().build();
  }
};

Impl.prototype.updatingValue = function (path: string, value: Nullable<any>): Type {
  return this.mappingValue(path, () => Try.unwrap(value));
};

Impl.prototype.removingValue = function (path: string): Type {
  return this.updatingValue(path, undefined);
};

Impl.prototype.updatingValues = function (object: JSObject<any>): Type {
  try {
    let currentObject = this.clonedObject;
    let deepCloned = JSON.parse(JSON.stringify(object));
    let newObject = Object.assign(currentObject, deepCloned);
    return this.cloneBuilder().withObject(newObject).build();
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
