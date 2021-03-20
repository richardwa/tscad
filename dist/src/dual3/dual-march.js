"use strict";
exports.__esModule = true;
exports.dualMarch = exports.getDualCubes = void 0;
var marching_cubes_tables_1 = require("./marching-cubes-tables");
var math_1 = require("../util/math");
var spatial_index_1 = require("../util/spatial-index");
var getIntersections = function (cube, results, edge_mask) {
    var fnZeros = [];
    marching_cubes_tables_1.edges.forEach(function (_a, i) {
        var n = _a[0], m = _a[1];
        if ((edge_mask & (1 << i)) > 0) {
            fnZeros[i] = math_1.interpolate(cube[n], cube[m], results[n], results[m]);
        }
    });
    return fnZeros;
};
var march = function (cube, fn) {
    var results = cube.map(fn);
    var cube_index = results.reduce(math_1.positiveNumReducer, 0);
    var edge_mask = marching_cubes_tables_1.edgeTable[cube_index];
    if (edge_mask === 0) {
        return [];
    }
    var fnZeros = getIntersections(cube, results, edge_mask);
    //Add faces
    var triCorners = marching_cubes_tables_1.triTable[cube_index];
    var triangles = [];
    for (var i = 0; i < triCorners.length; i += 3) {
        triangles.push([
            fnZeros[triCorners[i]],
            fnZeros[triCorners[i + 1]],
            fnZeros[triCorners[i + 2]]
        ]);
    }
    return triangles;
};
/**
 * divides parent cube into list of correctly sized cubes
 */
var getCubes = function (bounds, size, minSize, fn) {
    var _process = function (cube) {
        var results = cube.map(fn);
        var maxLen = Math.max.apply(Math, new math_1.Vector(cube[7]).minus(cube[0]).result);
        // Optimization check, if we are far away (wrt cube size) from the surface, no need to divide further
        if (Math.min.apply(Math, results.map(Math.abs)) > maxLen) {
            return [cube];
        }
        // split until we are small enough
        if (maxLen > size) {
            return math_1.splitCube(cube).flatMap(_process);
        }
        // adaptive cubes - continue split if too much error
        if (maxLen > minSize) {
            var edge_mask = results.reduce(math_1.positiveNumReducer, 0);
            if (marching_cubes_tables_1.edgeTable[edge_mask] !== 0) {
                var centroids = march(cube, fn).map(math_1.getCentroid);
                var error = Math.max.apply(Math, centroids.map(fn).map(Math.abs));
                if (error > minSize) {
                    return math_1.splitCube(cube).flatMap(_process);
                }
            }
        }
        return [cube];
    };
    return _process(math_1.boundsToCorners(bounds));
};
var resFn = function (n) { return Math.floor(n / 0.001); };
var keyFn = function (n) { return n.map(resFn).join(); };
var match = function (v1, v2) {
    return Number(v1[0] === v2[0]) + Number(v1[1] === v2[1]) + Number(v1[2] === v2[2]);
};
var getDualCubes = function (cubes) {
    var dualMap = new Map();
    var setDual = function (corner, i, center) {
        var key = keyFn(corner);
        var dual = dualMap.get(key);
        if (dual === undefined) {
            dual = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
            dualMap.set(key, dual);
        }
        dual[7 - i] = center;
    };
    var points = cubes.flatMap(function (cube) { return cube; }).reduce(function (a, v, i) {
        a.set(keyFn(v), v);
        return a;
    }, new Map());
    var spatialIndex = new spatial_index_1.SpatialIndex(Array.from(points.values()));
    cubes.forEach(function (cube) {
        var center = math_1.getCenter(cube[0], cube[7]);
        var size = Math.abs(cube[0][0] - cube[1][0]);
        spatialIndex.queryCube(center, size).forEach(function (p) {
            var matches = cube.map(function (c) { return match(c, p); });
            var groupMatches = matches.reduce(function (a, v, i) {
                if (!a.get(v)) {
                    a.set(v, [i]);
                }
                else {
                    a.get(v).push(i);
                }
                return a;
            }, new Map());
            var pType = Math.max.apply(Math, Array.from(groupMatches.keys()));
            groupMatches.get(pType).forEach(function (i) {
                setDual(p, i, center);
            });
        });
    });
    // filter incomplete cubes
    return Array.from(dualMap.values())
        .filter(function (dual) { return dual.reduce(function (a, v) { return v !== undefined && a; }, true); });
};
exports.getDualCubes = getDualCubes;
function dualMarch(p) {
    var cache = new Map();
    var cachefn = function (v) {
        var key = keyFn(v);
        if (cache.has(key)) {
            return cache.get(key);
        }
        else {
            var val = p.shape(v);
            cache.set(key, val);
            return val;
        }
    };
    cachefn.gl = p.shape.gl;
    var size = p.size;
    var minSize = p.minSize || (p.size / 100);
    console.log('cube size', size);
    var s = 100;
    var bounds = p.bounds || [[-s, -s, -s], [s, s, s]];
    var cubes = getCubes(bounds, size, minSize, cachefn);
    console.log('cubes', cubes.length);
    var duals = exports.getDualCubes(cubes);
    console.log('duals', duals.length);
    var triangles = duals.flatMap(function (c) { return march(c, cachefn); });
    return triangles;
}
exports.dualMarch = dualMarch;
//# sourceMappingURL=dual-march.js.map