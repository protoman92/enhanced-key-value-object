# enhanced-key-value-object

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/enhanced-key-value-object.svg?dummy=false)](https://badge.fury.io/js/enhanced-key-value-object?dummy=false)
[![Build Status](https://travis-ci.org/protoman92/enhanced-key-value-object.svg?branch=master&dummy=false)](https://travis-ci.org/protoman92/enhanced-key-value-object?dummy=false)
[![Coverage Status](https://coveralls.io/repos/github/protoman92/enhanced-key-value-object/badge.svg?branch=master&dummy=false)](https://coveralls.io/github/protoman92/enhanced-key-value-object?branch=master&dummy=false)

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

The parameter of this function should be a String whose components are joined with the specified _pathSeparator_ (which is by default '.'). For example:

```typescript
object.valueAtNode('a.b.c.d.e');
```

In order to update the value at some node, call:

```typescript
object.updatingValue(string, Nullable<any>);
```

The object will update the value at that node, and if necessary create new objects along the way.
