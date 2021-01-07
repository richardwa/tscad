import { sphere, box, circle, rect } from '../csg/primitives';
import { union } from '../csg/boolean';
import { processPolygons, render, writeOBJ } from './render';
import { revolve, tile } from '../csg/extrude';
import { rotate, translate } from '../csg/manipulate';
import { MarchingCubes } from './marchingcubes';

const shape = rotate('y', 0, rotate('z', 0,
  union({ radius: 3 },
    box(20.2),
    translate([10, 10, 10], sphere(10)))));


const s = 32;
console.time('render');
const f = new MarchingCubes(1, shape);
f.doMarch([[-s, -s, -s], [s, s, s]]);
console.timeEnd('render');

const mesh = processPolygons(f.triangles);
writeOBJ({ faces: mesh.faces, vertices: mesh.vertices, name: 'marchingcubes' });