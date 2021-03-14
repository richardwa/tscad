/// <reference path="../../types.d.ts" />
//
import { SpatialIndex } from "./spatial-index";

const cache = new SpatialIndex([
  [1, 1, 1],
  [1, 1, 2],
  [1, 1, 3],
]);

const ans = cache.queryCube([0, 0, 0], 2);
console.log(ans);


