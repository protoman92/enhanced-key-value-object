import { JSObject } from 'javascriptutilities';
import { DeleteKey } from './../src/param';
import * as Util from './../src/util';

describe('Utilities should be implemented correctly', () => {
  it('Shallow-cloning should work correctly', () => {
    /// Setup && When && Then
    const clonedDelete = Util.shallowClone(new DeleteKey());
    expect(clonedDelete).toBeInstanceOf(DeleteKey);

    /// Setup && When && Then
    const clonedUndefined = Util.shallowClone(undefined);
    expect(clonedUndefined).toBeUndefined();

    /// Setup && When && Then
    const object: JSObject<unknown> = {};
    const clonedObject = Util.shallowClone(object);
    object.a = 1;
    expect(clonedObject!.a).toBeFalsy();

    /// Setup && When && Then
    const array = [1, 2, 3];
    const clonedArray = Util.shallowClone(array);
    array[3] = 4;
    expect(clonedArray![3]).toBeFalsy();

    /// Setup && When && Then
    const numberValue = 1;
    const clonedNumber = Util.shallowClone(numberValue);
    expect(clonedNumber).toBe(numberValue);

    /// Setup && When && Then
    const stringValue = '';
    const clonedString = Util.shallowClone(stringValue);
    expect(clonedString).toBe(stringValue);

    /// Setup && When && Then
    const booleanValue = 1;
    const clonedBoolean = Util.shallowClone(booleanValue);
    expect(clonedBoolean).toBe(booleanValue);
  });

  it('Shallow cloning complex objects - should prevent cloning', () => {
    /// Setup && When &&  Then
    expect(Util.shallowClone(new File([], ''))).toBeInstanceOf(File);
    expect(Util.shallowClone(new FileReader())).toBeInstanceOf(FileReader);
    expect(Util.shallowClone(new Error())).toBeInstanceOf(Error);
    expect(Util.shallowClone({ a: 1 })).toHaveProperty('a', 1);
  });
});
