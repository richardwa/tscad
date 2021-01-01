/// <reference path="../types.d.ts" />

import { Cube, Edge, Corner } from './cubetrees';
import { cubeVerts } from './marchingcubes-tables';
import { Vector } from './math';
import { CubeCorners, divideVolume, findVertex } from './util';
export type Bounds = [Vec3, Vec3];
export type Triangle = [Vec3, Vec3, Vec3];

type SurfaceNetCube = Cube<Vec3, number, number>;
type SurfaceNetEdge = Edge<Vec3, number, number>;
type SurfaceNetCorner = Corner<Vec3, number, number>;

export class SurfaceNets {
  triangles: Triangle[] = [];
  cubeSize: number;
  fn: Shape3;

  constructor(cubeSize: number, shape: Shape3) {
    this.cubeSize = cubeSize;
    this.fn = shape;
  }


  doMarch = (bounds: Bounds) => {
    const baseCube = new Cube<Vec3, number, number>(bounds);
    this.findVertices(baseCube);
    baseCube.forEachLeafEdge((edge: SurfaceNetEdge) => {
      if (edge.data) {
        const quad = edge.cubes.map(c => c.data);
        if (edge.corner0 > 0) {
          this.triangles.push(quad);
        } else {
          this.triangles.push(quad.reverse());
        }
      }
    });
  };

  findVertices = (cube: SurfaceNetCube) => {
    const results = cube.corners.map(c => this.fn(c.pos));
    const lower = cube.corners[0].pos;
    const upper = cube.corners[6].pos;
    const lengths = new Vector(upper).minus(lower).result;
    const maxLen = Math.max(...lengths);

    // optimization, this cube is far away from an edge relative to its own size
    // we can skip it even when this cube is above the min size
    if (Math.min(...results.map(Math.abs)) > maxLen) {
      return;
    }

    // base case, we are small enought to find a vertex
    if (maxLen <= this.cubeSize) {
      const cubeIndex = results.reduce(reduceCorners, 0);
      if (cubeIndex === 0xff || cubeIndex === 0x00) {
        return;
      }

      //const center = new Vector(corners[0]).add(corners[6]).scale(1 / 2).result;
      const center = findVertex(cubeIndex, cube.corners.map(c => c.pos) as OctArray<Vec3>, results);
      cube.data = center;
      // terminate recursion
      return;
    }

    // recursion
    cube.split().forEach(this.findVertices)

  }
}
