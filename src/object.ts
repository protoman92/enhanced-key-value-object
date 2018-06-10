import { BuildableType, BuilderType, JSObject } from 'javascriptutilities';

export type EKVObjectType = Type | JSObject<any>;

export interface Type extends BuildableType<Builder> {
  /**
   * Deep clone the inner object.
   */
  readonly clonedObject: JSObject<any>;
  readonly pathSeparator: string;
}

export class Impl implements Type {
  public _object: JSObject<any>;
  public _pathSeparator: string;

  public constructor() {
    this._object = {};
    this._pathSeparator = '.';
  }

  public get actualObject(): JSObject<any> {
    return this._object;
  }

  public get clonedObject(): JSObject<any> {
    return JSON.parse(JSON.stringify(this._object));
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

  public setObject(object: JSObject<any>) {
    this._object = object;
  }

  public setPathSeparator(separator: string) {
    this._pathSeparator = separator;
  }
}

export class Builder implements BuilderType<Type> {
  private readonly object: Impl;

  public constructor() {
    this.object = new Impl();
  }

  public withObject(object: JSObject<any>) {
    if (object !== undefined && object !== null) {
      this.object.setObject(JSON.parse(JSON.stringify(object)));
    }

    return this;
  }

  public withPathSeparator(separator: string) {
    if (separator !== undefined && separator != undefined) {
      this.object.setPathSeparator(separator);
    }

    return this;
  }

  public withBuildable(buildable: Type) {
    if (buildable !== undefined && buildable !== null) {
      this.object.setObject(buildable.clonedObject);
      return this.withPathSeparator(buildable.pathSeparator);
    } else {
      return this;
    }
  }

  public build(): Type {
    return this.object;
  }
}
