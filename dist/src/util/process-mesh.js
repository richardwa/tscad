"use strict";
exports.__esModule = true;
exports.processPolygons = exports.writeOBJ = void 0;
var fs = require("fs");
function writeOBJ(p) {
    var os = fs.createWriteStream((p.outDir || './target') + "/" + p.name + ".obj");
    //write obj file
    for (var _i = 0, _a = p.vertices; _i < _a.length; _i++) {
        var pos = _a[_i];
        os.write("v " + pos.join(' ') + '\n');
    }
    for (var _b = 0, _c = p.faces; _b < _c.length; _b++) {
        var face = _c[_b];
        os.write("f " + face.map(function (i) { return i + 1; }).join(' ') + '\n');
    }
}
exports.writeOBJ = writeOBJ;
function processPolygons(polygons) {
    var vertexCache = new Map();
    var vertices = [];
    var faces = [];
    var error = 0;
    for (var _i = 0, polygons_1 = polygons; _i < polygons_1.length; _i++) {
        var t = polygons_1[_i];
        try {
            var translated = t.map(function (vert) {
                var hash = vert.map(function (v) { return v.toFixed(5); }).join(' ');
                if (vertexCache.has(hash)) {
                    return vertexCache.get(hash);
                }
                else {
                    var index = vertices.length;
                    vertices.push(vert);
                    vertexCache.set(hash, index);
                    return index;
                }
            });
            faces.push(translated);
        }
        catch (e) {
            error++;
        }
    }
    if (error > 0) {
        console.warn(error, 'polygon(s) contains undefined verticies, skipped');
    }
    console.log("faces", faces.length);
    console.log("vertices", vertices.length);
    return { vertices: vertices, faces: faces };
}
exports.processPolygons = processPolygons;
//# sourceMappingURL=process-mesh.js.map