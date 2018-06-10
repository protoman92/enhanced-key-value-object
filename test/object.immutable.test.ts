import { JSObject } from 'javascriptutilities';
import { EKVObject } from './../src';

describe('EK Object should be immutable', () => {
  let object: JSObject<any>;
  let ekObject: EKVObject.Type;

  beforeEach(() => {
    object = {};
    ekObject = EKVObject.just(object);
  });

  it('Setting object via builder should deep clone it', () => {
    /// Setup && When
    object.a = 1;

    /// Then
    expect(ekObject.valueAtNode('a').isFailure()).toBeTruthy();
  });
});
