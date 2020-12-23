/// <reference path="./types.d.ts" />

import * as fs from 'fs';
import { MarchingCubes, Triangle } from './marchingcubes';
import { Vector } from './math';
import { MeshBuilder, Face } from './mesh';

type Props = {
  name: string;
  shape: Shape3;
  cubeSize: number;
  bounds: [Vec3, Vec3];
  outDir?: string;
}


function getFaceNormal(f: Face) {
  const v1 = new Vector(f.id[0].id).minus(f.id[1].id);
  const v2 = new Vector(f.id[1].id).minus(f.id[2].id);
  return v1.cross(v2.result);
}

function refineMesh(mesh: MeshBuilder, fn: Shape3, tolerance: number) {
  const edges = mesh.getEdges();

  const rank = edges.map(e => {
    const p1 = e.id[0].id;
    const p2 = e.id[1].id;
    const middle = new Vector(p1).add(p2).scale(1 / 2).result;
    const midVal = fn(middle);
    const absVal = Math.abs(midVal);
    if (absVal > tolerance) {
      return { e, midVal, absVal };
    } else {
      return null;
    }
  }).filter(o => o !== null);

  rank.sort((a, b) => b.absVal - a.absVal);
  console.log(rank.length, rank.slice(0, 10));

  rank.slice(0, 1).forEach(a => {
    mesh._removeEdge(a.e);

    
  })

}

export function render(p: Props) {
  console.time("render");
  const march = new MarchingCubes(p.cubeSize, p.shape);
  march.doMarch(p.bounds);
  console.timeEnd("render");


  // step 2 refine triangles
  refineMesh(march.mesh, p.shape, 0.01);


  const { faces, vertices } = processTriangles(march.mesh.viewFaces())
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

function processTriangles(triangles: Vec3[][]) {
  const vertexCache: Map<string, number> = new Map();
  const vertices: Vec3[] = [];
  const faces: Vec3[] = [];

  for (const t of triangles) {
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
    }) as Vec3;
    faces.push(translated);
  }

  console.log("faces", faces.length);
  console.log("vertices", vertices.length);

  return { vertices, faces };

}
