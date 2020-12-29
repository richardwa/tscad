/// <reference path="../types.d.ts" />

import { llog, log } from './debug';
import { cubeVerts, edgeIndex, edgeTable } from './marchingcubes-tables';
import { Vector } from './math';
import { ScalableSquare, createSquare, combine4Squares, Square4 } from './treesquares';
export type Bounds = [Vec3, Vec3];
export type Triangle = [Vec3, Vec3, Vec3];
export type CubeCorners = [Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3]; // eight corners

type Cube = {
  corners: CubeCorners;
  cornerResults: number[];
  type: number;
  generation: number;
  pos: Vec3;
}

export type CubeFace = ScalableSquare<Cube>;
type CubeSurface = [CubeFace, CubeFace, CubeFace, CubeFace, CubeFace, CubeFace];
const emptyFace: CubeFace = createSquare<Cube>(null);
const emptyCube: CubeSurface = [emptyFace, emptyFace, emptyFace, emptyFace, emptyFace, emptyFace];
const reduceCorners = (a: number, v: number, i: number) => {
  if (v > 0) {
    a |= 1 << i;
  }
  return a;
};
const cubeQuads = [
  [0, 3, 4, 7], // left
  [1, 2, 5, 6], // right
  [0, 1, 4, 5], // front
  [3, 2, 7, 6], // back
  [0, 1, 3, 2], // bottom
  [4, 5, 7, 6],  // top
];

// create a cube from 2 points
const makeCube = ([a, b, c]: Vec3, [i, j, k]: Vec3): CubeCorners => [
  [a, b, c], [i, b, c], [i, j, c], [a, j, c],
  [a, b, k], [i, b, k], [i, j, k], [a, j, k]
];

// divides a cube into 8 sections.  0,1,2,3 bottom cubes; 4,5,6,7 top cubes (same indexing as CubeCorners)
const divideVolume = (pos: CubeCorners): CubeCorners[] => {
  const lower = pos[0];
  const upper = pos[6];
  const center = new Vector(lower).add(upper).scale(1 / 2).result;
  const [a, b, c] = lower;
  const [i, j, k] = center;
  const [x, y, z] = upper;
  return [
    makeCube([a, b, c], [i, j, k]), makeCube([i, b, c], [x, j, k]), makeCube([i, j, c], [x, y, k]), makeCube([a, j, c], [i, y, k]),
    makeCube([a, b, k], [i, j, z]), makeCube([i, b, k], [x, j, z]), makeCube([i, j, k], [x, y, z]), makeCube([a, j, k], [i, y, z])
  ];
}

const axisDirectionMasks: number[][] = [
  [6, 5], [6, 2],
  [7, 6], [6, 2],
  [7, 6], [6, 5]
].map(i => i.map(j => 1 << j));

export class SurfaceNets {
  triangles: Triangle[] = [];
  cubeSize: number;
  fn: Shape3;

  constructor(cubeSize: number, shape: Shape3) {
    this.cubeSize = cubeSize;
    this.fn = shape;
  }

  putQuad = (a: Vec3, b: Vec3, c: Vec3, d: Vec3) => {
    this.triangles.push([a, b, c], [c, b, d]);
  }

  findVertex = (cubeType: number, pos: CubeCorners, results: number[]): Vec3 => {
    // get intercepts
    const edgeMask = edgeTable[cubeType];
    if (edgeMask === 0) {
      return;
    }
    const intercepts: Vec3[] = [];
    for (let i = 0; i < edgeIndex.length; i++) {
      if ((edgeMask & 1 << i) === 0) {
        continue;
      }
      // vertices
      const [vertexType1, vertexType2] = edgeIndex[i];
      const p1 = pos[vertexType1];
      const v1 = results[vertexType1];
      const p2 = pos[vertexType2];
      const v2 = results[vertexType2];
      const ans = this.interpolate(p1, v1, p2, v2);
      intercepts.push(ans);
    }

    const vert = new Vector(intercepts[0]);
    for (let i = 1; i < intercepts.length; i++) {
      vert.add(intercepts[i]);
    }
    return vert.scale(1 / intercepts.length).result;
  }

