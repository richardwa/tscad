/// <reference path="../types.d.ts" />

import { llog, log } from './debug';
import { cubeVerts, edgeIndex, edgeTable } from './marchingcubes-tables';
import { CubeCorners, divideVolume, Vector } from './math';
import { ScalableSquare, createSquare, combine4Squares, Square4, printSquare, getSize, scaleSquare, getLine } from './treesquares';
export type Bounds = [Vec3, Vec3];
export type Triangle = [Vec3, Vec3, Vec3];

type Neighbors = [Set<Cube>, Set<Cube>, Set<Cube>];
type Cube = {
  corners: CubeCorners;
  cornerResults: number[];
  type: number;
  pos: Vec3;
  neightbors: [Neighbors, Neighbors]
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
  [4, 5, 7, 6], // top
];
const axisDirectionMasks: number[][][] = [
  [[0, 1], [3, 2], [7, 6], [4, 5]],
  [[0, 3], [1, 2], [5, 6], [4, 7]],
  [[0, 4], [1, 5], [2, 6], [3, 7]]
].map((i: number[][]) => i.map(j => j.map(k => 1 << k)));

const checkCube = (cube: Cube, axis: number, corner: number): number => {
  const pair = axisDirectionMasks[axis][corner % 4];
  const corner1 = cube.type & pair[0];
  const corner2 = cube.type & pair[1];
  if (corner1 < corner2) {
    return 1;
  } else if (corner1 > corner2) {
    return -1;
  } else {
    return 0;
  }
}

export class SurfaceNets {
  triangles: Triangle[] = [];
  vecticies: Cube[] = [];
  cubeSize: number;
  fn: Shape3;

  constructor(cubeSize: number, shape: Shape3) {
    this.cubeSize = cubeSize;
    this.fn = shape;
  }

  putTriangles = (cube: Cube, neighbors: Cube[], reverse: boolean) => {
    let head = neighbors[0];
    for (let i = 1; i < neighbors.length; i++) {
      if (reverse) {
        this.triangles.push([cube.pos, neighbors[i].pos, head.pos]);
      } else {
        this.triangles.push([cube.pos, head.pos, neighbors[i].pos]);
      }
      head = neighbors[i];
    }
  }

  doMarch = (bounds: Bounds) => {
    const [lower, upper] = bounds;
    // evaluate this cube
    const vertexPositions = cubeVerts.map(v =>
      v.map((o: number, i: number) =>
        o ? upper[i] : lower[i]) as Vec3);

    this._doMarch(vertexPositions as CubeCorners, "");

    console.log(this.vecticies.length);

    this.vecticies.forEach(cube => {
      for (let axis = 0; axis < 3; axis++) {
        const nextAxis = (axis + 1) % 3;
        const nextAxis2 = (nextAxis + 1) % 3;
        for (let i = 0; i < 2; i++) {
          const baseCorner = i * 2;
          const check = checkCube(cube, axis, baseCorner + 2);
          if (check !== 0) {
            const right = Array.from(cube.neightbors[i][nextAxis])
              .filter(c => checkCube(c, axis, baseCorner + 3) !== 0);
            const top = Array.from(cube.neightbors[i][nextAxis2])
              .filter(c => checkCube(c, axis, baseCorner + 2) !== 0);
            this.putTriangles(cube, [...right, ...top], check === -1);
          }
        }
      }
    });
  };

  _doMarch = (corners: CubeCorners, name: string): CubeSurface => {
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
      if (true && name !== "071") {
        const cube: Cube = {
          corners,
          cornerResults: results,
          type: cubeIndex,
          pos: center,
          neightbors: [[new Set(), new Set(), new Set()], [new Set(), new Set(), new Set()]]
        };
        this.vecticies.push(cube);
        const cubeFace: CubeFace = createSquare(cube);
        // terminate recursion
        return [cubeFace, cubeFace, cubeFace, cubeFace, cubeFace, cubeFace];
      }
    }

    // recursion
    const subResults = divideVolume(corners).map((c, i) => this._doMarch(c, `${name}${i}`));

    // assign neighbors on interior faces
    for (let axis = 0; axis < 3; axis++) {
      const a = cubeQuads[axis * 2].map(n => subResults[n][axis * 2 + 1]);
      const b = cubeQuads[axis * 2 + 1].map(n => subResults[n][axis * 2]);
      for (let i = 0; i < 4; i++) {
        const size = Math.max(a[i].size, b[i].size);
        const left = scaleSquare(a[i], size);
        const right = scaleSquare(b[i], size);
        left.forEach((cube, x, y) => {
          const match = right.get(x, y);
          if (cube && cube.pos && match && match.pos) {
            cube.neightbors[0][axis].add(match);
            match.neightbors[1][axis].add(cube);
          }
        });
      }
    }

    // combine and return exterior faces
    const newSurface = new Array(6) as CubeSurface;
    for (let f = 0; f < newSurface.length; f++) {
      const quads = cubeQuads[f].map(c => subResults[c][f]) as Square4<Cube>;
      newSurface[f] = combine4Squares(quads);
    }
    return newSurface;
  }
}
