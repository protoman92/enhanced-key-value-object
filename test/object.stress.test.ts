import {
  Collections,
  JSObject,
  Numbers,
  Objects,
} from 'javascriptutilities';

import { EKVObject } from './../src';

let alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let separator = '.';

function createAlphabeticalLevels(levelCount: number): string[] {
  return alphabets.split('').slice(0, levelCount);
}

function createAllKeys(levels: string[], countPerLevel: number): string[] {
  let subLength = levels.length;
  let last = levels[subLength - 1];

  if (subLength === 1) {
    return Numbers.range(0, countPerLevel).map(v => '' + last + v);
  } else {
    let subKeys = createAllKeys(levels.slice(0, subLength - 1), countPerLevel);
    let lastKeys = createAllKeys([last], countPerLevel);

    return subKeys
      .map(v => lastKeys.map(v1 => v + separator + v1))
      .reduce((a, b) => a.concat(b), []);
  }
}

function createCombinations(levels: string[], countPerLevel: number): JSObject<number> {
  let allCombinations: JSObject<number> = {};
  let allKeys = createAllKeys(levels, countPerLevel);

  for (let key of allKeys) {
    let keyParts = key.split(separator);
    let keyLength = keyParts.length;

    let subKeys = Numbers
      .range(0, keyLength)
      .map(v => keyParts.slice(0, v + 1))
      .map(v => v.join(separator));

    subKeys.forEach(v => allCombinations[v] = Numbers.randomBetween(0, 100000));
  }

  return allCombinations;
}

function createEKVObject(combinations: JSObject<number>): EKVObject.Type {
  let ekvObject = EKVObject.empty();

  Objects.entries(combinations).forEach(([v, i]) => {
    ekvObject = ekvObject.updatingValue(v, i);
  });

  return ekvObject;
}

describe('EKVObject should work correctly under stress', () => {
  let countPerLevel = 3;
  let maxLevel = 8;

  it('Copying/moving values from source to destination should work', () => {
    for (let i of Numbers.range(1, maxLevel)) {
      /// Setup
      let levels = createAlphabeticalLevels(i);
      let allKeys = createAllKeys(levels, countPerLevel);
      let allCombinations = createCombinations(levels, countPerLevel);
      let ekvObject = createEKVObject(allCombinations);

      /// When
      for (let srcPath of allKeys) {
        let destPath = '';

        while (destPath === srcPath) {
          destPath = Collections.randomElement(allKeys).value!;
        }

        let srcValue = ekvObject.valueAtNode(srcPath).value!;
        let copiedObject = ekvObject.copyingValue(srcPath, destPath);
        let movedObject = ekvObject.movingValue(srcPath, destPath);

        /// Then
        expect(copiedObject.valueAtNode(srcPath).isSuccess()).toBeTruthy();
        expect(copiedObject.valueAtNode(destPath).isSuccess()).toBeTruthy();
        expect(movedObject.valueAtNode(srcPath).isSuccess()).toBeFalsy();
        expect(movedObject.valueAtNode(destPath).isSuccess()).toBeTruthy();
        expect(copiedObject.valueAtNode(destPath).value).toEqual(srcValue);
        expect(movedObject.valueAtNode(destPath).value).toEqual(srcValue);
      }
    }
  });
});