  interpolate = (p1: Vec3, v1: number, p2: Vec3, v2: number) => {
    // the points are coming in from a cube, find the axis we are moving on
    const limit = 16;
    // we can use this trick, we are on axis cubes, otherwise full vector math is required
    const axis = p1[0] !== p2[0] ? 0 : (p1[1] !== p2[1] ? 1 : 2);
    const temp = [...p1] as Vec3;
    let low = p1[axis];
    let high = p2[axis];
    for (let i = 0; i < limit; i++) {
      const middle = (low + high) / 2;
      temp[axis] = middle;
      const midVal = this.fn(temp);
      if (Math.abs(midVal) < 0.2) {
        break;
      } else if (Math.sign(midVal) === Math.sign(v1)) {
        low = middle;
        v1 = midVal
      } else {
        high = middle;
        v2 = midVal;
      }
      if (i === limit - 1) {
        console.log("reached limit of interpolation", axis, temp, p1, v1, p2, v2);
      }
    }
    return temp;
  }

  doMarch = (bounds: Bounds) => {
    const [lower, upper] = bounds;
    // evaluate this cube
    const vertexPositions = cubeVerts.map(v =>
      v.map((o: number, i: number) =>
        o ? upper[i] : lower[i]) as Vec3);

    this._doMarch(vertexPositions as CubeCorners, 0);
  };

  _doMarch = (corners: CubeCorners, generation: number): CubeSurface => {
    const results = corners.map(this.fn);

    const lower = corners[0];
    const upper = corners[6];
    const lengths = new Vector(upper).minus(lower).result;
    const maxLen = Math.max(...lengths);

    // optimization, this cube is far away from an edge relative to its own size
    // we can skip it even when this cube is above the min size
    if (Math.min(...results.map(Math.abs)) > maxLen) {
      return emptyCube;
    }

    // base case, we are small enought to find a vertex
    if (maxLen <= this.cubeSize) {
      const cubeIndex = results.reduce(reduceCorners, 0);
      if (cubeIndex === 0xff || cubeIndex === 0x00) {
        return emptyCube;
      }

      const center = new Vector(corners[0]).add(corners[6]).scale(1 / 2).result;
      //const center = this.findVertex(cubeIndex, corners, results);
      //const val = this.fn(center);
      //if (Math.abs(val) < 0.5) {
      const cubeFace: CubeFace = createSquare({
        corners,
        generation,
        cornerResults: results,
        type: cubeIndex,
        pos: center
      });

      // terminate recursion
      return [cubeFace, cubeFace, cubeFace, cubeFace, cubeFace, cubeFace];
      //}
    }

    // recursion
    const subResults = divideVolume(corners).map(c => this._doMarch(c, generation + 1));

    // output polygons on interior faces
    for (let axis = 0; axis < 3; axis++) {
      const a = cubeQuads[axis * 2].map(n => subResults[n][axis * 2 + 1]);
      const b = cubeQuads[axis * 2 + 1].map(n => subResults[n][axis * 2]);
      // 4 quad pairs
      for (let i = 0; i < a.length; i++) {
        const left = a[i]; // not nessasily left, but should be lower side of the face pairs
        const right = b[i];
        const longer = left.size <= right.size ? left : right;
        const shorter = left !== longer ? left : right;
        const ratio = shorter.size / longer.size;
        const rowSize = Math.floor(Math.sqrt(longer.size)); // we only have square shaped faces

        const search = (offset: number, cube: Cube, match: Cube, mask: number[]) => {
          const corner1 = cube.type & mask[0];
          const corner2 = cube.type & mask[1];
          if (corner1 !== corner2) {
            const cube2 = longer.get(offset);
            const match2 = shorter.get(Math.floor((offset) / ratio));
            if (cube2 && match2) {
              this.putQuad(cube.pos, match.pos, cube2.pos, match2.pos);
            }
          }
        }

        const searchFaces0 = axisDirectionMasks[2 * axis];
        const searchFaces1 = axisDirectionMasks[2 * axis + 1];
        // iterate over the longer side (i.e smaller cubes)
        longer.forEach((cube, i) => {
          const match = shorter.get(Math.floor(i / ratio));
          if (!match) {
            return;
          }
          search(i + 1, cube, match, searchFaces0);
          search(i + rowSize, cube, match, searchFaces1);
        });
      }
    }

    // combine and return exterior faces
    const newSurface = new Array(6) as CubeSurface;

    // foreach face direction
    for (let f = 0; f < newSurface.length; f++) {
      const quads = cubeQuads[f].map(c => subResults[c][f]) as Square4<Cube>;
      newSurface[f] = combine4Squares(quads);
    }
    return newSurface;
  }
}
