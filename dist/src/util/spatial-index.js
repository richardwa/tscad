"use strict";
exports.__esModule = true;
exports.SpatialIndex = void 0;
var ubilabs = require("kd-tree-javascript");
var distanceFn3 = function (a, b) {
    // distance formula for 'cube' space
    return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
};
var distanceFn2 = function (a, b) {
    // distance formula for 'cube' space
    return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
};
var SpatialIndex = /** @class */ (function () {
    function SpatialIndex(points) {
        if (points[0].length === 2) {
            this.kdtree = new ubilabs.kdTree(points, distanceFn2, [0, 1]);
        }
        else {
            this.kdtree = new ubilabs.kdTree(points, distanceFn3, [0, 1, 2]);
        }
    }
    SpatialIndex.prototype.queryCube = function (center, size) {
        return this.kdtree
            .nearest(center, 1000, (size * 1.01) / 2)
            .map(function (_a) {
            var c = _a[0], i = _a[1];
            return c;
        });
    };
    return SpatialIndex;
}());
exports.SpatialIndex = SpatialIndex;
//# sourceMappingURL=spatial-index.js.map