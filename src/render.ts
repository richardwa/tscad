/// <reference path="./types.d.ts" />

import * as fs from 'fs';
import march from './marchingcubes';

type Props = {
  name: string;
  shape: Shape3;
  stepSize: number;
  bounds: [Vec3, Vec3];
  outDir?: string;
}

export function render(p: Props) {
  console.time("render");
  const mesh = march(p.stepSize, p.shape, p.bounds);
  console.timeEnd("render");

  const faces = mesh.faces;
  const vertices = mesh.vertices;
  const outDir = p.outDir || "./target";
  const os = fs.createWriteStream(`${outDir}/${p.name}.obj`);

  //write obj file
  for (const pos of vertices) {
    os.write("v " + pos.join(' ') + '\n');
  }

  for (const face of faces) {
    os.write("f " + face.map(i => i + 1).join(' ') + '\n');
  }
}
