"use strict";
/// <reference path="../../types.d.ts" />
exports.__esModule = true;
var spatial_index_1 = require("./spatial-index");
var cache = new spatial_index_1.SpatialIndex([
    [1, 1, 1],
    [1, 1, 2],
    [1, 1, 3],
]);
var ans = cache.queryCube([0, 0, 0], 2);
console.log(ans);
//# sourceMappingURL=spatial-index.spec.js.map