import { Collections, Numbers, Nullable } from 'javascriptutilities';
import * as mockito from 'ts-mockito';
import { EKVObject } from './../src';
import { Impl, objectKey, pathSeparatorKey } from './../src/object';
let deepEqual = require('deep-equal');

describe('Enhanced key-value object should be implemented correctly', () => {
  let object = {
    a: { a1_1: { a2_1: 1, a2_2: 2, a2_3: 3, a2_4: [] }, a1_2: 1 },
    b: { b1_1: { b2_1: 4, b2_2: 5, b2_3: 6 }, b1_2: 2 },
    c: true,
    d: 'd',
  };

  let ekvObject: Impl;

  beforeEach(() => {
    ekvObject = EKVObject.empty()
      .cloneBuilder()
      .withObject(object)
      .withObject(undefined as any)
      .withPathSeparator('.')
      .withPathSeparator(undefined as any)
      .withBuildable(undefined as any)
      .build() as Impl;
  });

  it('Accessing empty path should work correctly', () => {
    /// Setup && When
    let accessedObject = ekvObject.valueAtNode('');

    /// Then
    expect(accessedObject.isFailure()).toBeTruthy();
  });

  it('Accessing path with value should work correctly', () => {
    /// Setup && When
    let value1 = ekvObject.numberAtNode('a.a1_1.a2_3').value;
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
    mockito.when(spiedObject.actualObject).thenReturn(undefined as any);

    /// When
    let accessedObject = actualObject.valueAtNode('d');

    /// Then
    expect(accessedObject.isFailure()).toBeTruthy();
  });

  it('Emptying object should work correctly', () => {
    /// Setup && When
    let emptied = ekvObject.emptying();

    /// When
    expect(emptied.deepClonedObject).toEqual({});
    expect(ekvObject.deepClonedObject).toEqual(object);
  });

  it('Updating value path should work correctly', () => {
    /// Setup
    let path1 = 'a.b.c.d.e';
    let path2 = 'a.a1_1.a2_4.a3_1.non_exitent.';

    /// When
    let ekvObject1 = ekvObject.updatingValue(path1, 1);
    let ekvObject2 = ekvObject.mappingValue(path2, () => [1, 2, 3]);
    let ekvObject3 = ekvObject.removingValue('a.a1_1.a2_1');

    /// Then
    expect(ekvObject.deepClonedObject).toEqual(object);
    expect(ekvObject1.valueAtNode(path1).value).toBe(1);
    expect(ekvObject2.valueAtNode(path2).value).toEqual([1, 2, 3]);
    expect(ekvObject3.valueAtNode('a.a1_1.a2_1').isFailure()).toBeTruthy();
  });

  it('Updating value path with thrown error should work correctly', () => {
    /// Setup
    let spiedObject = mockito.spy(ekvObject);
    let actualObject = mockito.instance(spiedObject);
    mockito.when(spiedObject.shallowClonedObject).thenReturn(undefined as any);

    /// When
    let ekvObject2 = actualObject.updatingValue('a.b.c.d.e.f', undefined);

    /// Then
    expect(ekvObject2).toBeTruthy();
  });

  it('Updating with external object should work', () => {
    /// Setup
    let otherObject = { e: { f: { g: 1 } } };

    /// When
    let updatedObject = ekvObject.updatingValues(otherObject);

    /// Then
    expect(updatedObject.valueAtNode('e.f.g').value).toBe(1);
  });

  it('Updating with external object and thrown error should work', () => {
    /// Setup
    let spiedObject = mockito.spy(ekvObject);
    let actualObject = mockito.instance(spiedObject);
    let otherObject = undefined;
    mockito.when(spiedObject.deepClonedObject).thenThrow(new Error(''));
    mockito.when(spiedObject.cloneBuilder()).thenReturn(EKVObject.builder());

    // When
    let updatedObject = actualObject.updatingValues(otherObject);

    /// Then
    expect(updatedObject).toBeTruthy();
  });

  it('Checking object equality for keys should work', () => {
    /// Setup
    let paths = ['a.a1_1.a2_1', 'a.a1_2', 'c', 'd.1.2.3', 'non_existent'];
    let ekvObject1 = {};

    /// When && Then
    expect(ekvObject.equalsForValues(ekvObject, paths)).toBeTruthy();
    expect(ekvObject.equalsForValues(ekvObject, paths, deepEqual)).toBeTruthy();
    expect(ekvObject.equalsForValues(ekvObject, paths, () => { throw ''; })).toBeFalsy();
    expect(ekvObject.equalsForValues(ekvObject1, paths, deepEqual)).toBeFalsy();
  });

  it('Checking equality with thrown error should work correctly', () => {
    /// Setup
    let paths = ['non_existent'];
    let spiedObject = mockito.spy(ekvObject);
    let actualObject = mockito.instance(spiedObject);
    mockito.when(spiedObject.valueAtNode(mockito.anyString())).thenThrow(new Error(''));

    /// When && Then
    expect(actualObject.equalsForValues(ekvObject, paths)).toBeFalsy();
  });

  it('Cloning for paths should work', () => {
    /// Setup
    let paths = ['a.a1_1.a2_1', 'd'];

    /// When
    let cloned = ekvObject.cloningForPaths(...paths);

    /// Then
    paths.forEach(v => expect(cloned.valueAtNode(v).value)
      .toEqual(ekvObject.valueAtNode(v).value));

    expect(cloned.valueAtNode('c').isFailure()).toBeTruthy();
  });

  it('Copying and moving values should work correctly', () => {
    /// Setup
    let sourcePath = 'a.a1_1.a2_1';
    let destPath = 'non_existent.non_existent_1';
    ekvObject = ekvObject.updatingValue(sourcePath, 1) as Impl;

    /// When
    let ekvObject1 = ekvObject.copyingValue(sourcePath, destPath);
    let ekvObject2 = ekvObject.movingValue(sourcePath, destPath);

    /// Then
    expect(ekvObject1.valueAtNode(sourcePath).value).toBe(1);
    expect(ekvObject1.valueAtNode(destPath).value).toBe(1);
    expect(ekvObject2.valueAtNode(sourcePath).isFailure()).toBeTruthy();
    expect(ekvObject2.valueAtNode(destPath).value).toBe(1);
  });
});

