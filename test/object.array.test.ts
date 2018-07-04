import { EKVObject } from './../src';
import { Nullable, Numbers, Collections, JSObject } from 'javascriptutilities';
import { Impl } from 'object';
import { spy, mock, instance, verify, anything, anyNumber } from 'ts-mockito';

describe('Array operations should be implemented correctly', () => {
  it('Updating array with empty or invalid keys - should work correctly', () => {
    /// Setup
    let original = EKVObject.empty() as Impl;

    let arrayFnContainer = spy({
      arrayFn: (_v: JSObject<any>, _lastIndex: number): Impl => mock(Impl),
    });

    let arrayFn = instance(arrayFnContainer).arrayFn;

    /// When
    original._updatingArray({}, 'a', arrayFn);
    original._updatingArray({ a: { 'invalid': 1 } }, 'a', arrayFn);

    /// Then
    verify(arrayFnContainer.arrayFn(anything(), -1)).once();
    verify(arrayFnContainer.arrayFn(anything(), anyNumber())).once();
  });

  it('Removing array index should work correctly', () => {
    /// Setup
    let array: Nullable<number>[] = [
      ...Numbers.range(0, 100),
      undefined, null,
      ...Numbers.range(0, 100),
      null, undefined,
      ...Numbers.range(0, 100),
    ];

    let path = 'a';
    let state = EKVObject.empty();
    state = state.updatingValue(path, array);

    /// When
    for (let i = 0; i < 100; i++) {
      let indexArray = Numbers.range(0, array.length - 1);
      let removedIndex = Collections.randomElement(indexArray).value!;
      array.splice(removedIndex, 1);
      state = state.removingArrayIndex(path, removedIndex);

      /// Then
      array.forEach((v, j) => {
        let stateValue = state.valueAtNode(`${path}.${j}`);

        if (stateValue.isSuccess()) {
          expect(stateValue.value).toEqual(v);
        } else {
          expect(v === undefined || v === null).toBeTruthy();
        }
      });
    }
  });

  it('Removing index with incomplete array object - should still remove correct index', () => {
    /// Setup
    let state = EKVObject.just({ a: { 5: 0 } });
    let buildPath = (index: number) => `a.${index}`;

    /// When
    state = state.removingArrayIndex('a', 3);
    state = state.removingArrayIndex('a', 6);

    /// Then
    expect(state.valueAtNode(buildPath(3)).isFailure()).toBeTruthy();
    expect(state.valueAtNode(buildPath(4)).value).toBe(0);
    expect(state.valueAtNode(buildPath(6)).isFailure()).toBeTruthy();
  });
});
