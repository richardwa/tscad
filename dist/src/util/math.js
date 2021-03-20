"use strict";
exports.__esModule = true;
exports.findZeroRecursive = exports.interpolate = exports.splitSquare = exports.splitCube = exports.getCenter = exports.getCentroid = exports.boundsToCorners2 = exports.boundsToCorners = exports.positiveNumReducer = exports.getHex = exports.mix = exports.clamp = exports.getSurfaceNormal = exports.Vector = void 0;
// some basic vector maths
var Vector = /** @class */ (function () {
    function Vector(v) {
        this.result = v;
    }
    Vector.prototype.minus = function (v) {
        var a = [];
        for (var i in this.result) {
            a[i] = this.result[i] - v[i];
        }
        this.result = a;
        return this;
    };
    Vector.prototype.dot = function (v) {
        var sum = 0;
        for (var i in this.result) {
            sum += this.result[i] * v[i];
        }
        return sum;
    };
    Vector.prototype.add = function (v) {
        var a = [];
        for (var i in this.result) {
            a[i] = this.result[i] + v[i];
        }
        this.result = a;
        return this;
    };
    Vector.prototype.scale = function (s) {
        var a = [];
        for (var i in this.result) {
            a[i] = this.result[i] * s;
        }
        this.result = a;
        return this;
    };
    Vector.prototype.cross2d = function (v) {
        return this.result[0] * v[1] - this.result[1] * v[0];
    };
    Vector.prototype.cross = function (v) {
        var a = [0, 0, 0];
        a[0] = this.result[1] * v[2] - this.result[2] * v[1];
        a[1] = this.result[2] * v[0] - this.result[0] * v[2];
        a[2] = this.result[0] * v[1] - this.result[1] * v[0];
        this.result = a;
        return this;
    };
    Vector.prototype.toUnitVector = function () {
        var mag = this.magnitude();
        return this.scale(1 / mag);
    };
    Vector.prototype.magnitude = function () {
        var sum = 0;
        for (var _i = 0, _a = this.result; _i < _a.length; _i++) {
            var v = _a[_i];
            sum += v * v;
        }
        return Math.sqrt(sum);
    };
    return Vector;
}());
exports.Vector = Vector;
function getSurfaceNormal(p, fn) {
    var h = 0.001;
    var val = fn(p);
    var x = p[0], y = p[1], z = p[2];
    return new Vector([
        fn([x + h, y, z]) - val,
        fn([x, y + h, z]) - val,
        fn([x, y, z + h]) - val
    ]).toUnitVector();
}
exports.getSurfaceNormal = getSurfaceNormal;
// return x between a and b
function clamp(x, a, b) {
    if (x < a) {
        return a;
    }
    else if (x > b) {
        return b;
    }
    else {
        return x;
    }
}
exports.clamp = clamp;
// s between 0 and 1, 
// returns the linear interpolation between a and b
function mix(a, b, s) {
    return a * (1 - s) + b * s;
}
exports.mix = mix;
exports.getHex = (function () {
    var buffer = new ArrayBuffer(4);
    var intView = new Int32Array(buffer);
    var floatView = new Float32Array(buffer);
    return function (n) {
        floatView[0] = n;
        return intView[0].toString(16);
    };
})();
var positiveNumReducer = function (a, v, i) {
    if (v > 0) {
        a |= 1 << i;
    }
    return a;
};
exports.positiveNumReducer = positiveNumReducer;
var boundsToCorners = function (_a) {
    var _b = _a[0], a = _b[0], b = _b[1], c = _b[2], _c = _a[1], x = _c[0], y = _c[1], z = _c[2];
    return [
        [a, b, c], [x, b, c], [a, y, c], [x, y, c],
        [a, b, z], [x, b, z], [a, y, z], [x, y, z]
    ];
};
exports.boundsToCorners = boundsToCorners;
var boundsToCorners2 = function (_a) {
    var _b = _a[0], a = _b[0], b = _b[1], _c = _a[1], x = _c[0], y = _c[1];
    return [
        [a, b], [x, b], [a, y], [x, y],
    ];
};
exports.boundsToCorners2 = boundsToCorners2;
var getCentroid = function (t) {
    var sum = t.reduce(function (a, v) { return [a[0] + v[0], a[1] + v[1], a[2] + v[2]]; }, [0, 0, 0]);
    return sum.map(function (p) { return p / 3; });
};
exports.getCentroid = getCentroid;
var getCenter = function (p1, p2) {
    return new Vector(p1).add(p2).scale(1 / 2).result;
};
exports.getCenter = getCenter;
var splitCube = function (cube) {
    var center = exports.getCenter(cube[0], cube[7]);
    var c0 = exports.boundsToCorners([cube[0], center]);
    var c7 = exports.boundsToCorners([center, cube[7]]);
    var c1 = exports.boundsToCorners([c0[1], c7[1]]);
    var c2 = exports.boundsToCorners([c0[2], c7[2]]);
    var c3 = exports.boundsToCorners([c0[3], c7[3]]);
    var c4 = exports.boundsToCorners([c0[4], c7[4]]);
    var c5 = exports.boundsToCorners([c0[5], c7[5]]);
    var c6 = exports.boundsToCorners([c0[6], c7[6]]);
    return [c0, c1, c2, c3, c4, c5, c6, c7];
};
exports.splitCube = splitCube;
var splitSquare = function (square) {
    var center = exports.getCenter(square[0], square[3]);
    var c0 = exports.boundsToCorners2([square[0], center]);
    var c3 = exports.boundsToCorners2([center, square[3]]);
    var c1 = exports.boundsToCorners2([c0[1], c3[1]]);
    var c2 = exports.boundsToCorners2([c0[2], c3[2]]);
    return [c0, c1, c2, c3];
};
exports.splitSquare = splitSquare;
var interpolate = function (p1, p2, e1, e2) {
    var diff = new Vector(p2).minus(p1);
    var abs_e1 = Math.abs(e1);
    var abs_e2 = Math.abs(e2);
    return diff.scale(abs_e1 / (abs_e1 + abs_e2)).add(p1).result;
};
exports.interpolate = interpolate;
var findZeroRecursive = function (p1, p2, e1, e2, threshold, fn) {
    var center = exports.getCenter(p1, p2);
    var val = fn(center);
    if (Math.abs(val) < threshold) {
        return center;
    }
    else if (Math.sign(e1) !== Math.sign(val)) {
        return exports.findZeroRecursive(p1, center, e1, val, threshold, fn);
    }
    else {
        return exports.findZeroRecursive(center, p2, val, e2, threshold, fn);
    }
};
exports.findZeroRecursive = findZeroRecursive;
//# sourceMappingURL=math.js.map