describe('Utilities should be implemented correctly', () => {
  it('Constructing object with just should work correctly', () => {
    /// Setup
    let innerObject = { a: 1, b: 2, c: 3 };
    let possibleObject1 = { [objectKey]: undefined };
    let possibleObject2 = { [objectKey]: innerObject, [pathSeparatorKey]: 1 };
    let possibleObject3 = { [objectKey]: innerObject, [pathSeparatorKey]: '/' };

    /// When && Then
    expect(EKVObject.just(possibleObject1).valueAtNode('a').isFailure()).toBeTruthy();
    expect(EKVObject.just(possibleObject2).valueAtNode('a').isFailure()).toBeTruthy();
    expect(EKVObject.just(possibleObject3).valueAtNode('a').value).toBe(innerObject.a);
    expect(EKVObject.just(undefined).deepClonedObject).toEqual({});
  });
});

describe('Complex operations should be implemented correctly', () => {
  it('Accessing values with full paths should work correctly', () => {
    /// Setup
    let object = { a: [{ a: 1 }, { b: 2 }], b: { c: 1, d: 2 }, c: 1, d: 2 };
    let ekvObject = EKVObject.just(object);

    /// When
    let valuesWithFullPaths = ekvObject.valuesWithFullPaths();

    /// Then
    expect(valuesWithFullPaths).toEqual({
      'a.0.a': 1,
      'a.1.b': 2,
      'b.c': 1,
      'b.d': 2,
      c: 1, d: 2,
    });
  });

  it('Updating array with undefined/null values at specified path should work', () => {
    /// Setup
    let path = 'a.b.c';
    let state = new Impl();

    /// When
    state = state._updatingArray({}, path, v => v.concat(1, 2, 3));

    /// Then
    expect(state.valueAtNode(path).value).toEqual([1, 2, 3]);
  })

  it('Removing array index should work correctly', () => {
    /// Setup
    let array: Nullable<number>[] = [
      ...Numbers.range(0, 100),
      undefined, null,
      ...Numbers.range(0, 100),
      null, undefined,
      ...Numbers.range(0, 100),
    ];

    let path = 'a.b.c';
    let state = EKVObject.empty();
    state = state.updatingValue(path, array);

    /// When
    for (let i = 0; i < 100; i++) {
      let indexArray = Numbers.range(0, array.length - i);
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

  it('Inserting array value should work correctly', () => {
    /// Setup
    let state = EKVObject.just({ a: [1, 2, 3] });

    /// When
    state = state.insertingArrayValue('a', 1, 0);

    /// Then
    expect(state.valueAtNode('a').value).toEqual([1, 0, 2, 3]);
  });
});
