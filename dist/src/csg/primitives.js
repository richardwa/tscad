"use strict";
exports.__esModule = true;
exports.box = exports.poly = exports.rect = exports.cylinder = exports.sphere = exports.circle = void 0;
var math_1 = require("../util/math");
var extrude_1 = require("./extrude");
var glsl_util_1 = require("./glsl-util");
function circle(r) {
    if (r === void 0) { r = 1; }
    var sp = function (p) { return new math_1.Vector(p).magnitude() - r; };
    sp.gl = glsl_util_1.addFunc('float', 'vec2 p', "return length(p)-" + glsl_util_1.f(r) + ";", []);
    return sp;
}
exports.circle = circle;
function sphere(r) {
    if (r === void 0) { r = 1; }
    var sp = function (p) { return new math_1.Vector(p).magnitude() - r; };
    sp.gl = glsl_util_1.addFunc('float', 'vec3 p', "return length(p)-" + glsl_util_1.f(r) + ";", []);
    return sp;
}
exports.sphere = sphere;
function cylinder(radius, height) {
    if (radius === void 0) { radius = 1; }
    if (height === void 0) { height = 2; }
    return extrude_1.extrude(height, circle(radius));
}
exports.cylinder = cylinder;
function rect(x, y) {
    if (x === void 0) { x = 2; }
    if (y === void 0) { y = x; }
    var x1 = x / 2, y1 = y / 2;
    var sp = function (_a) {
        var x = _a[0], y = _a[1];
        var i = Math.max(Math.abs(x) - x1, 0);
        var j = Math.max(Math.abs(y) - y1, 0);
        var outside = new math_1.Vector([Math.max(i, 0), Math.max(j, 0)]).magnitude();
        var inside = Math.min(Math.max(i, j), 0);
        return outside + inside;
    };
    sp.gl = glsl_util_1.addFunc('float', 'vec2 p', [
        "vec2 d = abs(p)-vec2(" + (glsl_util_1.f(x), glsl_util_1.f(y)) + ");",
        "return length(max(d,0.0))+min(max(d.x,d.y),0.0); "
    ].join('\n'), []);
    return sp;
}
exports.rect = rect;
var poly2 = function (points) {
    var sp = function (p) {
        var a = new math_1.Vector(p).minus(points[0]);
        var distance = a.dot(a.result);
        var sign = 1;
        var len = points.length;
        for (var i = 0; i < len; i++) {
            var i2 = (i + 1) % len;
            var e = new math_1.Vector(points[i2]).minus(points[i]).result;
            var v = new math_1.Vector(p).minus(points[i]).result;
            var pq = new math_1.Vector(v).minus(new math_1.Vector(e).scale(math_1.clamp(new math_1.Vector(v).dot(e) / new math_1.Vector(e).dot(e), 0, 1)).result);
            distance = Math.min(distance, pq.dot(pq.result));
            //winding number
            var v2 = new math_1.Vector(p).minus(points[i2]).result;
            var val3 = new math_1.Vector(e).cross2d(v);
            var cond = [v[1] >= 0 ? 1 : 0, v2[1] < 0 ? 1 : 0, val3 > 0 ? 1 : 0];
            if (Math.max.apply(Math, cond) === Math.min.apply(Math, cond)) {
                sign *= -1;
            }
        }
        return Math.sqrt(distance) * sign;
    };
    // from iq - https://www.shadertoy.com/view/WdSGRd
    var poly = points.map(function (p) { return "vec2(" + (glsl_util_1.f(p[0]), glsl_util_1.f(p[1])) + ")"; }).join(',');
    sp.gl = glsl_util_1.addFunc('float', 'vec2 p', [
        "vec2[N] poly = vec2[N](" + poly + ")",
        "vec2[N] e;",
        "vec2[N] v;",
        "vec2[N] pq;",
        // data
        "for( int i=0; i<N; i++) {",
        "    int i2= int(mod(float(i+1),float(N)));",
        "e[i] = poly[i2] - poly[i];",
        "    v[i] = p - poly[i];",
        "    pq[i] = v[i] - e[i]*clamp( dot(v[i],e[i])/dot(e[i],e[i]), 0.0, 1.0 );",
        "}",
        //distance
        "float d = dot(pq[0], pq[0]); ",
        "for( int i=1; i<N; i++) {",
        "  d = min( d, dot(pq[i], pq[i]));",
        "}",
        //winding number
        // from http://geomalgorithms.com/a03-_inclusion.html
        "int wn =0; ",
        "for( int i=0; i<N; i++) {",
        "    int i2= int(mod(float(i+1),float(N)));",
        "    bool cond1= 0. <= v[i].y;",
        "    bool cond2= 0. > v[i2].y;",
        "    float val3= cross2d(e[i],v[i]);",
        "    wn+= cond1 && cond2 && val3>0. ? 1 : 0;",
        "    wn-= !cond1 && !cond2 && val3<0. ? 1 : 0; // have  a valid down intersect",
        "}",
        "float s= wn == 0 ? 1. : -1.;",
        "return sqrt(d) * s;",
    ].join('\n'), []);
    return sp;
};
/**
 * @param points specify number of corners for a regular polygon.  Can also use an abitrary array of points
 * @param radius not required when using list of points
 */
function poly(points, radius) {
    var verts = [];
    if (typeof points === 'number') {
        if (!radius) {
            throw 'error: radius required unless explict Vec2[] is given for points';
        }
        verts.push([0, radius]);
        var angle = 2 * Math.PI / points;
        for (var i = 1; i < points; i++) {
            var _a = verts[i - 1], x = _a[0], y = _a[1];
            var x1 = Math.cos(angle) * x - Math.sin(angle) * y;
            var y1 = Math.sin(angle) * x + Math.cos(angle) * y;
            verts.push([x1, y1]);
        }
    }
    else {
        verts.push.apply(verts, points);
    }
    if (verts.length < 3) {
        throw 'error: polygon requires at least 3 points';
    }
    return poly2(verts);
}
exports.poly = poly;
function box(x, y, z) {
    if (x === void 0) { x = 2; }
    if (y === void 0) { y = x; }
    if (z === void 0) { z = y; }
    var x1 = x / 2, y1 = y / 2, z1 = z / 2;
    var sp = function (_a) {
        var x = _a[0], y = _a[1], z = _a[2];
        var i = Math.abs(x) - x1;
        var j = Math.abs(y) - y1;
        var k = Math.abs(z) - z1;
        var outside = new math_1.Vector([Math.max(i, 0), Math.max(j, 0), Math.max(k, 0)]).magnitude();
        var inside = Math.min(Math.max(i, j, k), 0);
        return outside + inside;
    };
    sp.gl = glsl_util_1.addFunc('float', 'vec3 p', [
        "vec3 q = abs(p) - " + glsl_util_1.v3([x, y, x]) + "; ",
        "return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); "
    ].join('\n'), []);
    return sp;
}
exports.box = box;
//# sourceMappingURL=primitives.js.map