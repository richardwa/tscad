#!/usr/bin/env ts-node
"use strict";
/// <reference path="../../types.d.ts" />
exports.__esModule = true;
var process_mesh_1 = require("../util/process-mesh");
var dual_march_1 = require("../dual3/dual-march");
var path = require("path");
var file = path.join(process.cwd(), process.argv.slice(2)[0]);
console.log(file);
var name = path.basename(file, '.ts');
Promise.resolve().then(function () { return require(file); }).then(function (_a) {
    var main = _a.main;
    console.time('render');
    var faces = dual_march_1.dualMarch({
        size: 2,
        minSize: 1,
        shape: main
    });
    console.timeEnd('render');
    var mesh = process_mesh_1.processPolygons(faces);
    process_mesh_1.writeOBJ({ faces: mesh.faces, vertices: mesh.vertices, name: name });
});
//# sourceMappingURL=render.js.map