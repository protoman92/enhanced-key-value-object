import {EKVObject} from 'index';

describe('Complex operations should be implemented correctly', () => {
  it('Accessing values with full paths should work correctly', () => {
    /// Setup
    const object = {a: [{a: 1}, {b: 2}], b: {c: 1, d: 2}, c: 1, d: 2};
    const ekvObject = EKVObject.just(object);

    /// When
    const valuesWithFullPaths = ekvObject.valuesWithFullPaths();

    /// Then
    expect(valuesWithFullPaths).toEqual({
      'a.0.a': 1,
      'a.1.b': 2,
      'b.c': 1,
      'b.d': 2,
      c: 1,
      d: 2,
    });
  });

  it('Swapping values should work correctly', () => {
    /// Setup
    let state = EKVObject.just({a: {b: 1}, b: {a: 2}});

    /// When
    state = state.swappingValue('a.b', 'b.a');

    /// Then
    expect(state.deepClonedObject).toEqual({a: {b: 2}, b: {a: 1}});
  });
});
