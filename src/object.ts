import { BuildableType, BuilderType, JSObject } from 'javascriptutilities';
import { shallowCloneObject } from './util';

export type EKVObjectType = Type | JSObject<unknown>;
export let objectKey: keyof Impl = '_object';
export let pathSeparatorKey: keyof Impl = '_pathSeparator';

export interface Type extends BuildableType<Builder> {
  /**
   * Deep clone the inner object.
   */
  readonly deepClonedObject: JSObject<unknown>;
  readonly pathSeparator: string;
}

export class Impl implements Type {
  public _object: JSObject<unknown>;
  public _pathSeparator: string;
  public _errorAccessMapper?: (error: Error) => Error;

  public constructor() {
    this._object = {};
    this._pathSeparator = '.';
  }

  public get actualObject(): JSObject<unknown> {
    return this._object;
  }

  public get shallowClonedObject(): JSObject<unknown> {
    return shallowCloneObject(this._object);
  }

  public get deepClonedObject(): JSObject<unknown> {
    return JSON.parse(
      JSON.stringify(this._object, (_k, v) => {
        return v === undefined ? null : v;
      })
    );
  }

  public get pathSeparator(): string {
    return this._pathSeparator;
  }

  public builder(): Builder {
    return new Builder();
  }

  public cloneBuilder(): Builder {
    return this.builder().withBuildable(this);
  }

  public settingObjectUnsafely(object: JSObject<unknown>) {
    this._object = object;
    return this;
  }

  public settingPathSeparatorUnsafely(separator: string) {
    this._pathSeparator = separator;
    return this;
  }

  public copyingPropertiesUnsafely(ekvObject: Impl) {
    return this.settingObjectUnsafely(
      ekvObject._object
    ).settingPathSeparatorUnsafely(ekvObject._pathSeparator);
  }
}

export class Builder implements BuilderType<Type> {
  private readonly object: Impl;

  public constructor() {
    this.object = new Impl();
  }

  public withObject(
    object: JSObject<unknown>,
    mode: 'safe' | 'unsafe' = 'safe'
  ) {
    if (object !== undefined && object !== null) {
      switch (mode) {
        case 'unsafe':
          this.object.settingObjectUnsafely(object);
          break;

        default:
          this.object.settingObjectUnsafely(
            JSON.parse(
              JSON.stringify(object, (_k, v) => {
                return v === undefined ? null : v;
              })
            )
          );

          break;
      }
    }

    return this;
  }

  public withPathSeparator(separator: string) {
    if (separator !== undefined && separator !== undefined) {
      this.object.settingPathSeparatorUnsafely(separator);
    }

    return this;
  }

  public withBuildable(buildable: Type) {
    if (buildable !== undefined && buildable !== null) {
      this.object.settingObjectUnsafely(buildable.deepClonedObject);
      return this.withPathSeparator(buildable.pathSeparator);
    }

    return this;
  }

  public build(): Type {
    return this.object;
  }
}
