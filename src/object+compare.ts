import { Try } from 'javascriptutilities';
import { Impl } from './object';
type CompareFn = (v1: any, v2: any) => boolean;

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
    compareValues(lhs: string, rhs: string, compareFn?: CompareFn): Try<boolean>;
  }

  export interface Impl extends Type { }
}

Impl.prototype.compareValues = function (lhs, rhs, fn) {
  let compareFn = fn || ((v1, v2) => v1 === v2);

  return this.valueAtNode(lhs)
    .zipWith(this.valueAtNode(rhs), (v1, v2) => compareFn(v1, v2));
};