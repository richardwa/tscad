/// <reference path="../types.d.ts" />

import { Cube, Edge, Corner, createCube } from './cubetrees';
import { Vector } from './math';
import { findVertex } from './util';

export type Bounds = [Vec3, Vec3];
export type Triangle = [Vec3, Vec3, Vec3];

const reduceCorners = (a: number, v: number, i: number) => {
  if (v > 0) {
    a |= 1 << i;
  }
  return a;
};
export class SurfaceNets {
  triangles: Triangle[] = [];
  minSize: number;
  fn: Shape3;

  constructor(minSize: number, shape: Shape3) {
    this.minSize = minSize;
    this.fn = shape;
  }

  doMarch = (bounds: Bounds) => {
    console.log('bounds', bounds);
    const baseCube = createCube(bounds);
    this.findVertices(baseCube);
    baseCube.getLeafEdges().forEach((edge: Edge) => {
      if (edge.data) {
        const quad = edge.cubes.map(c => c.data);
        if (edge.corners[0].data > 0) {
          this.triangles.push(quad as Triangle);
        } else {
          this.triangles.push(quad.reverse() as Triangle);
        }
      }
    });
  };

  findVertices = (cube: Cube) => {
    console.log(cube.name);
    const corners = cube.getCorners();
    console.log(corners);
    const results = corners.map(c => {
      if (c.data) {
        return c.data
      } else {
        const ans = this.fn(c.pos);
        c.data = ans;
        return ans;
      }
    });
    const lower = corners[0].pos;
    const upper = corners[6].pos;
    const lengths = new Vector(upper).minus(lower).result;
    const maxLen = Math.max(...lengths);

    // optimization, this cube is far away from an edge relative to its own size
    // we can skip it even when this cube is above the min size
    if (Math.min(...results.map(Math.abs)) > maxLen) {
      return;
    }

    // base case, we are small enought to find a vertex
    if (maxLen <= this.minSize) {
      const cubeIndex = results.reduce(reduceCorners, 0);
      if (cubeIndex === 0xff || cubeIndex === 0x00) {
        return;
      }

      //const center = new Vector(corners[0]).add(corners[6]).scale(1 / 2).result;
      const center = findVertex(cubeIndex, corners.map(c => c.pos) as OctArray<Vec3>, results);
      cube.data = center;
      // terminate recursion
      return;
    }

    // recursion
    cube.split().forEach(this.findVertices)

  }
}
