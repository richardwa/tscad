/// <reference path="../types.d.ts" />

import { Cube, edgePairs, normalDirections } from './cubetree';
import { Vector } from './math';

export type Bounds = [Vec3, Vec3];
export type Triangle = [Vec3, Vec3, Vec3];

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

export class SurfaceNets {
  triangles: Triangle[] = [];
  vertices: Cube<Data>[] = [];
  cubeSize: number;
  fn: Shape3;

  constructor(cubeSize: number, shape: Shape3) {
    this.cubeSize = cubeSize;
    this.fn = shape;
  }

  doMarch = (bounds: Bounds) => {
    const cube = new Cube<Data>([], null);
    cube.data = { corners: boundsToCorners(bounds) }
    this.findVertices(cube);
    this.vertices.forEach(cube => {
      for (let axis = 0; axis < 3; axis++) {
        const corner0 = cube.data.results[7 & ~(1 << axis)];
        const corner1 = cube.data.results[7];
        if (hasIntersections([corner0, corner1])) {
          const dir = normalDirections[axis];
          const c1 = cube.getNeighbor(dir[0]);
          const c2 = cube.getNeighbor(dir[1]);
          const c3 = c2.getNeighbor(dir[0]);
          if (corner0 < corner1) {
            this.triangles.push([cube.data.center, c1.data.center, c2.data.center]);
            this.triangles.push([c3.data.center, c2.data.center, c1.data.center]);
          } else {
            this.triangles.push([cube.data.center, c2.data.center, c1.data.center]);
            this.triangles.push([c3.data.center, c1.data.center, c2.data.center]);
          }
        }
      }
    });
  };

  findVertices = (cube: Cube<Data>) => {
    const corners = cube.data.corners;
    const results = corners.map(this.fn) as OctArray<number>;
    cube.data.results = results;
    const maxLen = Math.max(...new Vector(corners[7]).minus(corners[0]).result);

    // optimization, this cube is far away from an edge relative to its own size
    // we can skip it even when this cube is above the min size
    if (Math.min(...results.map(Math.abs)) > maxLen) {
      return;
    }

    // base case, we are small enought to find a vertex
    if (maxLen <= this.cubeSize) {
      if (!hasIntersections(results)) {
        return;
      }
      // const center = new Vector(corners[0]).add(corners[7]).scale(1 / 2).result;
      const center = findCenter(corners, results);
      // const val = this.fn(center);
      cube.data.center = center;
      this.vertices.push(cube);
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
    }).forEach(this.findVertices);
  }
}

const findCenter = (corners: OctArray<Vec3>, results: OctArray<number>) => {
  const intersections: Vec3[] = [];
  edgePairs.forEach(([i, j]) => {
    if (Math.sign(results[i]) !== Math.sign(results[j])) {
      const v1 = corners[i];
      const v2 = corners[j];

      const diff = new Vector(v2).minus(v1);
      const total = Math.abs(results[i]) + Math.abs(results[j]);
      intersections.push(diff.scale(Math.abs(results[i]) / total).add(v1).result);
    }
  });
  const result = new Vector(intersections[0]);
  for (let i = 1; i < intersections.length; i++) {
    result.add(intersections[i]);
  }
  return result.scale(1 / intersections.length).result;
}