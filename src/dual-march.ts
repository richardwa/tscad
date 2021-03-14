/// <reference path="../types.d.ts" />
import { edgeTable, triTable } from './marching-cubes-tables';
import { Vector } from './math';
import { SpatialIndex } from './spatial-index';

export type Bounds = [Vec3, Vec3];
export type Cube = OctArray<Vec3>;
type Triangle = TriArray<Vec3>;
type Props = {
  size: number;
  minSize?: number;
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

const getCenter = (cube: Cube) => new Vector(cube[0]).add(cube[7]).scale(1 / 2).result;

const splitCube = (cube: Cube): Cube[] => {
  const center = getCenter(cube);
  const c0 = boundsToCorners([cube[0], center]);
  const c7 = boundsToCorners([center, cube[7]]);
  const c1 = boundsToCorners([c0[1], c7[1]]);
  const c2 = boundsToCorners([c0[2], c7[2]]);
  const c3 = boundsToCorners([c0[3], c7[3]]);
  const c4 = boundsToCorners([c0[4], c7[4]]);
  const c5 = boundsToCorners([c0[5], c7[5]]);
  const c6 = boundsToCorners([c0[6], c7[6]]);
  return [c0, c1, c2, c3, c4, c5, c6, c7];
}
const getResultIndex = (a: number, v: number, i: number) => {
  if (v > 0) {
    a |= 1 << i;
  }
  return a;
}
const getIntersections = (cube: OctArray<Vec3>, results: OctArray<number>, edge_mask: number) => {
  const fnZeros: Array12<Vec3> = [] as any;
  edges.forEach(([n, m], i) => {
    if ((edge_mask & (1 << i)) > 0) {
      const v1 = cube[n];
      const v2 = cube[m];
      const diff = new Vector(v2).minus(v1);
      const total = Math.abs(results[n]) + Math.abs(results[m]);
      fnZeros[i] = diff.scale(Math.abs(results[n]) / total).add(v1).result;
    }
  });
  return fnZeros;
}

const march = (cube: Cube, fn: Shape3): Triangle[] => {
  const results = cube.map(fn) as OctArray<number>;
  const cube_index = results.reduce(getResultIndex, 0);
  const edge_mask = edgeTable[cube_index];
  if (edge_mask === 0) {
    return [];
  }
  const fnZeros = getIntersections(cube, results, edge_mask);

  //Add faces
  const triCorners = triTable[cube_index];
  const triangles: Triangle[] = []
  for (let i = 0; i < triCorners.length; i += 3) {
    triangles.push([
      fnZeros[triCorners[i]],
      fnZeros[triCorners[i + 1]],
      fnZeros[triCorners[i + 2]]
    ]);
  }

  return triangles;
}

const getCentroid = (t: Triangle) => {
  const sum = t.reduce((a, v) => [a[0] + v[0], a[1] + v[1], a[2] + v[2]], [0, 0, 0]);
  return sum.map(p => p / 3) as Vec3;
}

/**
 * divides parent cube into list of correctly sized cubes
 */
const getCubes = (bounds: Bounds, size: number, minSize: number, fn: Shape3): Cube[] => {
  const _process = (cube: Cube): Cube[] => {
    const results = cube.map(fn) as OctArray<number>;
    const maxLen = Math.max(...new Vector(cube[7]).minus(cube[0]).result);

    // Optimization check, if we are far away (wrt cube size) from the surface, no need to divide further
    if (Math.min(...results.map(Math.abs)) > maxLen) {
      return [cube];
    }

    // split until we are small enough
    if (maxLen > size) {
      return splitCube(cube).flatMap(_process);
    }

    // adaptive cubes - continue split if too much error
    if (maxLen > minSize) {
      const edge_mask = results.reduce(getResultIndex, 0);
      if (edgeTable[edge_mask] !== 0) {
        const centroids = march(cube, fn).map(getCentroid);
        const error = Math.max(...centroids.map(fn).map(Math.abs));
        if (error > minSize) {
          return splitCube(cube).flatMap(_process);
        }
      }
    }

    return [cube];
  }
  return _process(boundsToCorners(bounds));
};

const resFn = (n: number) => Math.floor(n / 0.001);
const keyFn = (n: Vec3) => n.map(resFn).join();
const match = (v1: Vec3, v2: Vec3) =>
  Number(v1[0] === v2[0]) + Number(v1[1] === v2[1]) + Number(v1[2] === v2[2]);

export const getDualCubes = (cubes: Cube[]): Cube[] => {
  const dualMap: Map<string, OctArray<Vec3>> = new Map();
  const setDual = (corner: Vec3, i: number, center: Vec3) => {
    const key = keyFn(corner);
    let dual = dualMap.get(key);
    if (dual === undefined) {
      dual = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
      dualMap.set(key, dual);
    }
    dual[7 - i] = center;
  }

  const points = cubes.flatMap(cube => cube).reduce((a, v, i) => {
    a.set(keyFn(v), v);
    return a;
  }, new Map<String, Vec3>());
  const spatialIndex = new SpatialIndex(Array.from(points.values()));

  cubes.forEach(cube => {
    const center = getCenter(cube);
    const size = Math.abs(cube[0][0] - cube[1][0]);
    spatialIndex.queryCube(center, size).forEach(p => {
      const matches = cube.map(c => match(c, p));
      const groupMatches = matches.reduce((a, v, i) => {
        if (!a.get(v)) {
          a.set(v, [i]);
        } else {
          a.get(v).push(i);
        }
        return a;
      }, new Map<number, number[]>());
      const pType = Math.max(...Array.from(groupMatches.keys()));
      groupMatches.get(pType).forEach(i => {
        setDual(p, i, center);
      });
    });
  });

  // filter incomplete cubes
  return Array.from(dualMap.values())
    .filter(dual => dual.reduce((a, v) => v !== undefined && a, true));

}

export function dualMarch(p: Props): Triangle[] {
  const size = p.size;
  const minSize = p.minSize || (p.size / 200);
  console.log('cube size', size);
  const s = 44;
  const bounds = p.bounds || [[-s, -s, -s], [s, s, s]];
  const cubes = getCubes(bounds, size, minSize, p.shape);
  console.log('cubes', cubes.length);

  const duals = getDualCubes(cubes);
  console.log('duals', duals.length);
  const triangles = duals.flatMap(c => march(c, p.shape));

  return triangles;
}
