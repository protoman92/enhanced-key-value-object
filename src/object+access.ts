import { JSObject, Objects, Try } from 'javascriptutilities';
import { Impl } from './object';
import { just } from './object+utility';

declare module './object' {
  export interface Type {
    /**
     * Access the value at a path.
     * @param {string} path The path at which to access the value.
     * @returns {Try<any>} A Try instance.
     */
    valueAtNode(path: string): Try<any>;

    /**
     * Access a possible boolean value at a path.
     * @param {string} path The path at which to access the value.
     * @returns {Try<boolean>} A Try instance.
     */
    booleanAtNode(path: string): Try<boolean>;

    /**
     * Access a possible number value at a path.
     * @param {string} path The path at which to access the value.
     * @returns {Try<number>} A Try instance.
     */
    numberAtNode(path: string): Try<number>;

    /**
     * Access a possible string value at a path.
     * @param {string} path The path at which to access the value.
     * @returns {Try<string>} A Try instance.
     */
    stringAtNode(path: string): Try<string>;

    /**
     * Access all values along with the full joined access paths.
     * @param {string} [separator] Optional separator, defaults to the inner
     * path separator.
     * @returns {JSObject<any>} A JSObject instance.
     */
    valuesWithFullPaths(separator?: string): JSObject<any>;
  }

  export interface Impl extends Type {
    /**
     * Access the value at a path for an external object.
     * @param {JSObject<any>} object The object to access values from.
     * @param {string} path The path at which to access the value.
     * @returns {Try<any>} A Try instance.
     */
    _valueAtNode(object: JSObject<any>, path: string): Try<any>;
  }
}

Impl.prototype._valueAtNode = function (object: JSObject<any>, path: string): Try<any> {
  let subpaths = path.split(this.pathSeparator);
  let currentResult = object;

  for (let subpath of subpaths) {
    try {
      let intermediateResult = currentResult[subpath];

      if (intermediateResult !== undefined && intermediateResult !== null) {
        currentResult = intermediateResult;
      } else {
        return Try.failure(`No value found at ${path}`);
      }
    } catch (e) {
      return Try.failure(e);
    }
  }

  return Try.success(currentResult);
};

Impl.prototype.valueAtNode = function (path: string): Try<any> {
  return this._valueAtNode(this.actualObject, path);
};

Impl.prototype.booleanAtNode = function (path: string): Try<boolean> {
  return this.valueAtNode(path)
    .filter(v => typeof v === 'boolean', `No boolean found at ${path}`);
};

Impl.prototype.numberAtNode = function (path: string): Try<number> {
  return this.valueAtNode(path)
    .filter(v => typeof v === 'number', `No number found at ${path}`);
};

Impl.prototype.stringAtNode = function (path: string): Try<string> {
  return this.valueAtNode(path)
    .filter(v => typeof v === 'string', `No string found at ${path}`);
};

Impl.prototype.valuesWithFullPaths = function (separator?: string): JSObject<any> {
  let result: JSObject<any> = {};
  let sep = separator || this.pathSeparator;

  Objects.entries(this.actualObject).forEach(([key, value]) => {
    if (
      typeof value === 'boolean' ||
      typeof value === 'number' ||
      typeof value === 'string'
    ) {
      result[key] = value;
    } else {
      let subObjects = just(value).valuesWithFullPaths(sep);

      Objects.entries(subObjects).map(([subKey, subValue]) => {
        result[`${key}${sep}${subKey}`] = subValue;
      });
    }
  });

  return result;
};
