import { Impl } from './object';

declare module './object' {
  export interface Type {
    /**
     * Clone an object for the specified paths.
     * @param {string[]} paths The paths to check for equality.
     * @returns {Type} A Type instance.
     */
    cloningForPaths(...paths: string[]): Type;
  }

  export interface Impl extends Type {}
}

Impl.prototype.cloningForPaths = function(...paths) {
  let result = new Impl();
  const resultObject = {};

  paths.forEach(v =>
    this.valueAtNode(v).doOnNext(
      v1 => (result = result._updatingValue(resultObject, v, v1))
    )
  );

  return result;
};
