import * as mockito from 'ts-mockito';
import { EKVObject } from '../src';
import { Impl } from './../src/object';
const deepEqual = require('deep-equal');

describe('Basic operations should work correctly', () => {
  const object = {
    a: { a1_1: { a2_1: 1, a2_2: 2, a2_3: 3, a2_4: [] }, a1_2: 1 },
    b: { b1_1: { b2_1: 4, b2_2: 5, b2_3: 6 }, b1_2: 2 },
    c: true,
    d: 'd'
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
    const accessedObject = ekvObject.valueAtNode('');

    /// Then
    expect(accessedObject.isFailure()).toBeTruthy();
  });

  it('Accessing path with value should work correctly', () => {
    /// Setup && When && Then
    expect(ekvObject.numberAtNode('a.a1_1.a2_3').value).toBe(3);
    expect(ekvObject.booleanAtNode('a.a1_1.a2_3').value).toBeUndefined();
    expect(ekvObject.stringAtNode('a.a1_1.a2_3').value).toBeUndefined();
    expect(ekvObject.objectAtNode('c').value).toBeUndefined();
    expect(ekvObject.booleanAtNode('c').value).toBe(true);
    expect(ekvObject.numberAtNode('c').value).toBeUndefined();
    expect(ekvObject.stringAtNode('d').value).toBe('d');
    expect(ekvObject.objectAtNode('a').value).toBeDefined();
  });

  it('Accessing invalid path with error mapper - should map error', () => {
    /// Setup
    class ErrorSubclass implements Error {
      public constructor(private readonly e: Error) {}

      public get name() {
        return this.e.name;
      }

      public get message() {
        return this.e.message;
      }
    }

    EKVObject.setDefaultAccessErrorConstructor(ErrorSubclass);
    const ekvObject = EKVObject.just({});

    /// When
    const error1 = ekvObject.valueAtNode('a.b.c').error;

    /// Then
    expect(error1).toBeInstanceOf(ErrorSubclass);
  });

  it('Accessing path with thrown error should work correctly', () => {
    /// Setup
    const spiedObject = mockito.spy(ekvObject);
    const actualObject = mockito.instance(spiedObject);
    mockito.when(spiedObject.actualObject).thenReturn(undefined as any);

    /// When
    const accessedObject = actualObject.valueAtNode('d');

    /// Then
    expect(accessedObject.isFailure()).toBeTruthy();
  });

  it('Modifying object - should keep custom properties via clone', () => {
    const ekvObject = EKVObject.builder()
      .withPathSeparator('/')
      .withAccessErrorMapper(e => e)
      .build();

    /// When
    let nextObject = ekvObject.updatingValue('1.2.3', [1, 2, 3]);
    nextObject = ekvObject.removingArrayIndex('1.2.3', 1);
    nextObject = ekvObject.upsertingInArray('1.2.3', 10);
    nextObject = ekvObject.copyingValue('1.2.3', '4.5.6');
    nextObject = ekvObject.movingValue('4.5.6', '7.8.9');
    nextObject = ekvObject.swappingValue('7.8.9', '4.5.6');
    nextObject = ekvObject.removingValue('4.5.6');
    nextObject = ekvObject.emptying();
    nextObject = ekvObject.updatingValuesWithFullPaths({ abc: 123 });

    /// Then
    expect(nextObject.pathSeparator).toEqual(ekvObject.pathSeparator);
    expect(nextObject.accessErrorMapper).toBeDefined();
  });

  it('Emptying object should work correctly', () => {
    /// Setup && When
    const emptied = ekvObject.emptying();

    /// When
    expect(emptied.deepClonedObject).toEqual({});
    expect(ekvObject.deepClonedObject).toEqual(object);
  });

  it('Updating value path should work correctly', () => {
    /// Setup
    const path1 = 'a.b.c.d.e';
    const path2 = 'a.a1_1.a2_4.a3_1.non_exitent.';

    /// When
    const ekvObject1 = ekvObject.updatingValue(path1, 1);
    const ekvObject2 = ekvObject.mappingValue(path2, () => [1, 2, 3]);
    const ekvObject3 = ekvObject.removingValue('a.a1_1.a2_1');

    /// Then
    expect(ekvObject.deepClonedObject).toEqual(object);
    expect(ekvObject1.valueAtNode(path1).value).toBe(1);
    expect(ekvObject2.valueAtNode(path2).value).toEqual([1, 2, 3]);
    expect(ekvObject3.valueAtNode('a.a1_1.a2_1').isFailure()).toBeTruthy();
  });

  it('Updating value path with thrown error should work correctly', () => {
    /// Setup
    const spiedObject = mockito.spy(ekvObject);
    const actualObject = mockito.instance(spiedObject);
    mockito.when(spiedObject.shallowClonedObject).thenReturn(undefined as any);

    /// When
    const ekvObject2 = actualObject.updatingValue('a.b.c.d.e.f', undefined);

    /// Then
    expect(ekvObject2).toBeTruthy();
  });

  it('Updating with external object should work', () => {
    /// Setup
    const otherObject = { e: { f: { g: 1 } } };

    /// When
    const updatedObject = ekvObject.updatingValues(otherObject);

    /// Then
    expect(updatedObject.valueAtNode('e.f.g').value).toBe(1);
  });

  it('Updating with external object and thrown error should work', () => {
    /// Setup
    const spiedObject = mockito.spy(ekvObject);
    const actualObject = mockito.instance(spiedObject);
    const otherObject = undefined;
    mockito.when(spiedObject.deepClonedObject).thenThrow(new Error(''));
    mockito.when(spiedObject.cloneBuilder()).thenReturn(EKVObject.builder());

    // When
    const updatedObject = actualObject.updatingValues(otherObject);

    /// Then
    expect(updatedObject).toBeTruthy();
  });

  it('Checking object equality for keys should work', () => {
    /// Setup
    const paths = ['a.a1_1.a2_1', 'a.a1_2', 'c', 'd.1.2.3', 'non_existent'];
    const ekvObject1 = {};

    /// When && Then
    expect(ekvObject.equalsForValues(ekvObject, paths)).toBeTruthy();
    expect(ekvObject.equalsForValues(ekvObject, paths, deepEqual)).toBeTruthy();
    expect(
      ekvObject.equalsForValues(ekvObject, paths, () => {
        throw '';
      })
    ).toBeFalsy();
    expect(ekvObject.equalsForValues(ekvObject1, paths, deepEqual)).toBeFalsy();
  });

  it('Checking equality with thrown error should work correctly', () => {
    /// Setup
    const paths = ['non_existent'];
    const spiedObject = mockito.spy(ekvObject);
    const actualObject = mockito.instance(spiedObject);
    mockito
      .when(spiedObject.valueAtNode(mockito.anyString()))
      .thenThrow(new Error(''));

    /// When && Then
    expect(actualObject.equalsForValues(ekvObject, paths)).toBeFalsy();
  });

  it('Cloning for paths should work', () => {
    /// Setup
    const paths = ['a.a1_1.a2_1', 'd'];

    /// When
    const cloned = ekvObject.cloningForPaths(...paths);

    /// Then
    paths.forEach(v =>
      expect(cloned.valueAtNode(v).value).toEqual(
        ekvObject.valueAtNode(v).value
      )
    );

    expect(cloned.valueAtNode('c').isFailure()).toBeTruthy();
  });

  it('Copying and moving values should work correctly', () => {
    /// Setup
    const sourcePath = 'a.a1_1.a2_1';
    const destPath = 'non_existent.non_existent_1';
    ekvObject = ekvObject.updatingValue(sourcePath, 1) as Impl;

    /// When
    const ekvObject1 = ekvObject.copyingValue(sourcePath, destPath);
    const ekvObject2 = ekvObject.movingValue(sourcePath, destPath);

    /// Then
    expect(ekvObject1.valueAtNode(sourcePath).value).toBe(1);
    expect(ekvObject1.valueAtNode(destPath).value).toBe(1);
    expect(ekvObject2.valueAtNode(sourcePath).isFailure()).toBeTruthy();
    expect(ekvObject2.valueAtNode(destPath).value).toBe(1);
  });
});
