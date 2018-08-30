import {JSObject} from 'javascriptutilities';
import {DeleteKey} from './../src/param';
import * as Util from './../src/util';

describe('Utilities should be implemented correctly', () => {
  it('Shallow-cloning should work correctly', () => {
    /// Setup && When && Then
    let clonedDelete = Util.shallowClone(new DeleteKey());
    expect(clonedDelete).toBeInstanceOf(DeleteKey);

    /// Setup && When && Then
    let clonedUndefined = Util.shallowClone(undefined);
    expect(clonedUndefined).toBeUndefined();

    /// Setup && When && Then
    let object: JSObject<unknown> = {};
    let clonedObject = Util.shallowClone(object);
    object.a = 1;
    expect(clonedObject!.a).toBeFalsy();

    /// Setup && When && Then
    let array = [1, 2, 3];
    let clonedArray = Util.shallowClone(array);
    array[3] = 4;
    expect(clonedArray![3]).toBeFalsy();

    /// Setup && When && Then
    let numberValue = 1;
    let clonedNumber = Util.shallowClone(numberValue);
    expect(clonedNumber).toBe(numberValue);

    /// Setup && When && Then
    let stringValue = '';
    let clonedString = Util.shallowClone(stringValue);
    expect(clonedString).toBe(stringValue);

    /// Setup && When && Then
    let booleanValue = 1;
    let clonedBoolean = Util.shallowClone(booleanValue);
    expect(clonedBoolean).toBe(booleanValue);
  });
});
