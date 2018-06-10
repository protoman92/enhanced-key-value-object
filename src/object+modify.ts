import { JSObject, Nullable } from 'javascriptutilities';
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
     * Update value at a certain path.
     * @param {string} path The path at which to update value.
     * @param {Nullable<any>} value Any value.
     * @returns {Type} A Type instance.
     */
    updatingValueAtNode(path: string, value: Nullable<any>): Type;

    /**
     * Remove value at a certain path.
     * @param {string} path The path at which to remove value.
     * @returns {Type} A Type instance.
     */
    removingValueAtNode(path: string): Type;

    /**
     * Update values from some object.
     * @param {Nullable<JSObject<any>>} object A JSObject instance.
     * @returns {Type} A Type instance.
     */
    updatingValues(object: Nullable<JSObject<any>>): Type;
  }

  export interface Impl extends Type { }
}

Impl.prototype.emptying = function (): Type {
  return empty();
};

Impl.prototype.updatingValueAtNode = function (path: string, value: Nullable<any>): Type {
  let subpaths = path.split(this._pathSeparator);
  let objectCopy = this.object;
  let currentResult = objectCopy;

  for (let i = 0, length = subpaths.length; i < length; i++) {
    try {
      let subpath = subpaths[i];

      if (i === length - 1) {
        currentResult[subpath] = value;
        break;
      }

      let intermediateValue = currentResult[subpath];

      if (
        intermediateValue === undefined ||
        intermediateValue === null ||
        !Object.isExtensible(intermediateValue) ||
        intermediateValue instanceof Array
      ) {
        intermediateValue = {};
        currentResult[subpath] = intermediateValue;
      }

      currentResult[subpath] = intermediateValue;
      currentResult = intermediateValue;
    } catch (e) {
      return this.cloneBuilder().build();
    }
  }

  return this.cloneBuilder().withObject(objectCopy).build();
};

Impl.prototype.removingValueAtNode = function (path: string): Type {
  return this.updatingValueAtNode(path, undefined);
};

Impl.prototype.updatingValues = function (object: JSObject<any>): Type {
  try {
    let currentObject = this.object;
    let newObject = Object.assign(currentObject, object);
    return this.cloneBuilder().withObject(newObject).build();
  } catch (e) {
    return this;
  }
};
