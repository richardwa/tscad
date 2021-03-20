"use strict";
exports.__esModule = true;
exports.main = void 0;
var boolean_1 = require("../csg/boolean");
var manipulate_1 = require("../csg/manipulate");
var primitives_1 = require("../csg/primitives");
exports.main = manipulate_1.rotate('y', 15, manipulate_1.rotate('z', 45, boolean_1.union({ radius: 3 }, primitives_1.box(10.2), manipulate_1.translate([10, 10, 10], primitives_1.sphere(10)))));
//# sourceMappingURL=sample.js.map