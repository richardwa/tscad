/// <reference path="../types.d.ts" />
import { SpatialIndex } from "./spatial-index";

const checkValue = (v: Vec3, expected: string) => {
  const cached = cache.get(v);
  if (cached === expected) {
    console.log('success', v, cached, expected)
  } else {
    console.log('failed ', v, cached, expected)
  }
}
const checkRange = (v1: Vec3, v2: Vec3, expected: string[]) => {
  const expectedSet = new Set(expected);
  cache.orthoQuery(v1, v2).forEach(([p, v]) => {
    if (expectedSet.has(v)) {
      console.log('success', p, v, expected);
    } else {
      console.log('failed ', p, v, expected);
    }
  });

}



const cache = new SpatialIndex<string>(n => n.join());

cache.set([1, 1, 1], 'a');
cache.set([1, 1, 2], 'b');
cache.set([1, 1, 2.5], 'd');
cache.set([1, 1, 3], 'c');

checkValue([1, 1, 1], 'a');
checkValue([1, 1, 2], 'b');
checkValue([1, 1, 3], 'c');

checkRange([1, 1, 1], [1, 1, 4], ['b', 'c'])


