"use strict";
exports.__esModule = true;
exports.sphericalToCartesion = exports.registerScrollWheel = exports.registerClickAndDrag = void 0;
var math_1 = require("../util/math");
var registerClickAndDrag = function (el, cb) {
    var mouseListen = false;
    var startPos = [null, null];
    var leftClick = null;
    var start = function (e) {
        mouseListen = true;
        startPos = [e.clientX, e.clientY];
        leftClick = e.button === 0;
    };
    var stop = function (e) {
        if (mouseListen) {
            mouseListen = false;
            var current = [e.clientX, e.clientY];
            cb({ current: current, startPos: startPos, end: true, leftClick: leftClick });
            leftClick = null;
        }
    };
    var moving = function (e) {
        if (mouseListen) {
            var current = [e.clientX, e.clientY];
            cb({ current: current, startPos: startPos, end: false, leftClick: leftClick });
        }
    };
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', stop);
    el.addEventListener('mouseout', stop);
    el.addEventListener('mousemove', moving);
};
exports.registerClickAndDrag = registerClickAndDrag;
var registerScrollWheel = function (el, cb) {
    el.addEventListener('wheel', (function (e) {
        cb(e.deltaY);
    }));
};
exports.registerScrollWheel = registerScrollWheel;
var sphericalToCartesion = function (_a) {
    var _b = _a.pos, radius = _b[0], theta = _b[1], _phi = _b[2], origin = _a.origin;
    if (Math.abs(radius) < 0.01) {
        return {
            cameraPos: origin
        };
    }
    var phi = math_1.clamp(_phi, -Math.PI + .01, Math.PI - .01);
    var xzRadius = radius * Math.cos(phi);
    var cameraPos = [
        xzRadius * Math.sin(theta) + origin[0],
        radius * Math.sin(phi) + origin[2],
        -xzRadius * Math.cos(theta) + origin[1],
    ];
    var cameraDir = new math_1.Vector(origin).minus(cameraPos).toUnitVector().result;
    var up = [0, 1, 0];
    var cameraTop = new math_1.Vector(cameraDir).cross(up).cross(cameraDir).toUnitVector().result;
    return {
        cameraPos: cameraPos,
        cameraDir: cameraDir,
        cameraTop: cameraTop
    };
};
exports.sphericalToCartesion = sphericalToCartesion;
//# sourceMappingURL=mouse-orbit.js.map