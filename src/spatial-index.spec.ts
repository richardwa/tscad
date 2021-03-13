/// <reference path="../types.d.ts" />
import { SpatialIndex } from "./spatial-index";

const cache = new SpatialIndex(n => n.join());

cache.set([1, 1, 1]);
cache.set([1, 1, 2]);
cache.set([1, 1, 3]);

const ans = cache.queryCube([0, 0, 0], 2);
console.log(ans);


