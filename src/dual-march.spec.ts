import { union } from '../csg/boolean';
import { rotate, translate } from '../csg/manipulate';
import { box, sphere } from '../csg/primitives';
import { Cube, dualMarch, getDualCubes } from './dual-march';
import { processPolygons, writeOBJ } from './render';
const shape = box(20);
rotate('y', 0, rotate('z', 0,
  union({ radius: 3 },
    box(20.2),
    translate([10, 10, 10], sphere(10)))));

console.time('render');
const faces = dualMarch({
  cubeSize: 4,
  shape,
});
console.timeEnd('render');

const mesh = processPolygons(faces);
writeOBJ({ faces: mesh.faces, vertices: mesh.vertices, name: 'dual-march' });
/*
const makeCube = (c: Vec3, size: number) => [...new Array(8)].map((_, i) => [
  c[0] + ((i & 1) ? 1 : 0) * size,
  c[1] + ((i & 2) ? 1 : 0) * size,
  c[2] + ((i & 4) ? 1 : 0) * size
]) as Cube;


const oct1 = makeCube([0, 0, 0], 1).map(c => makeCube(c, 1));
const oct2 = makeCube([0, 0, 0], 2).map(c => makeCube(c, 2));
const cubes: Cube[] = [
  ...oct1,
  ...oct2.slice(1)
]
console.log('cubes', cubes.length, cubes);
const duals = getDualCubes(cubes);
console.log('duals', duals.length, duals);
*/
