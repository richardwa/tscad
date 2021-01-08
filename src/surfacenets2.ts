/// <reference path="../types.d.ts" />

import { ServerStreamFileResponseOptionsWithError } from 'http2';
import { Cube, Direction, edgePairs, normalDirections, Position, pushBits } from './cubetree';
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

const findNeighbors = (cube: Cube<Data>, direction: Direction, opposedEdge: [Position, Position]): Cube<Data> => {
  const a = cube.getNeighbor(direction);
  if (a.children) {
    const b = a.getLeafs(Cube.makeFilter(opposedEdge));
    const c = b.filter(c => hasIntersections(opposedEdge.map(e => c.data.results[e])))[0];
    return c;
  } else {
    return a;
  }
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
      const val = shape(center);

      // quality check, continue dividing if not good
      // if (Math.abs(val) < cubeSize / 4) {
      cube.data.center = center;
      vertices.push(cube);
      return;
      //}
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
      [7, 0].forEach((c0, j) => {
        const c1 = pushBits[axis * 2 + j](c0);
        const corner0 = cube.data.results[c0];
        const corner1 = cube.data.results[c1];
        if (hasIntersections([corner0, corner1])) {
          let reversed = j === 0 ? corner0 > corner1 : corner0 < corner1;
          try {
            const normals = normalDirections[axis * 2 + 1 - j];
            const opposedNorms = normalDirections[axis * 2 + j];

            const d0 = pushBits[opposedNorms[0]](c0);
            const d1 = pushBits[opposedNorms[0]](c1);
            const cu1 = findNeighbors(cube, normals[0], [d0, d1]);

            const e0 = pushBits[opposedNorms[1]](c0);
            const e1 = pushBits[opposedNorms[1]](c1);
            const cu2 = findNeighbors(cube, normals[1], [e0, e1]);
            if (cu1.data.center === undefined || cu2.data.center === undefined) {
              console.log([cube, cu1, cu2].map(c => [c.path.join(''), Boolean(c.children), c.data.results]));
            }

            const poly = [cube.data.center, cu1.data.center, cu2.data.center];
            faces.push(reversed ? poly : poly.reverse());
          } catch (e) {
            console.log(e);
            error++;
          }
        }
      });
    }
  });
  if (error > 0) {
    console.warn(`encountered missing neighbors on ${error} cubes`);
  }

  return faces;
}
