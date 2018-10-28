import { Impl } from './object';
import { just } from './object+utility';
type EqualFn = (v1: unknown, v2: unknown) => boolean;

declare module './object' {
  export interface Type {
    /**
     * Check if two objects are equal in values for the specified keys.
     * @param {EKVObjectType} object An EKVObjectType instance.
     * @param {string[]} paths The paths to check for equality.
     * @param {EqualFn} [equalFn] Equality function.
     * @returns {boolean} A boolean value.
     */
    equalsForValues(
      object: EKVObjectType,
      paths: string[],
      equalFn?: EqualFn
    ): boolean;
  }

  export interface Impl extends Type {}
}

Impl.prototype.equalsForValues = function(object, paths, equalFn?) {
  const compareFn =
    equalFn !== undefined && equalFn !== null
      ? equalFn
      : (v1: unknown, v2: unknown) => v1 === v2;

  const rhsObject = just(object);

  for (const path of paths) {
    try {
      const lhsValue = this.valueAtNode(path);
      const rhsValue = rhsObject.valueAtNode(path);

      if (lhsValue.isFailure() && rhsValue.isFailure()) {
        continue;
      } else if (
        !lhsValue
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
