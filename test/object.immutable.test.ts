import { JSObject } from 'javascriptutilities';
import { EKVObject } from './../src';

describe('EK Object should be immutable', () => {
  let object: JSObject<any>;
  let ekvObject: EKVObject.Type;

  beforeEach(() => {
    object = {};
    ekvObject = EKVObject.just(object);
  });

  it('Setting object via builder should deep clone it', () => {
    /// Setup && When
    object.a = 1;

    /// Then
    expect(ekvObject.valueAtNode('a').isFailure()).toBeTruthy();
  });

  it('Copying and moving values should not modify original object', () => {
    /// Setup
    const sourcePath = 'a.b.c';
    const destPath = 'e.f.g.h';
    ekvObject = ekvObject.updatingValue('a.b.c', { d: 1 });

    /// When
    const copied = ekvObject.copyingValue(sourcePath, destPath);
    const moved = ekvObject.movingValue(sourcePath, destPath);

    /// Then
    expect(copied.valueAtNode(sourcePath).isSuccess()).toBeTruthy();
    expect(copied.valueAtNode(destPath).isSuccess()).toBeTruthy();
    expect(moved.valueAtNode(sourcePath).isFailure()).toBeTruthy();
    expect(moved.valueAtNode(destPath).isSuccess()).toBeTruthy();
  });

  it('Updating value with reference object should remove reference to said object', () => {
    /// Setup
    const path = 'a.b.c';
    const valueObject: JSObject<any> = {};

    /// When
    ekvObject = ekvObject.updatingValue(path, valueObject);
    valueObject.d = 1;

    /// Then
    expect(ekvObject.valueAtNode(`${path}.d`).isFailure()).toBeTruthy();
  });
});
