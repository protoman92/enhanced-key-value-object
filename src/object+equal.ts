import { Impl } from './object';
import { just } from './object+utility';

declare module './object' {
  export interface Type {
    /**
     * Check if two objects are equal in values for the specified keys.
     * @param {EKVObjectType} object An EKVObjectType instance.
     * @param {string[]} paths The paths to check for equality.
     * @param {(v1: any, v2: any) => boolean} [equalFn] Equality function.
     * @returns {boolean} A boolean value.
     */
    equalsForValues(
      object: EKVObjectType,
      paths: string[],
      equalFn?: (v1: any, v2: any) => boolean,
    ): boolean;
  }

  export interface Impl extends Type { }
}

Impl.prototype.equalsForValues = function (object, paths, equalFn?) {
  let compareFn = equalFn !== undefined && equalFn !== null ? equalFn
    : (v1: any, v2: any) => v1 === v2;

  let rhsObject = just(object);

  for (let path of paths) {
    try {
      let lhsValue = this.valueAtNode(path);
      let rhsValue = rhsObject.valueAtNode(path);

      if (lhsValue.isFailure() && rhsValue.isFailure()) {
        continue;
      } else if (!lhsValue
        .zipWith(rhsValue, (v1, v2) => compareFn(v1, v2))
        .getOrElse(false)
      ) {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  return true;
};
