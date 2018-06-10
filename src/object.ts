import { BuildableType, BuilderType, JSObject } from 'javascriptutilities';

export interface Type extends BuildableType<Builder> {
  readonly object: JSObject<any>;
  readonly pathSeparator: string;
}

export class Impl implements Type {
  public _object: JSObject<any>;
  public _pathSeparator: string;

  public constructor() {
    this._object = {};
    this._pathSeparator = '.';
  }

  public get object(): JSObject<any> {
    return Object.assign({}, this._object);
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
      this.object.setObject(object);
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
      return this
        .withObject(buildable.object)
        .withPathSeparator(buildable.pathSeparator);
    } else {
      return this;
    }
  }

  public build(): Type {
    return this.object;
  }
}
