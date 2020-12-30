import { union } from '../csg/boolean';
import { rotate, translate } from '../csg/manipulate';
import { Box, Sphere } from '../csg/primitives';
import { processPolygons, writeOBJ } from '../src/render';
import { SurfaceNets } from '../src/surfacenets';

const shape = Box(30);
  //  const shape = rotate('y', 16, rotate('z', 25,
  // union({ radius: 3 },
  //   Box(20),
  //   translate([10, 10, 10], Sphere(10))
  // )));

const s = 32;
console.time('render');
const surfacenets = new SurfaceNets(4, shape);
surfacenets.doMarch([[-s, -s, -s], [s, s, s]]);
console.timeEnd('render');

const mesh = processPolygons(surfacenets.triangles);
writeOBJ({ faces: mesh.faces, vertices: mesh.vertices, name: 'surfacenets' });




