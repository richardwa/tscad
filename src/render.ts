/// <reference path="./types.d.ts" />

import * as fs from 'fs';
import { MarchingCubes } from './marchingcubes';

type Props = {
  name: string;
  shape: Shape3;
  minStep: number;
  maxStep: number;
  bounds: [Vec3, Vec3];
  outDir?: string;
}

export function render(p: Props) {
  console.time("render");
  const march = new MarchingCubes([p.minStep, p.maxStep], p.shape, p.bounds);
  march.doMarch(p.bounds);
  console.timeEnd("render");

  const faces = march.faces;
  const vertices = march.vertices;
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
