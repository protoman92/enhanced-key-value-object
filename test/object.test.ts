import * as mockito from 'ts-mockito';
import { EKVObject } from './../src';
// let deepEqual = require('deep-equal');

describe('Enhanced key-value object should be implemented correctly', () => {
  let object = {
    a: { a1_1: { a2_1: 1, a2_2: 2, a3_3: 3 }, a1_2: 1 },
    b: { b1_1: { b2_1: 4, b2_2: 5, b2_3: 6 }, b1_2: 2 },
    c: true,
    d: 'd',
  };

  let ekvObject = EKVObject.empty()
    .cloneBuilder()
    .withObject(object)
    .withPathSeparator('.')
    .withBuildable(undefined as any)
    .build();

  it('Accessing empty path should work correctly', () => {
    /// Setup && When
    let accessedObject = ekvObject.valueAtNode('');

    /// Then
    expect(accessedObject.isFailure()).toBeTruthy();
  });

  it('Accessing path with value should work correctly', () => {
    /// Setup && When
    let value1 = ekvObject.numberAtNode('a.a1_1.a3_3').value;
    let value2 = ekvObject.booleanAtNode('c').value;
    let value3 = ekvObject.stringAtNode('d').value;

    /// Then
    expect(value1).toBe(3);
    expect(value2).toBe(true);
    expect(value3).toBe('d');
  });

  it('Accessing path with thrown error should work correctly', () => {
    /// Setup
    let spiedObject = mockito.spy(ekvObject);
    let actualObject = mockito.instance(spiedObject);
    mockito.when(spiedObject.object).thenReturn(undefined as any);

    /// When
    let accessedObject = actualObject.valueAtNode('d');

    /// Then
    expect(accessedObject.isFailure()).toBeTruthy();
  });
});
