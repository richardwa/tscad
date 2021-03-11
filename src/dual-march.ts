/// <reference path="../types.d.ts" />
import { Cube, Direction, edgePairs, normalDirections, Position, pushBits } from './cubetree';
import { edgeTable, triTable } from './marching-cubes-tables';
import { getSurfaceNormal, Vector } from './math';
import { SpatialIndex } from './spatial-index';

export type Bounds = [Vec3, Vec3];

type Data = {
  corners: OctArray<Vec3>;
  center?: Vec3;
};
type Props = {
  cubeSize: number;
  shape: Shape3;
  bounds?: Bounds;
}
const edges: Array12<Vec2> = [
  [0, 1], [1, 3], [3, 2], [2, 0],
  [4, 5], [5, 7], [7, 6], [6, 4],
  [0, 4], [1, 5], [3, 7], [2, 6]
];

const boundsToCorners = ([[a, b, c], [x, y, z]]: Bounds) => [
  [a, b, c], [x, b, c], [a, y, c], [x, y, c],
  [a, b, z], [x, b, z], [a, y, z], [x, y, z]
] as OctArray<Vec3>;

const splitCube = (cube: Cube<Data>): Cube<Data>[] => {
  const corners = cube.data.corners;
  const center = new Vector(corners[0]).add(corners[7]).scale(1 / 2).result;
  const diff = new Vector(center).minus(corners[0]).result;
  return cube.split().map((ch, i) => {
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
  });
}

const validSignatures = new Set([0b01010101, 0b001100110011, 0b00001111]);
const getSignature = (a: number, v: any, i: number) => {
  if (v) {
    a |= 1 << i;
  }
  return a;
}
const getResultIndex = (a: number, v: number, i: number) => {
  if (v > 0) {
    a |= 1 << i;
  }
  return a;
}

const processDual = (dual: OctArray<Vec3>, fn: Shape3) => {
  const results = dual.map(fn) as OctArray<number>;
  const cube_index = results.reduce(getResultIndex, 0);
  const edge_mask = edgeTable[cube_index];
  if (edge_mask === 0) {
    return;
  }
  const fnZeros: Array12<Vec3> = [] as any;
  edges.forEach(([n, m], i) => {
    if ((edge_mask & 1 << i) > 0) {
      const v1 = dual[n];
      const v2 = dual[m];
      const diff = new Vector(v2).minus(v1);
      const total = Math.abs(results[n]) + Math.abs(results[m]);
      fnZeros[i] = diff.scale(Math.abs(results[n]) / total).add(v1).result;
    }
  });

  //Add faces
  const triCorners = triTable[cube_index];
  const triangles: Vec3[][] = []
  for (let i = 0; i < triCorners.length; i += 3) {
    triangles.push([
      fnZeros[triCorners[i]],
      fnZeros[triCorners[i + 1]],
      fnZeros[triCorners[i + 2]]
    ]);
  }
  return triangles;
}

const resFn = (n: number) => Math.floor(n / 0.0001);
const keyFn = (n: Vec3) => n.map(resFn).join();

export function dualMarch(p: Props): Vec3[][] {
  const cubeSize: number = p.cubeSize;
  console.log('cube size', cubeSize);

  const bounds = p.bounds || [[-500, -500, -500], [500, 500, 500]];
  const spatialIndex = new SpatialIndex<number>(keyFn);
  const dualMap: Map<string, OctArray<Vec3>> = new Map();

  // cached function
  const shape: Shape3 = (v: Vec3) => {
    const val = spatialIndex.get(v);
    if (!val) {
      const newVal = p.shape(v);
      spatialIndex.set(v, newVal);
      return newVal;
    }
    return val;
  }

  const setDual = (corner: Vec3, i: number, center: Vec3) => {
    const key = keyFn(corner);
    let m = dualMap.get(key);
    if (m === undefined) {
      m = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
      dualMap.set(key, m);
    }
    m[7 - i] = center;
  }

  const findVertices = (cube: Cube<Data>): Cube<Data>[] => {
    const corners = cube.data.corners;
    const results = corners.map(shape) as OctArray<number>;
    const maxLen = Math.max(...new Vector(corners[7]).minus(corners[0]).result);
    const center = new Vector(corners[0]).add(corners[7]).scale(1 / 2).result;
    cube.data.center = center;
    if (maxLen <= cubeSize || Math.min(...results.map(Math.abs)) > maxLen) {
      // base case, we are small enought to find a vertex
      corners.forEach((c, i) => setDual(c, i, center));
      edges.forEach(([a, b]) => {
        spatialIndex.orthoQuery(corners[a], corners[b]).forEach(([c3, val]) => {
          setDual(c3, a, center);
          setDual(c3, b, center);
        })
      })
      return [cube];
    }
    // recursion
    return splitCube(cube).flatMap(findVertices);
  };

  // start process
  const cube = new Cube<Data>([], null);
  cube.data = { corners: boundsToCorners(bounds) }
  findVertices(cube);
  console.log('dual size', dualMap.size);

  const faces: Vec3[][] = [];
  dualMap.forEach((dual) => {
    const signature = dual.reduce(getSignature, 0);
    if (signature === 0xFF) {
      const triangles = processDual(dual, shape);
      if (triangles) {
        faces.push(...triangles);
      }
    } else if (validSignatures.has(signature)) {
      //faces.push(processDual(dual.map(c => c ||), p.shape));
    }
  });
  return faces;
}
