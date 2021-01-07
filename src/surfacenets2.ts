/// <reference path="../types.d.ts" />

import { ServerStreamFileResponseOptionsWithError } from 'http2';
import { Cube, edgePairs, normalDirections, pushBits } from './cubetree';
import { Vector } from './math';

export type Bounds = [Vec3, Vec3];

type Data = {
  corners: OctArray<Vec3>;
  results?: OctArray<number>;
  center?: Vec3;
};

const boundsToCorners = (b: Bounds) => {
  const corners = new Array<Vec3>(8);
  for (let i = 0; i < 8; i++) {
    corners[i] = [
      b[i & 1][0],
      b[(i & 2) >> 1][1],
      b[(i & 4) >> 2][2]
    ];
  }
  return corners as OctArray<Vec3>;
}

const hasIntersections = (n: number[]) => {
  const sign = n[0] > 0;
  for (let i = 1; i < n.length; i++) {
    if ((n[i] > 0) !== sign) {
      return true;
    }
  }
  return false;
}

const findCenter = (corners: OctArray<Vec3>, results: OctArray<number>, fn: Shape3): Vec3 => {
  const intersections: Vec3[] = [];
  edgePairs.forEach(([i, j]) => {
    if (hasIntersections([results[i], results[j]])) {
      const v1 = corners[i];
      const v2 = corners[j];
      const diff = new Vector(v2).minus(v1);
      const total = Math.abs(results[i]) + Math.abs(results[j]);
      intersections.push(diff.scale(Math.abs(results[i]) / total).add(v1).result);
    }
  });
  const avg = new Vector(intersections[0]);
  for (let i = 1; i < intersections.length; i++) {
    avg.add(intersections[i]);
  }
  return avg.scale(1 / intersections.length).result;
  // const normal = new Vector(intersections[0]).minus(intersections[1]);
  // const e2 = new Vector(intersections[0]).minus(intersections[2]);
  // normal.cross(e2.result).toUnitVector();
  // const val = fn(avg.result);
  // return normal.scale(-val).add(avg.result).result;
}

type Props = {
  cubeSize: number;
  shape: Shape3;
  bounds?: Bounds;
}

export function SurfaceNets(p: Props) {
  const faces: Vec3[][] = [];
  const vertices: Cube<Data>[] = [];
  const cubeSize: number = p.cubeSize;
  const shape: Shape3 = p.shape;
  const bounds = p.bounds || [[-500, -500, -500], [500, 500, 500]];


  const findVertices = (cube: Cube<Data>) => {
    const corners = cube.data.corners;
    const results = corners.map(shape) as OctArray<number>;
    cube.data.results = results;
    const maxLen = Math.max(...new Vector(corners[7]).minus(corners[0]).result);

    // optimization, this cube is far away from an edge relative to its own size
    // we can skip it even when this cube is above the min size
    if (Math.min(...results.map(Math.abs)) > maxLen) {
      return;
    }

    // base case, we are small enought to find a vertex
    if (maxLen <= cubeSize) {
      if (!hasIntersections(results)) {
        return;
      }
      // const center = new Vector(corners[0]).add(corners[7]).scale(1 / 2).result;
      const center = findCenter(corners, results, shape);
      // const val = this.fn(center);
      cube.data.center = center;
      vertices.push(cube);
      return;
    }

    // recursion
    const center = new Vector(corners[0]).add(corners[7]).scale(1 / 2).result;
    const diff = new Vector(center).minus(corners[0]).result;
    cube.split().map((ch, i) => {
      const offset: Vec3 = [
        (i & 1) > 0 ? diff[0] : 0,
        (i & 2) > 0 ? diff[1] : 0,
        (i & 4) > 0 ? diff[2] : 0
      ];
      ch.data = {
        corners: boundsToCorners([
          new Vector(corners[0]).add(offset).result,
          new Vector(center).add(offset).result
        ])
      }
      return ch;
    }).forEach(findVertices);
  };

  const cube = new Cube<Data>([], null);
  cube.data = { corners: boundsToCorners(bounds) }
  findVertices(cube);
  let error = 0;
  vertices.forEach(cube => {
    for (let axis = 0; axis < 3; axis++) {
      const corner0 = cube.data.results[pushBits[axis * 2](7)];
      const corner1 = cube.data.results[7];
      if (hasIntersections([corner0, corner1])) {
        try {
          const normals = normalDirections[axis * 2 + 1];
          const c1 = cube.getNeighbor(normals[0]);
          const c2 = cube.getNeighbor(normals[1]);
          const c3 = c2.getNeighbor(normals[0]);
          const quad = [cube.data.center, c1.data.center, c3.data.center, c2.data.center];
          faces.push(corner0 < corner1 ? quad : quad.reverse());
        } catch (e) {
          error++;
        }
      }
    }
  });
  if (error > 0) {
    console.warn(`encountered missing neighbors on ${error} cubes`);
  }

  return faces;
}
