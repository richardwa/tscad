/// <reference path="../types.d.ts" />

import * as fs from 'fs';
import { SurfaceNets } from './surfacenets';

type Props = {
  name: string;
  shape: Shape3;
  cubeSize: number;
  bounds: [Vec3, Vec3];
  outDir?: string;
}

export function render(p: Props) {
  console.time("render");
  const march = new SurfaceNets(p.cubeSize, p.shape);
  march.doMarch(p.bounds);
  console.timeEnd("render");

  const { faces, vertices } = processPolygons(march.triangles);
  const outDir = p.outDir || "./target";
  writeOBJ({ faces, vertices, outDir, name: p.name });
}

type WriteObjProps = {
  faces: number[][];
  vertices: number[][];
  name: string;
  outDir?: string;
};
export function writeOBJ(p: WriteObjProps) {
  const os = fs.createWriteStream(`${p.outDir || './target'}/${p.name}.obj`);

  //write obj file
  for (const pos of p.vertices) {
    os.write("v " + pos.join(' ') + '\n');
  }

  for (const face of p.faces) {
    os.write("f " + face.map(i => i + 1).join(' ') + '\n');
  }

}

export function processPolygons(polygons: Vec3[][]) {
  const vertexCache: Map<string, number> = new Map();
  const vertices: Vec3[] = [];
  const faces: number[][] = [];

  for (const t of polygons) {
    const translated = t.map(vert => {
      const hash = vert.map(v => v.toFixed(5)).join(' ');
      if (vertexCache.has(hash)) {
        return vertexCache.get(hash);
      } else {
        const index = vertices.length;
        vertices.push(vert);
        vertexCache.set(hash, index);
        return index;
      }
    });
    faces.push(translated);
  }

  console.log("faces", faces.length);
  console.log("vertices", vertices.length);

  return { vertices, faces };

}
