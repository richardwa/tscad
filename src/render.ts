/// <reference path="./types.d.ts" />

import * as fs from 'fs';
import { MarchingCubes, Triangle } from './marchingcubes';

type Props = {
  name: string;
  shape: Shape3;
  cubeSize: number;
  bounds: [Vec3, Vec3];
  outDir?: string;
}


export function render(p: Props) {
  console.time("render");
  const march = new MarchingCubes(p.cubeSize, p.shape);
  march.doMarch(p.bounds);
  console.timeEnd("render");

  const { faces, vertices } = processTriangles(march.triangles)
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

function processTriangles(triangles: Triangle[]) {
  const vertexCache: Map<string, number> = new Map();
  const vertices: Vec3[] = [];
  const faces: Vec3[] = []; // holds 3 vertex indexes
  for (const t of triangles) {
    const translated = t.map(vert => {
      const hash = vert.join(' ');
      if (vertexCache.has(hash)) {
        return vertexCache.get(hash);
      } else {
        const index = vertices.length;
        vertices.push(vert);
        vertexCache.set(hash, index);
        return index;
      }
    }) as Vec3;
    faces.push(translated);
  }

  return { vertices, faces };

}
