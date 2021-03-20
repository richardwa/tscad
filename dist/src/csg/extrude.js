"use strict";
exports.__esModule = true;
exports.tile = exports.mirror = exports.revolve = exports.extrude = void 0;
var math_1 = require("../util/math");
var glsl_util_1 = require("./glsl-util");
function extrude(height, s) {
    var h = height / 2;
    var sp = function (p) {
        var d = s([p[0], p[1]]);
        var w = Math.abs(p[2]) - h;
        var outside = new math_1.Vector([Math.max(d, 0), Math.max(w, 0)]).magnitude();
        var inside = Math.min(Math.max(d, w), 0);
        return outside + inside;
    };
    sp.gl = glsl_util_1.addFunc('float', 'vec3 p', [
        "float d = " + s.gl.name + "(p.xy);",
        "vec2 w = vec2( d, abs(p.z) - " + glsl_util_1.f(h) + " );",
        "return min(max(w.x,w.y),0.0) + length(max(w,0.0));"
    ].join('\n'), [s.gl]);
    return sp;
}
exports.extrude = extrude;
function revolve(axis, offset, s) {
    switch (axis) {
        case 'x': return glsl_util_1.wrap(function (p) { return s([new math_1.Vector([p[1], p[2]]).magnitude() - offset, p[0]]); }, 'float', 'vec3 p', "return $1(length(p.yz)-" + glsl_util_1.f(offset) + ",p.x)", [s.gl]);
        case 'y': return glsl_util_1.wrap(function (p) { return s([new math_1.Vector([p[0], p[2]]).magnitude() - offset, p[1]]); }, 'float', 'vec3 p', "return $1(length(p.xz)-" + glsl_util_1.f(offset) + ",p.y)", [s.gl]);
        case 'z': return glsl_util_1.wrap(function (p) { return s([new math_1.Vector([p[0], p[1]]).magnitude() - offset, p[2]]); }, 'float', 'vec3 p', "return $1(length(p.xy)-" + glsl_util_1.f(offset) + ",p.z)", [s.gl]);
    }
}
exports.revolve = revolve;
function mirror(plane, s) {
    switch (plane) {
        case 'yz': return glsl_util_1.wrap(function (p) { return s([Math.abs(p[0]), p[1], p[2]]); }, 'float', 'vec3 p', "return $1(vec3(abs(p.x),p.y,p.z));", [s.gl]);
        case 'xy': return glsl_util_1.wrap(function (p) { return s([p[0], p[1], Math.abs(p[2])]); }, 'float', 'vec3 p', "return $1(vec3(p.x,p.y,abs(p.z)));", [s.gl]);
        case 'xz': return glsl_util_1.wrap(function (p) { return s([p[0], Math.abs(p[1]), p[2]]); }, 'float', 'vec3 p', "return $1(vec3(p.x,abs(p.y),p.z));", [s.gl]);
    }
}
exports.mirror = mirror;
// tile in 1-Dimension
var tile1D = function (p) {
    var times = p[0], width = p[1];
    var upper = Math.floor(times / 2);
    var lower = -Math.floor(times / 2) + ((times + 1) % 2);
    var f = function (x) { return x - width * math_1.clamp(Math.round(x / width), lower, upper); };
    // offset even numbers to keep centered after tiling
    var offset = width / 2;
    return (times % 2 === 1) ? f : function (x) { return f(x + offset); };
};
var identity = function (n) { return n; };
function tile(o, s) {
    var tileX = o.x ? tile1D(o.x) : identity;
    var tileY = o.y ? tile1D(o.y) : identity;
    var tileZ = o.z ? tile1D(o.z) : identity;
    return glsl_util_1.wrap(function (p) { return s([tileX(p[0]), tileY(p[1]), tileZ(p[2])]); }, 'float', 'vec3 p', [
        "vec3 c = vec3(" + glsl_util_1.f(o.x ? o.x[0] : 0) + "," + glsl_util_1.f(o.y ? o.y[0] : 0) + "," + glsl_util_1.f(o.z ? o.z[0] : 0) + ");",
        "vec3 m = vec3(" + glsl_util_1.f(o.x ? o.x[1] : 0) + "," + glsl_util_1.f(o.y ? o.y[1] : 0) + "," + glsl_util_1.f(o.z ? o.z[1] : 0) + ");",
        "vec3 q = p-c*clamp(round(p/c),-m,m);",
        "return $1( q );"
    ].join('\n'), [s.gl]);
}
exports.tile = tile;
//# sourceMappingURL=extrude.js.map