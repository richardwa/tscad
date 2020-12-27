import { union } from '../csg/boolean';
import { rotate, translate } from '../csg/manipulate';
import { Box, Shpere } from '../csg/primitives';
import { processPolygons, writeOBJ } from '../src/render';
import { SurfaceNets } from '../src/surfacenets';

const shape = Box(25);

const s = 24;
console.time('render');
const surfacenets = new SurfaceNets(13, shape);
surfacenets.doMarch([[-s, -s, -s], [s, s, s]]);
console.timeEnd('render');

const mesh = processPolygons(surfacenets.triangles);
writeOBJ({ faces: mesh.faces, vertices: mesh.vertices, name: 'surfacenets' });




