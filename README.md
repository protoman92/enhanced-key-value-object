# enhanced-key-value-object

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/enhanced-key-value-object.svg?dummy=false)](https://badge.fury.io/js/enhanced-key-value-object?dummy=false)
[![Build Status](https://travis-ci.org/protoman92/enhanced-key-value-object.svg?branch=master&dummy=false)](https://travis-ci.org/protoman92/enhanced-key-value-object?dummy=false)
[![Coverage Status](https://coveralls.io/repos/github/protoman92/enhanced-key-value-object/badge.svg?branch=master&dummy=false)](https://coveralls.io/github/protoman92/enhanced-key-value-object?branch=master&dummy=false)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Enhanced key-value object with safe property access and immutable modications.

To use this object:

```typescript
import {EKVObject} from 'enhanced-key-value-object';

/// Note that we only expose the object interface for better encapsulation.
let object: EKVObject.Type = EKVObject.empty();
```

To access the value at any node, use:

```typescript
object.valueAtNode(string);
```

The parameter of this function should be a String whose components are joined with the specified _pathSeparator_ (which is by default '.'). The return values are wrapped in a **Try** instance to allow mapping/flatMapping <https://github.com/protoman92/JavaScriptUtilities/blob/master/src/functional/Try.ts>. For example:

```typescript
object.valueAtNode('a.b.c.d.e');   // Returns type Try<unknown>
object.numberAtNode('a.b.c.d.e');  // Returns type Try<number>
object.stringAtNode('a.b.c.d.e');  // Returns type Try<string>
object.booleanAtNode('a.b.c.d.e'); // Returns type Try<boolean>
object.objectAtNode('a.b.c.d.e');  // Returns type Try<{}>

const result: Try<string> = object.numberAtNode('a.b.c.d.e')
  .map(value => value * 2)
  .zipWith(object.stringAtNode('a.b.c.d.f'), (val1, val2) => `${val1} ${val2}`)
```

In order to update the value at some node, call:

```typescript
object.updatingValue(string, unknown);
```

The object will update the value at that node, and if necessary create new objects along the way.

This class also supports some basic array operations:

```typescript
object.removingArrayIndex(string, number);
object.upsertingInArray(string, unknown);
```

The array found at the specified node may not necessarily be an Array instance; it can also be a key-value object with string number keys (e.g. **{'0': 0, '1': 1, '2': 2}**) (in fact, all arrays with be converted to this form with **Object.assign** when they are updated). This is especially helpful for remote payload whereby element types may be muddled.

The enhanced KV object can serve as state for a React application like so:

- The client receives a payload such as:

```json
{
  "a": {"b": [1, 2, 3, {"c": {"d": "This is so nested"}}]},
  "b": {"c": {"0": 1, "1": 2, "2": 3, "3": 4}}
}
```

- It can then access nested properties with:

```typescript
State.just(payload).valueAtNode('a.b.0')     // Returns Try.success(1)
State.just(payload).valueAtNode('b.c.1')     // Returns Try.success(2)
State.just(payload).valueAtNode('a.b.3.c.d') // Returns Try.success('This is so nested')
State.just(payload).valueAtNode('a.b.3.d.e') // Returns Try.failure('...')
```

- We can then use these values to drive state changes.

To type-check state paths (e.g. for a React application), we can define getter methods as such:

```typescript
type User = Readonly<{username: string; password; string}>
const rootPath = 'user'
const loggedInUser = `${rootPath}.loggedInUser`;

function loggedInUserProp(key: keyof User) {
  return `${loggedInUser}.${key}`;
}

function getLoggedInUserProp({ state, key }: Readonly<{state: {}, key: keyof User}>) {
  return State.just(state).valueAtNode(loggedInUserProp(key));
}

const componentState = {
  usename: getLoggedInUserProp({ state: this.state, key: 'username' }).value,
  password: getLoggedInUserProp({ state: this.state, key: 'password' }).value
}
```
