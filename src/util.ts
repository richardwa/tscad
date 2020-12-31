import { edgeIndex, edgeTable } from "./marchingcubes-tables";
import { Vector } from "./math";

export const findVertex = (cubeType: number, pos: CubeCorners, results: number[]): Vec3 => {
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
    const v1 = Math.abs(results[vertexType1]);
    const p2 = pos[vertexType2];
    const v2 = Math.abs(results[vertexType2]);
    // const ans = this.interpolate(p1, v1, p2, v2);
    const avg = new Vector(p1).scale(v2);
    const avg2 = new Vector(p2).scale(v1);
    intercepts.push(avg.add(avg2.result).scale(1 / (v1 + v2)).result);
  }

  const vert = new Vector(intercepts[0]);
  for (let i = 1; i < intercepts.length; i++) {
    vert.add(intercepts[i]);
  }
  return vert.scale(1 / intercepts.length).result;
}

/**
 * Warning. Optimized interpolate, p1 and p2 must share 2 of 3 coordinate numbers.
 * i.e they must be aligned with the grid.
 */
export const interpolate = (p1: Vec3, v1: number, p2: Vec3, v2: number, fn: Shape3) => {
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
    const midVal = fn(temp);
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

export type CubeCorners = [Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3]; // eight corners
// create a cube from 2 points
const makeCube = ([a, b, c]: Vec3, [i, j, k]: Vec3): CubeCorners => [
  [a, b, c], [i, b, c], [i, j, c], [a, j, c],
  [a, b, k], [i, b, k], [i, j, k], [a, j, k]
];

// divides a cube into 8 sections.  0,1,2,3 bottom cubes; 4,5,6,7 top cubes (same indexing as CubeCorners)
export const divideVolume = (pos: CubeCorners): CubeCorners[] => {
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