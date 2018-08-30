import {Collections, JSObject, Nullable, Numbers} from 'javascriptutilities';
import {Impl} from 'object';
import {anyNumber, anything, instance, mock, spy, verify} from 'ts-mockito';
import {EKVObject} from './../src';

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
    original._updatingArray({a: {invalid: 1}}, 'a', arrayFn);

    /// Then
    verify(arrayFnContainer.arrayFn(anything(), -1)).once();
    verify(arrayFnContainer.arrayFn(anything(), anyNumber())).once();
  });

  it('Removing array index should work correctly', () => {
    /// Setup
    let path = 'a';
    let buildPaths = (i: number) => `${path}.${i}`;

    let array: Nullable<number>[] = [
      ...Numbers.range(0, 100),
      undefined,
      null,
      ...Numbers.range(0, 100),
      null,
      undefined,
      ...Numbers.range(0, 100),
    ];

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
        let stateValue = state.valueAtNode(buildPaths(j));

        if (stateValue.isSuccess()) {
          expect(stateValue.value).toEqual(v);
        } else {
          expect(v === undefined || v === null).toBeTruthy();
        }
      });

      expect(state.valueAtNode(buildPaths(array.length)).value).toBeUndefined();
    }
  });

  it('Removing index with incomplete array object - should still remove correct index', () => {
    /// Setup
    let state = EKVObject.just({a: {5: 0}});
    let buildPath = (index: number) => `a.${index}`;

    /// When
    state = state.removingArrayIndex('a', 3);
    state = state.removingArrayIndex('a', 6);

    /// Then
    expect(state.valueAtNode(buildPath(3)).isFailure()).toBeTruthy();
    expect(state.valueAtNode(buildPath(4)).value).toBe(0);
    expect(state.valueAtNode(buildPath(6)).isFailure()).toBeTruthy();
  });

  it('Removing last array index - should work correctly', () => {
    /// Setup
    let itemCount = 10;
    let state = EKVObject.just({a: Numbers.range(0, itemCount)});

    /// When
    state = state.removingArrayIndex('a', itemCount - 1);

    /// Then
    expect(Object.keys(state.valueAtNode('a').value as {})).toHaveLength(
      itemCount - 1
    );
  });

  it('Upserting in array - should work correctly', () => {
    /// Setup
    let path = 'a';
    let array = [1, 2, undefined, 6, 7];
    let state = EKVObject.just({[path]: array});

    /// When
    let state1 = state.upsertingInArray(path, 7, (v1, v2) => v1 === v2);
    let state2 = state.upsertingInArray(path, 8);

    /// Then
    let buildPath = (i: number) => `${path}.${i}`;
    expect(Object.keys(state1.valueAtNode(path).value as {})).toHaveLength(
      array.length
    );
    expect(Object.keys(state2.valueAtNode(path).value as {})).toHaveLength(
      array.length + 1
    );
    array.forEach((v, i) =>
      expect(state1.valueAtNode(buildPath(i)).value).toEqual(v)
    );

    array.concat([8]).forEach((v, i) => {
      expect(state2.valueAtNode(buildPath(i)).value).toEqual(v);
    });

    expect(
      state2.valueAtNode(buildPath(array.length + 1)).isFailure()
    ).toBeTruthy();
  });

  it('Upserting in array with invalid comparison - should not update', () => {
    /// Setup
    let path = 'a';
    let array = [1, 2, 5, 6, 7];
    let state = EKVObject.just({[path]: array});

    /// When
    state = state.upsertingInArray(path, undefined, () => {
      throw '';
    });

    /// Then
    let buildPath = (i: number) => `${path}.${i}`;
    expect(Object.keys(state.valueAtNode(path).value as {})).toHaveLength(
      array.length
    );
    array.forEach((v, i) =>
      expect(state.valueAtNode(buildPath(i)).value).toEqual(v)
    );
  });

  it('Upserting in array with invalid array - should create array', () => {
    let path = 'a';
    let invalidArray = 1;
    let state = EKVObject.just({[path]: invalidArray});

    /// When
    state = state.upsertingInArray(path, 10);

    /// Then
    expect(Object.keys(state.valueAtNode(path).value as {})).toHaveLength(1);
    expect(state.valueAtNode(`${path}.0`).value).toEqual(10);
  });

  it('Upserting in array with one existing value - should iterate correctly', () => {
    /// Setup
    let path = 'a';
    let state = EKVObject.just({[path]: [1]});

    /// When
    state = state.upsertingInArray(path, 1);

    /// Then
    expect(state.valueAtNode(`${path}.0`).value).toEqual(1);
    expect(state.valueAtNode(`${path}.1`).value).toBeUndefined();
  });
});
