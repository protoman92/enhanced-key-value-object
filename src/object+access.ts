import { JSObject, Objects, Try } from 'javascriptutilities';
import { Impl } from './object';
import { just } from './object+utility';

declare module './object' {
  export interface Type {
    /**
     * Access the value at a path.
     * @param {string} path The path at which to access the value.
     * @returns {Try<unknown>} A Try instance.
     */
    valueAtNode(path: string): Try<unknown>;

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
     * Access a possible Object at a path.
     * @param {string} path The path at which to access the value.
     * @returns {Try<{}>} A Try instance.
     */
    objectAtNode(path: string): Try<{}>;

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
     * @returns {JSObject<unknown>} A JSObject instance.
     */
    valuesWithFullPaths(separator?: string): JSObject<unknown>;
  }

  export interface Impl extends Type {
    /**
     * Access the value at a path for an external object.
     * @param {JSObject<unknown>} object The object to access values from.
     * @param {string} path The path at which to access the value.
     * @returns {Try<unknown>} A Try instance.
     */
    _valueAtNode(object: JSObject<unknown>, path: string): Try<unknown>;
  }
}

Impl.prototype._valueAtNode = function(object, path) {
  const _accessValue = () => {
    const subpaths = path.split(this.pathSeparator);
    let currentResult: any = object;

    for (const subpath of subpaths) {
      try {
        const intermediateResult = currentResult[subpath];

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

  const result = _accessValue();

  if (this.accessErrorMapper) {
    const accessErrorMapper = this.accessErrorMapper;
    return result.mapError(e => accessErrorMapper(e));
  }

  return result;
};

Impl.prototype.valueAtNode = function(path) {
  return this._valueAtNode(this.actualObject, path);
};

Impl.prototype.booleanAtNode = function(path) {
  return this.valueAtNode(path).booleanOrFail(
    () => `No boolean found at ${path}`
  );
};

Impl.prototype.numberAtNode = function(path: string) {
  return this.valueAtNode(path).numberOrFail(
    () => `No number found at ${path}`
  );
};

Impl.prototype.stringAtNode = function(path: string) {
  return this.valueAtNode(path).stringOrFail(
    () => `No string found at ${path}`
  );
};

Impl.prototype.objectAtNode = function(path: string) {
  return this.valueAtNode(path).objectOrFail(
    () => `No object found at ${path}`
  );
};

Impl.prototype.valuesWithFullPaths = function(separator?) {
  const result: JSObject<unknown> = {};
  const sep = separator || this.pathSeparator;

  Objects.entries(this.actualObject).forEach(([key, value]) => {
    if (
      typeof value === 'boolean' ||
      typeof value === 'number' ||
      typeof value === 'string'
    ) {
      result[key] = value;
    } else if (value instanceof Object) {
      const subObjects = just(value).valuesWithFullPaths(sep);

      Objects.entries(subObjects).map(([subKey, subValue]) => {
        result[`${key}${sep}${subKey}`] = subValue;
      });
    }
  });

  return result;
};
