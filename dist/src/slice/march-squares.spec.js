"use strict";
/// <reference path="../../types.d.ts" />
exports.__esModule = true;
var boolean_1 = require("../csg/boolean");
var manipulate_1 = require("../csg/manipulate");
var primitives_1 = require("../csg/primitives");
var march_squares_1 = require("./march-squares");
var process_mesh_1 = require("../util/process-mesh");
var shape = manipulate_1.rotate('y', 0, manipulate_1.rotate('z', 0, boolean_1.union({ radius: 3 }, primitives_1.box(20.2), manipulate_1.translate([10, 10, 10], primitives_1.sphere(10)))));
console.time('render');
var faces = march_squares_1.slice({
    layerHeight: .2,
    height: 30,
    size: 2,
    shape: shape
});
console.timeEnd('render');
var mesh = process_mesh_1.processPolygons(faces);
process_mesh_1.writeOBJ({ faces: mesh.faces, vertices: mesh.vertices, name: 'march-squares' });
//# sourceMappingURL=march-squares.spec.js.map