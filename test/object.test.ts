import * as mockito from 'ts-mockito';
import { EKVObject } from './../src';

describe('Enhanced key-value object should be implemented correctly', () => {
  let object = {
    a: { a1_1: { a2_1: 1, a2_2: 2, a2_3: 3, a2_4: [] }, a1_2: 1 },
    b: { b1_1: { b2_1: 4, b2_2: 5, b2_3: 6 }, b1_2: 2 },
    c: true,
    d: 'd',
  };

  let ekvObject: EKVObject.Type;

  beforeEach(() => {
    ekvObject = EKVObject.empty()
      .cloneBuilder()
      .withObject(object)
      .withObject(undefined as any)
      .withPathSeparator('.')
      .withPathSeparator(undefined as any)
      .withBuildable(undefined as any)
      .build();
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
    mockito.when(spiedObject.object).thenReturn(undefined as any);

    /// When
    let accessedObject = actualObject.valueAtNode('d');

    /// Then
    expect(accessedObject.isFailure()).toBeTruthy();
  });

  it('Emptying object should work correctly', () => {
    /// Setup && When
    let emptied = ekvObject.emptying();

    /// When
    expect(emptied.object).toEqual({});
    expect(ekvObject.object).toEqual(object);
  });

  it('Updating value path should work correctly', () => {
    /// Setup
    let path1 = 'a.b.c.d.e';
    let path2 = 'a.a1_1.a2_4.a3_1.non_exitent.';

    /// When
    let ekvObject1 = ekvObject.updatingValueAtNode(path1, 1);
    let ekvObject2 = ekvObject.updatingValueAtNode(path2, [1, 2, 3]);

    /// Then
    expect(ekvObject.object).toEqual(object);
    expect(ekvObject1.valueAtNode(path1).value).toBe(1);
    expect(ekvObject2.valueAtNode(path2).value).toEqual([1, 2, 3]);
  });

  it('Updating value path with thrown error should work correctly', () => {
    /// Setup
    let spiedObject = mockito.spy(ekvObject);
    let actualObject = mockito.instance(spiedObject);
    mockito.when(spiedObject.object).thenReturn(undefined as any);

    /// When
    let ekvObject2 = actualObject.updatingValueAtNode('a.b.c.d.e.f', undefined);

    /// Then
    expect(ekvObject2).toBeTruthy();
  });
});
