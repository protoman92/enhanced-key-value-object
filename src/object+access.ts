import { Try } from 'javascriptutilities';
import { Impl } from './object';

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
  }

  export interface Impl extends Type { }
}

Impl.prototype.valueAtNode = function (path: string): Try<any> {
  let subpaths = path.split(this._pathSeparator);
  let currentResult = this.actualObject;

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
