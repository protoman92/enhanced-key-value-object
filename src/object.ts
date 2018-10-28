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
  readonly accessErrorMapper?: (error: Error) => Error;
}

export class Impl implements Type {
  public _object: JSObject<unknown>;
  public _pathSeparator: string;
  public _accessErrorMapper?: (error: Error) => Error;

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
      JSON.stringify(this._object, (_k, v) => (v === undefined ? null : v))
    );
  }

  public get pathSeparator(): string {
    return this._pathSeparator;
  }

  public get accessErrorMapper() {
    return this._accessErrorMapper;
  }

  public builder(): Builder {
    return new Builder();
  }

  public cloneBuilder(): Builder {
    return this.builder().withBuildable(this);
  }

  private _copyingPropertiesUnsafely(instance: Impl) {
    this._object = instance._object;
    this._pathSeparator = instance._pathSeparator;
    this._accessErrorMapper = instance._accessErrorMapper;
  }

  /**
   * Clone with a new object, keeping all other custom properties.
   * @param {JSObject<unknown>} object A JSObject instance.
   * @returns {Impl} An Impl instance.
   */
  public _cloneWithNewObjectUnsafely(object: JSObject<unknown>): Impl {
    const newObject = new Impl();
    newObject._copyingPropertiesUnsafely(this);
    newObject._object = object;
    return newObject;
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
          this.object._object = object;
          break;

        default:
          this.object._object = JSON.parse(
            JSON.stringify(object, (_k, v) => {
              return v === undefined ? null : v;
            })
          );

          break;
      }
    }

    return this;
  }

  public withPathSeparator(separator: string) {
    if (separator !== undefined && separator !== undefined) {
      this.object._pathSeparator = separator;
    }

    return this;
  }

  public withAccessErrorMapper(mapper?: (e: Error) => Error) {
    this.object._accessErrorMapper = mapper;
    return this;
  }

  public withBuildable(buildable: Type) {
    if (buildable !== undefined && buildable !== null) {
      this.object._object = buildable.deepClonedObject;

      return this.withPathSeparator(
        buildable.pathSeparator
      ).withAccessErrorMapper(buildable.accessErrorMapper);
    }

    return this;
  }

  public build(): Type {
    return this.object;
  }
}
