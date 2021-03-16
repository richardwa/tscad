/// <reference path="../../types.d.ts" />

import { union } from '../csg/boolean';
import { rotate, translate } from '../csg/manipulate';
import { box, sphere } from '../csg/primitives';
import { slice } from './march-squares';
import { processPolygons, writeOBJ } from '../util/render';

const shape = rotate('y', 0, rotate('z', 0,
  union({ radius: 3 },
    box(20.2),
    translate([10, 10, 10], sphere(10)))));

console.time('render');
const faces = slice({
  layerHeight: .2,
  height: 30,
  size: 2,
  shape,
});
console.timeEnd('render');

const mesh = processPolygons(faces);
writeOBJ({ faces: mesh.faces, vertices: mesh.vertices, name: 'march-squares' });
