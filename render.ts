import * as fs from 'fs';
import marchingCubes, { Bounds, Vec3 } from './lib/marchingcubes';
import { Shape3 } from './lib/primitives';

const file = process.argv[2];
const filename = file.split('/').slice(-1).join();
const name = filename.split('.').slice(0, -1).join('.');

import(file).then(({ default: fn }) => {

  const shape: Shape3 = fn;
  const resolution: Vec3 = [100, 100, 100];
  const bounds: Bounds = [[-1.1, -1.1, -1.1], [1.1, 1.1, 1.1]];

  const mesh = marchingCubes(resolution, shape, bounds);
  const faces = mesh.faces;
  const vertices = mesh.vertices;

  const os = fs.createWriteStream(`target/${name}.obj`);


  //write obj file
  for (const pos of vertices) {
    os.write("v " + pos.join(' ') + '\n');
  }

  for (const face of faces) {
    os.write("f " + face.map(i => i + 1).join(' ') + '\n');
  }
})
