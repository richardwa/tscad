import { union } from '../csg/boolean';
import { rotate, translate } from '../csg/manipulate';
import { Box, Shpere } from '../csg/primitives';
import { processPolygons, writeOBJ } from '../src/render';
import { SurfaceNets } from '../src/surfacenets';

const shape = Box(20);
/* 
const shape = rotate('y', 15, rotate('z', 16,
  union({ radius: 3 },
    Box(20.2),
    translate([10, 10, 10], Shpere(10)))));
*/

const s = 12;
console.time('render');
const surfacenets = new SurfaceNets(10, shape);
surfacenets.doMarch([[-s, -s, -s], [s, s, s]]);
console.timeEnd('render');

const mesh = processPolygons(surfacenets.triangles);
writeOBJ({ faces: mesh.faces, vertices: mesh.vertices, name: 'surfacenets' });




