"use strict";
/// <reference path="../../types.d.ts" />
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var console_1 = require("console");
var mouse_orbit_1 = require("./mouse-orbit");
var assertEquals = function (a, b) {
    var rest = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        rest[_i - 2] = arguments[_i];
    }
    return console_1.assert.apply(void 0, __spreadArrays([a.reduce(function (a, v, i) { return a && Math.abs(v - b[i]) < 0.01; }, true), a, b], rest));
};
assertEquals(mouse_orbit_1.sphericalToCartesion({
    origin: [0, 0, 0],
    pos: [1, 0, 0]
}).cameraPos, [0, 0, -1]);
assertEquals(mouse_orbit_1.sphericalToCartesion({
    origin: [0, 0, 0],
    pos: [2, Math.PI / 6, 0]
}).cameraPos, [1, 0, -Math.sqrt(3)]);
assertEquals(mouse_orbit_1.sphericalToCartesion({
    origin: [0, 0, 0],
    pos: [2, Math.PI / 6, Math.PI / 4]
}).cameraPos, [1, 2, -Math.sqrt(3)]);
//# sourceMappingURL=mouse-orbit.spec.js.map