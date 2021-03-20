"use strict";
exports.__esModule = true;
exports.intersect = exports.diff = exports.union = void 0;
var math_1 = require("../util/math");
var glsl_util_1 = require("./glsl-util");
var ops = {
    union: function (s1, s2) {
        var sp = function (p) {
            return Math.min(s1(p), s2(p));
        };
        sp.gl = glsl_util_1.addFunc('float', 'vec3 p', "return min($1(p),$2(p))", [s1.gl, s2.gl]);
        return sp;
    },
    diff: function (s1, s2) {
        var sp = function (p) {
            return Math.min(s1(p), -s2(p));
        };
        sp.gl = glsl_util_1.addFunc('float', 'vec3 p', "return max($1(p),-$2(p))", [s1.gl, s2.gl]);
        return sp;
    },
    intersect: function (s1, s2) {
        var sp = function (p) {
            return Math.max(s1(p), s2(p));
        };
        sp.gl = glsl_util_1.addFunc('float', 'vec3 p', "return max($1(p),$2(p))", [s1.gl, s2.gl]);
        return sp;
    }
};
var roundOps = {
    union: function (radius, s1, s2) {
        var sp = function (p) {
            var p1 = s1(p);
            var p2 = s2(p);
            var h = math_1.clamp(0.5 + 0.5 * (p2 - p1) / radius, 0, 1);
            return math_1.mix(p2, p1, h) - radius * h * (1 - h);
        };
        sp.gl = glsl_util_1.addFunc('float', 'vec3 p', [
            "float k = " + glsl_util_1.f(radius) + ";",
            "float d1 = $1(p);",
            "float d2 = $2(p);",
            "float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );",
            "return mix( d2, d1, h ) - k*h*(1.0-h);"
        ].join('\n'), [s1.gl, s2.gl]);
        return sp;
    },
    diff: function (radius, s1, s2) {
        var sp = function (p) {
            var p1 = s1(p);
            var p2 = s2(p);
            var h = math_1.clamp(0.5 - 0.5 * (p1 + p2) / radius, 0, 1);
            return math_1.mix(p1, -p2, h) + radius * h * (1 - h);
        };
        sp.gl = glsl_util_1.addFunc('float', 'vec3 p', [
            "float k = " + glsl_util_1.f(radius) + ";",
            "float d1 = $1(p);",
            "float d2 = $2(p);",
            "float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );",
            "return mix( d2, -d1, h ) + k*h*(1.0-h);"
        ].join('\n'), [s2.gl, s2.gl]);
        return sp;
    },
    intersect: function (radius, s1, s2) {
        var sp = function (p) {
            var p1 = s1(p);
            var p2 = s2(p);
            var h = math_1.clamp(0.5 - 0.5 * (p2 - p1) / radius, 0, 1);
            return math_1.mix(p2, p1, h) + radius * h * (1 - h);
        };
        sp.gl = glsl_util_1.addFunc('float', 'vec3 p', [
            "float k = " + glsl_util_1.f(radius) + ";",
            "float d1 = $1(p);",
            "float d2 = $2(p);",
            "float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );",
            "return mix( d2, d1, h ) + k*h*(1.0-h);"
        ].join('\n'), [s1.gl, s2.gl]);
        return sp;
    }
};
var opRouter = function (op) { return function (a) {
    var s = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        s[_i - 1] = arguments[_i];
    }
    var shapes = [];
    var radius = 0;
    // normalize arguments
    if ('radius' in a) {
        radius = a.radius;
    }
    else {
        shapes.push(a);
    }
    shapes.push.apply(shapes, s);
    // check arguments
    if (shapes.length === 0) {
        throw op + " requires 2 or more shapes";
    }
    else if (shapes.length === 1) {
        return shapes[0];
    }
    var head = shapes[0], rest = shapes.slice(1);
    if (radius && radius > 0) {
        return rest.reduce(function (a, v, i) { return roundOps[op](radius, a, v); }, head);
    }
    else {
        return rest.reduce(function (a, v, i) { return ops[op](a, v); }, head);
    }
}; };
exports.union = opRouter('union');
exports.diff = opRouter('diff');
exports.intersect = opRouter('intersect');
//# sourceMappingURL=boolean.js.map