"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var math_1 = require("../util/math");
var gl_util_1 = require("./gl-util");
var mouse_orbit_1 = require("./mouse-orbit");
var sample_1 = require("./sample");
var glsl_util_1 = require("../csg/glsl-util");
var canvas = document.createElement("canvas");
canvas.width = gl_util_1.initialState.iResolution[0];
canvas.height = gl_util_1.initialState.iResolution[1];
document.body.append(canvas);
canvas.oncontextmenu = function (e) { e.preventDefault(); e.stopPropagation(); };
var shaderSrc = window.shaderSrc || glsl_util_1.getShaderSrc(sample_1.main.gl);
var setState = gl_util_1.setupWebGL(canvas, shaderSrc);
var orbitalState = {
    pos: [300, Math.PI / 4, Math.PI / 4],
    origin: [0, 0, 0]
};
console.log('initial state', JSON.stringify(gl_util_1.initialState));
var state = __assign(__assign({}, gl_util_1.initialState), mouse_orbit_1.sphericalToCartesion(orbitalState));
console.log('new     state', JSON.stringify(state));
setState(state);
mouse_orbit_1.registerClickAndDrag(canvas, function (_a) {
    var current = _a.current, startPos = _a.startPos, end = _a.end, leftClick = _a.leftClick;
    var screenX = (current[0] - startPos[0]) / gl_util_1.initialState.iResolution[0];
    var screenY = (current[1] - startPos[1]) / gl_util_1.initialState.iResolution[1];
    var tmp = __assign({}, orbitalState);
    if (leftClick) {
        // rotate
        var pos = orbitalState.pos;
        tmp.pos = [
            pos[0],
            pos[1] + screenX * 5,
            pos[2] + screenY * 5
        ];
    }
    else {
        // pan
        var origin_1 = orbitalState.origin;
        var deltaY = new math_1.Vector(state.cameraTop).scale(screenY).result;
        var deltaX = new math_1.Vector(state.cameraTop).cross(state.cameraDir).scale(screenX).result;
        var delta = new math_1.Vector(deltaX).add(deltaY).scale(orbitalState.pos[0] / 10).result;
        tmp.origin = new math_1.Vector(origin_1).add(delta).result;
    }
    var _state = __assign(__assign({}, state), mouse_orbit_1.sphericalToCartesion(tmp));
    if (end) {
        orbitalState = tmp;
        state = _state;
    }
    window.requestAnimationFrame(function () {
        setState(_state);
    });
});
mouse_orbit_1.registerScrollWheel(canvas, function (zoom) {
    var tmp = __assign({}, orbitalState);
    tmp.pos[0] += Math.sign(zoom) * Math.max(tmp.pos[0] / 10, 1);
    orbitalState = tmp;
    state = __assign(__assign({}, state), mouse_orbit_1.sphericalToCartesion(tmp));
    window.requestAnimationFrame(function () {
        setState(state);
    });
});
//# sourceMappingURL=entry.js.map