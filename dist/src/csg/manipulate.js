"use strict";
exports.__esModule = true;
exports.scale = exports.rotate = exports.translate = void 0;
var glsl_util_1 = require("./glsl-util");
function translate(translation, s) {
    var fn = function (v, i) { return v - translation[i]; };
    var sp = function (p) { return s(p.map(fn)); };
    sp.gl = glsl_util_1.addFunc('float', 'vec3 p', "return $1(p-" + glsl_util_1.v3(translation) + ");", [s.gl]);
    return sp;
}
exports.translate = translate;
function rotate(axis, degrees, s) {
    var sn = Math.sin(degrees * 2 * Math.PI / 360);
    var cs = Math.cos(degrees * 2 * Math.PI / 360);
    switch (axis) {
        case 'x': return glsl_util_1.wrap(function (_a) {
            var x = _a[0], y = _a[1], z = _a[2];
            return s([x, y * cs - z * sn, y * sn + z * cs]);
        }, 'float', 'vec3 p', "return ($1(vec3(p.x,p.y*" + glsl_util_1.f(cs) + "-p.z*" + glsl_util_1.f(sn) + ",p.y*" + glsl_util_1.f(sn) + "+p.z*" + glsl_util_1.f(cs) + ")));", [s.gl]);
        case 'y': return glsl_util_1.wrap(function (_a) {
            var x = _a[0], y = _a[1], z = _a[2];
            return s([x * cs + z * sn, y, z * cs - x * sn]);
        }, 'float', 'vec3 p', "return ($1(vec3(p.x*" + glsl_util_1.f(cs) + "+p.z*" + glsl_util_1.f(sn) + ",p.y,p.z*" + glsl_util_1.f(cs) + "-p.x*" + glsl_util_1.f(sn) + ")));", [s.gl]);
        case 'z': return glsl_util_1.wrap(function (_a) {
            var x = _a[0], y = _a[1], z = _a[2];
            return s([x * cs - y * sn, x * sn + y * cs, z]);
        }, 'float', 'vec3 p', "return ($1(vec3(p.x*" + glsl_util_1.f(cs) + "-p.y*" + glsl_util_1.f(sn) + ",p.x*" + glsl_util_1.f(sn) + "+p.y*" + glsl_util_1.f(cs) + ",p.z)));", [s.gl]);
    }
}
exports.rotate = rotate;
function scale(d, s) {
    var sc = function (a) { return a / d; };
    var sp = function (p) { return s(p.map(sc)) * d; };
    sp.gl = glsl_util_1.addFunc('float', 'vec3 p', "return $1(p/" + glsl_util_1.f(d) + ")*" + glsl_util_1.f(d) + ";", [s.gl]);
    return sp;
}
exports.scale = scale;
//# sourceMappingURL=manipulate.js.map