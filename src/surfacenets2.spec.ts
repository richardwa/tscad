import { union } from '../csg/boolean';
import { rotate, translate } from '../csg/manipulate';
import { box, sphere } from '../csg/primitives';
import { processPolygons, writeOBJ } from '../src/render';
import { SurfaceNets } from '../src/surfacenets2';

const shape = rotate('y', 0, rotate('z', 0,
  union({ radius: 3 },
    box(20.2),
    translate([10, 10, 10], sphere(10)))));

const s = 32;
console.time('render');
const surfacenets = new SurfaceNets(1, shape);
surfacenets.doMarch([[-s, -s, -s], [s, s, s]]);
console.timeEnd('render');

const mesh = processPolygons(surfacenets.triangles);
writeOBJ({ faces: mesh.faces, vertices: mesh.vertices, name: 'surfacenets2' });
