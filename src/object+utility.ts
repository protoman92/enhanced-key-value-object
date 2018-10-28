import { Never, Undefined } from 'javascriptutilities';
import {
  Builder,
  EKVObjectType,
  Impl,
  objectKey,
  pathSeparatorKey,
  Type
} from './object';

let defaultAccessMode: 'safe' | 'unsafe' = 'safe';
let defaultAccessErrorMapper: Undefined<(e: Error) => Error> = undefined;

export function setDefaultAccessMode(mode: typeof defaultAccessMode) {
  defaultAccessMode = mode;
}

export function setDefaultAccessErrorMapper(mapper?: (e: Error) => Error) {
  defaultAccessErrorMapper = mapper;
}

export function setDefaultAccessErrorConstructor(
  ctor?: new (e: Error) => Error
) {
  if (ctor) {
    const Constructor = ctor;
    setDefaultAccessErrorMapper(e => new Constructor(e));
  } else {
    setDefaultAccessErrorMapper(undefined);
  }
}

export function getAccessModeOrFallback(mode?: typeof defaultAccessMode) {
  return mode || defaultAccessMode;
}

/**
 * Create a new builder object.
 * @returns {Builder} A Builder instance.
 */
export function builder(): Builder {
  return new Builder();
}

/**
 * Create an empty enhanced key-value object.
 * @returns {Type} A Type instance.
 */
export function empty(): Type {
  return builder().build();
}

function _justBuilder(
  object: Never<EKVObjectType>,
  { mode }: Readonly<{ mode?: typeof defaultAccessMode }> = { mode: 'safe' }
) {
  if (object !== undefined && object !== null) {
    const innerObject = (object as any)[objectKey];
    const pathSeparator = (object as any)[pathSeparatorKey];

    if (
      innerObject !== undefined &&
      innerObject !== null &&
      typeof pathSeparator === 'string'
    ) {
      return builder()
        .withObject(innerObject, getAccessModeOrFallback(mode))
        .withPathSeparator(pathSeparator);
    }

    return builder().withObject(object, getAccessModeOrFallback(mode));
  }

  return builder();
}

/**
 * Create an enhanced key-value object with an object.
 * @param {Never<EKVObjectType>} object An EKVObjectType instance.
 */
export function just(
  object: Never<EKVObjectType>,
  options?: Readonly<{
    mode?: typeof defaultAccessMode;
    accessErrorMapper?: (e: Error) => Error;
  }>
): Type {
  if (object instanceof Impl) return object;

  return _justBuilder(object, options)
    .withAccessErrorMapper(
      (options && options.accessErrorMapper) || defaultAccessErrorMapper
    )
    .build();
}
