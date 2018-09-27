import {EKVObject} from 'index';
import {getAccessModeOrFallback} from 'object+utility';
import {objectKey, pathSeparatorKey} from 'object';

describe('Utilities should be implemented correctly', () => {
  it('Getting access mode or default to fall back should work', () => {
    /// Setup
    EKVObject.setDefaultAccessMode('safe');

    /// When && Then
    expect(getAccessModeOrFallback('unsafe')).toEqual('unsafe');
    expect(getAccessModeOrFallback()).toEqual('safe');
  });

  it('Constructing object with just should work correctly', () => {
    /// Setup
    let innerObject = {a: 1, b: 2, c: 3};
    let possibleObject1 = {[objectKey]: undefined};
    let possibleObject2 = {[objectKey]: innerObject, [pathSeparatorKey]: 1};
    let possibleObject3 = {[objectKey]: innerObject, [pathSeparatorKey]: '/'};

    /// When && Then
    expect(
      EKVObject.just(possibleObject1)
        .valueAtNode('a')
        .isFailure()
    ).toBeTruthy();
    expect(
      EKVObject.just(possibleObject2)
        .valueAtNode('a')
        .isFailure()
    ).toBeTruthy();
    expect(EKVObject.just(possibleObject3).valueAtNode('a').value).toBe(
      innerObject.a
    );
    expect(EKVObject.just(undefined).deepClonedObject).toEqual({});

    let unsafeClone = EKVObject.just(possibleObject3, 'unsafe');
    (possibleObject3[objectKey] as any).a = 2;
    expect(unsafeClone.valueAtNode('a').value).toEqual(2);
  });

  it('Deep cloning inner object should replace undefined with null', () => {
    /// Setup
    let ekvObject = EKVObject.just({a: {b: undefined}, b: null}, 'unsafe');

    /// When
    let deepCloned = ekvObject.deepClonedObject;

    /// Then
    expect((deepCloned as any).a.b).toBeNull();
    expect(deepCloned.b).toBeNull();
  });
});
