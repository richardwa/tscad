import { union } from '../csg/boolean';
import { rotate, translate } from '../csg/manipulate';
import { box, sphere } from '../csg/primitives';
import { dualMarch } from './dual-march';
import { processPolygons, writeOBJ } from './render';

const shape = rotate('y', 15, rotate('z', 45,
  union({ radius: 3 },
    box(20.2),
    translate([10, 10, 10], sphere(10)))));

console.time('render');
const faces = dualMarch({
  cubeSize: 2,
  shape,
});
console.timeEnd('render');

const mesh = processPolygons(faces);
writeOBJ({ faces: mesh.faces, vertices: mesh.vertices, name: 'dual-march' });
