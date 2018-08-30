import {EKVObject} from './../src';
let deepEqual = require('deep-equal');

describe('Compare operations should be implemented correctly', () => {
  it('Comparing values at 2 paths should work correctly', () => {
    /// Setup
    let ekvObject = EKVObject.just({a: 1, b: 2, c: 1});

    /// When && Then
    expect(ekvObject.compareValues('a', 'b').value).toBeFalsy();
    expect(ekvObject.compareValues('a', 'c', deepEqual).value).toBeTruthy();
    expect(
      ekvObject.compareValues('a', 'b', (v1, v2) => {
        return (v1 as any) < (v2 as any);
      }).value
    ).toBeTruthy();
    expect(
      ekvObject.compareValues('b', 'c', (v1, v2) => {
        return (v1 as any) > (v2 as any);
      }).value
    ).toBeTruthy();
    expect(ekvObject.compareValues('a', 'd').isFailure()).toBeTruthy();
  });
});
