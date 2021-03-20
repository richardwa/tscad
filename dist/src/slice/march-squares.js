"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.slice = exports.getDualSquares = void 0;
var math_1 = require("../util/math");
var spatial_index_1 = require("../util/spatial-index");
var marching_squares_tables_1 = require("./marching-squares-tables");
var marchSquare = function (s, fn) {
    var results = s.map(fn);
    var cube_index = results.reduce(math_1.positiveNumReducer, 0);
    var edges = marching_squares_tables_1.edgeTable[cube_index];
    if (edges.length === 0) {
        return [];
    }
    var lines = [];
    var zeros = edges.map(function (_a) {
        var a = _a[0], b = _a[1];
        return math_1.interpolate(s[a], s[b], results[a], results[b]);
    });
    if (zeros.length > 2) {
        // saddle case
        var a = zeros[0], b = zeros[1], c = zeros[2], d = zeros[3];
        return [[a, b], [c, d]];
    }
    else {
        return [[zeros[0], zeros[1]]];
    }
};
var resFn = function (n) { return Math.floor(n / 0.001); };
var keyFn = function (n) { return n.map(resFn).join(); };
var match = function (v1, v2) {
    return Number(v1[0] === v2[0]) + Number(v1[1] === v2[1]);
};
var getDualSquares = function (squares) {
    var dualMap = new Map();
    var setDual = function (corner, i, center) {
        var key = keyFn(corner);
        var dual = dualMap.get(key);
        if (dual === undefined) {
            dual = [undefined, undefined, undefined, undefined];
            dualMap.set(key, dual);
        }
        dual[3 - i] = center;
    };
    var points = squares.flatMap(function (c) { return c; }).reduce(function (a, v, i) {
        a.set(keyFn(v), v);
        return a;
    }, new Map());
    var spatialIndex = new spatial_index_1.SpatialIndex(Array.from(points.values()));
    squares.forEach(function (square) {
        var center = math_1.getCenter(square[0], square[3]);
        var size = Math.abs(square[0][0] - square[1][0]);
        spatialIndex.queryCube(center, size).forEach(function (p) {
            var matches = square.map(function (c) { return match(c, p); });
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
exports.getDualSquares = getDualSquares;
var getSquares = function (bounds, size, minSize, fn) {
    var _process = function (square) {
        var results = square.map(fn);
        var p0 = square[0], p1 = square[1], p2 = square[2], p3 = square[3];
        var maxLen = Math.max(p1[0] - p0[0], p2[1] - p0[1]);
        // Optimization check, if we are far away (wrt cube size) from the surface, no need to divide further
        if (Math.min.apply(Math, results.map(Math.abs)) > maxLen) {
            return [square];
        }
        // split until we are small enough
        if (maxLen > size) {
            return math_1.splitSquare(square).flatMap(_process);
        }
        // adaptive cubes - continue split if too much error
        if (maxLen > minSize) {
            var edge_mask = results.reduce(math_1.positiveNumReducer, 0);
            var edges = marching_squares_tables_1.edgeTable[edge_mask];
            if (edges.length > 2) {
                // saddle case
                return math_1.splitSquare(square).flatMap(_process);
            }
            if (edges.length !== 0) {
                var lines = marchSquare(square, fn);
                var error = Math.max.apply(Math, lines.map(function (l) { return math_1.getCenter.apply(void 0, l); }).map(fn));
                if (error > minSize) {
                    return math_1.splitSquare(square).flatMap(_process);
                }
            }
        }
        return [square];
    };
    return _process(math_1.boundsToCorners2(bounds));
};
function slice(p) {
    var size = p.size;
    var minSize = p.minSize || (p.size / 200);
    console.log('cube size', size);
    var s = 500;
    var bounds = p.xybounds || [[-s, -s], [s, s]];
    var layerHeight = p.layerHeight;
    var halfHeight = (layerHeight / 2) + (layerHeight / 100);
    var bottom = p.height instanceof Array ? p.height[0] : -p.height;
    var top = p.height instanceof Array ? p.height[1] : p.height;
    console.log('layer height', layerHeight);
    var quads = [];
    var count = [0, 0];
    var _loop_1 = function (h) {
        var shape2 = function (v) { return p.shape(__spreadArrays(v, [h])); };
        shape2.gl = p.shape.gl;
        var squares = getSquares(bounds, size, minSize, shape2);
        count[0] += squares.length;
        var duals = exports.getDualSquares(squares);
        count[1] += duals.length;
        var lines = duals.flatMap(function (s) { return marchSquare(s, shape2); });
        lines.forEach(function (line) {
            var p1 = line[0], p2 = line[1];
            quads.push([
                [p1[0], p1[1], h - halfHeight],
                [p2[0], p2[1], h - halfHeight],
                [p2[0], p2[1], h + halfHeight],
                [p1[0], p1[1], h + halfHeight]
            ]);
        });
    };
    for (var h = bottom + halfHeight; h < top; h += layerHeight) {
        _loop_1(h);
    }
    console.log('squares', count[0]);
    console.log('duals', count[1]);
    return quads;
}
exports.slice = slice;
//# sourceMappingURL=march-squares.js.map