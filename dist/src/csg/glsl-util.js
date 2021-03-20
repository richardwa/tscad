"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.getShaderSrc = exports.wrap = exports.addFunc = exports.v3 = exports.f = void 0;
// used for format floats suchs that 1 will show as 1.0
var f = function (n) { return n.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    useGrouping: false
}); };
exports.f = f;
var v3 = function (p) { return "vec3(" + exports.f(p[0]) + "," + exports.f(p[1]) + "," + exports.f(p[2]) + ")"; };
exports.v3 = v3;
var count = 0;
var addFunc = function (type, args, def, deps) {
    var name = "fn" + count++;
    var body = deps.reduce(function (a, v, i) { return a.replace(new RegExp('\\$' + (i + 1), 'g'), v.name); }, def);
    var src = type + " " + name + "(" + args + "){\n" + body + "\n}";
    return { name: name, src: src, deps: deps };
};
exports.addFunc = addFunc;
var wrap = function (fn, type, args, def, deps) {
    var fns = fn;
    fns.gl = exports.addFunc(type, args, def, deps);
    return fns;
};
exports.wrap = wrap;
var walkSrc = function (n) { return __spreadArrays(n.deps.flatMap(walkSrc), [n.src]); };
var getShaderSrc = function (n) {
    var funcs = walkSrc(n);
    return {
        entry: n.name,
        funcs: funcs
    };
};
exports.getShaderSrc = getShaderSrc;
//# sourceMappingURL=glsl-util.js.map