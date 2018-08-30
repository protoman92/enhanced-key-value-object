import {Try, JSObject} from 'javascriptutilities';
import {Impl} from './object';
type CompareFn = (v1: unknown, v2: unknown) => boolean;

declare module './object' {
  export interface Type {
    /**
     * Compare values found at two paths with a comparison function.
     * @param {string} lhs Path at which the lhs value is found.
     * @param {string} rhs Path at which the rhs value is found.
     * @param {CompareFn} [compareFn] Comparison function
     * which defaults to equality if not specified.
     * @returns {Try<boolean>} A Try instance.
     */
    compareValues(
      lhs: string,
      rhs: string,
      compareFn?: CompareFn
    ): Try<boolean>;
  }

  export interface Impl extends Type {
    /**
     * Compare values found at two paths of an external object with a comparison
     * function.
     * @param {JSObject<unknown>} object External object.
     * @param {string} lhs Path at which the lhs value is found.
     * @param {string} rhs Path at which the rhs value is found.
     * @param {CompareFn} [compareFn] Comparison function
     * which defaults to equality if not specified.
     * @returns {Try<boolean>} A Try instance.
     */
    _compareValues(
      object: JSObject<unknown>,
      lhs: string,
      rhs: string,
      compareFn?: CompareFn
    ): Try<boolean>;
  }
}

Impl.prototype._compareValues = function(object, lhs, rhs, fn) {
  let compareFn = fn || ((v1, v2) => v1 === v2);

  return this._valueAtNode(object, lhs).zipWith(
    this._valueAtNode(object, rhs),
    (v1, v2) => compareFn(v1, v2)
  );
};

Impl.prototype.compareValues = function(lhs, rhs, fn) {
  return this._compareValues(this.actualObject, lhs, rhs, fn);
};
