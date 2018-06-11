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
    let sourcePath = 'a.b.c';
    let destPath = 'e.f.g.h';
    ekvObject = ekvObject.updatingValue('a.b.c', { d: 1 });

    /// When
    let copied = ekvObject.copyingValue(sourcePath, destPath);
    let moved = ekvObject.movingValue(sourcePath, destPath);

    /// Then
    expect(copied.valueAtNode(sourcePath).isSuccess()).toBeTruthy();
    expect(copied.valueAtNode(destPath).isSuccess()).toBeTruthy();
    expect(moved.valueAtNode(sourcePath).isFailure()).toBeTruthy();
    expect(moved.valueAtNode(destPath).isSuccess()).toBeTruthy();
  });
});
