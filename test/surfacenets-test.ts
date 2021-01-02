import { union } from '../csg/boolean';
import { rotate, translate } from '../csg/manipulate';
import { box, sphere } from '../csg/primitives';
import { processPolygons, writeOBJ } from '../src/render';
import { SurfaceNets } from '../src/surfacenets2';

// const shape = Box(30);
const shape = rotate('y', 15, rotate('z', 45,
  union({ radius: 3 },
    box(30),
    translate([10, 10, 10], sphere(15))
  )));

const s = 32;
console.time('render');
const surfacenets = new SurfaceNets(12, shape);
surfacenets.doMarch([[-s, -s, -s], [s, s, s]]);
console.timeEnd('render');

const mesh = processPolygons(surfacenets.triangles);
writeOBJ({ faces: mesh.faces, vertices: mesh.vertices, name: 'surfacenets' });
