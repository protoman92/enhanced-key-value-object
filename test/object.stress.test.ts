import {
  Collections,
  JSObject,
  Numbers,
  Objects,
  Strings
} from 'javascriptutilities';
import { EKVObject } from './../src';

const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const separator = '&';
const keyIdentifier = 'stress';

function createAlphabeticalLevels(levelCount: number): string[] {
  return alphabets
    .split('')
    .slice(0, levelCount)
    .map(v => `${keyIdentifier}${v}`);
}

function createAllKeys(levels: string[], countPerLevel: number): string[] {
  const subLength = levels.length;
  const last = levels[subLength - 1];

  if (subLength === 1) {
    return Numbers.range(0, countPerLevel).map(v => `${last}${v}`);
  }

  const subKeys = createAllKeys(levels.slice(0, subLength - 1), countPerLevel);
  const lastKeys = createAllKeys([last], countPerLevel);

  return subKeys
    .map(v => lastKeys.map(v1 => v + separator + v1))
    .reduce((a, b) => a.concat(b), []);
}

function createCombinations(
  levels: string[],
  countPerLevel: number
): JSObject<any> {
  const allCombinations: JSObject<number> = {};
  const allKeys = createAllKeys(levels, countPerLevel);
  const possibleValueTypes = ['array', 'number', 'object', 'string'];

  function randomizeData(): any {
    const randomType = Collections.randomElement(possibleValueTypes).value;

    switch (randomType) {
      case 'array':
        return Numbers.range(0, 5).map(() => Strings.randomString(10));

      case 'number':
        return Numbers.randomBetween(0, 1000);

      case 'object':
        return Numbers.range(0, 5)
          .map(v => ({ [v]: Strings.randomString(10) }))
          .reduce((acc, v) => Object.assign(acc, v), {});

      case 'string':
      default:
        return Strings.randomString(10);
    }
  }

  for (const key of allKeys) {
    const keyParts = key.split(separator);
    const keyLength = keyParts.length;

    const subKeys = Numbers.range(0, keyLength)
      .map(v => keyParts.slice(0, v + 1))
      .map(v => v.join(separator));

    subKeys.forEach(v => (allCombinations[v] = randomizeData()));
  }

  return allCombinations;
}

function createEKVObject(combinations: JSObject<number>): EKVObject.Type {
  let ekvObject = EKVObject.builder()
    .withPathSeparator(separator)
    .build();

  Objects.entries(combinations).forEach(([v, i]) => {
    ekvObject = ekvObject.updatingValue(v, i);
  });

  return ekvObject;
}

describe('Object should work correctly under stress', () => {
  const countPerLevel = 3;
  const maxLevel = 8;

  it('Copying/moving values from source to destination should work', () => {
    for (const i of Numbers.range(1, maxLevel)) {
      /// Setup
      const levels = createAlphabeticalLevels(i);
      const allKeys = createAllKeys(levels, countPerLevel);
      const allCombinations = createCombinations(levels, countPerLevel);
      const ekvObject = createEKVObject(allCombinations);

      /// When
      for (const srcPath of allKeys) {
        let destPath = '';

        while (destPath === srcPath) {
          destPath = Collections.randomElement(allKeys).value!;
        }

        const srcValue = ekvObject.valueAtNode(srcPath).value!;
        const copiedObject = ekvObject.copyingValue(srcPath, destPath);
        const movedObject = ekvObject.movingValue(srcPath, destPath);

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

  it('Values with full paths should work correctly', () => {
    for (const i of Numbers.range(1, maxLevel)) {
      /// Setup
      const levels = createAlphabeticalLevels(i);
      const allCombinations = createCombinations(levels, countPerLevel);
      const ekvObject = createEKVObject(allCombinations);

      /// When
      const fullPathValues = ekvObject.valuesWithFullPaths();

      const validReconstructed1 = EKVObject.empty().updatingValuesWithFullPaths(
        fullPathValues
      );

      const validReconstructed2 = EKVObject.empty().updatingValuesWithFullPaths(
        fullPathValues,
        'othersep'
      );

      /// Then
      Objects.entries(fullPathValues).forEach(([key]) => {
        const actualKey = key
          .split(separator)
          .filter(v => v.includes(keyIdentifier))
          .join(separator);

        const actualValue = allCombinations[actualKey];
        expect(actualValue).toBeDefined();
        expect(actualValue).not.toBeNull();
      });

      expect(validReconstructed1.valuesWithFullPaths()).toEqual(fullPathValues);
      expect(validReconstructed2.valuesWithFullPaths()).toEqual(fullPathValues);
    }
  });
});
