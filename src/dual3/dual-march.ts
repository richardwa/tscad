import { edges, edgeTable, triTable } from './marching-cubes-tables';
import { boundsToCorners, getCenter, getCentroid, positiveNumReducer, interpolate, splitCube, Vector } from '../util/math';
import { SpatialIndex } from '../util/spatial-index';

const getIntersections = (cube: OctArray<Vec3>, results: OctArray<number>, edge_mask: number) => {
  const fnZeros: Array12<Vec3> = [] as any;
  edges.forEach(([n, m], i) => {
    if ((edge_mask & (1 << i)) > 0) {
      fnZeros[i] = interpolate(cube[n], cube[m], results[n], results[m]);
    }
  });
  return fnZeros;
}

const march = (cube: Cube, fn: Shape3): Triangle[] => {
  const results = cube.map(fn) as OctArray<number>;
  const cube_index = results.reduce(positiveNumReducer, 0);
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
      const edge_mask = results.reduce(positiveNumReducer, 0);
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
    const center = getCenter(cube[0], cube[7]);
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

type Props = {
  size: number;
  minSize?: number;
  shape: Shape3;
  bounds?: Bounds;
}
export function dualMarch(p: Props): Triangle[] {
  const cache = new Map<string, number>();
  const cachefn = (v: Vec3) => {
    const key = keyFn(v);
    if (cache.has(key)) {
      return cache.get(key);
    } else {
      const val = p.shape(v);
      cache.set(key, val);
      return val;
    }
  }
  const size = p.size;
  const minSize = p.minSize || (p.size / 100);
  console.log('cube size', size);
  const s = 100;
  const bounds = p.bounds || [[-s, -s, -s], [s, s, s]];
  const cubes = getCubes(bounds, size, minSize, cachefn);
  console.log('cubes', cubes.length);

  const duals = getDualCubes(cubes);
  console.log('duals', duals.length);
  const triangles = duals.flatMap(c => march(c, cachefn));

  return triangles;
}
