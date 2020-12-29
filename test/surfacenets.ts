import { union } from '../csg/boolean';
import { rotate, translate } from '../csg/manipulate';
import { Box, Sphere } from '../csg/primitives';
import { processPolygons, writeOBJ } from '../src/render';
import { SurfaceNets } from '../src/surfacenets';

// const shape = Box(20);
const shape = rotate('y', 0, rotate('z', 0,
  union({ radius: 3 },
    Box(18),
   // translate([10, 10, 10], Shpere(10))
    )));

const s = 16;
console.time('render');
const surfacenets = new SurfaceNets(16, shape);
surfacenets.doMarch([[-s, -s, -s], [s, s, s]]);
console.timeEnd('render');

const mesh = processPolygons(surfacenets.triangles);
writeOBJ({ faces: mesh.faces, vertices: mesh.vertices, name: 'surfacenets' });




