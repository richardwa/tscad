import { Vector } from './math';
import { triTable, edgeIndex, cubeVerts } from './marchingcubes-tables';

export type Bounds = [Vec3, Vec3];
export type Triangle = [Vec3, Vec3, Vec3];

export function divideVolume(i: number, [lower, upper]: Bounds): Bounds[] {
  const halfway = lower[i] + (upper[i] - lower[i]) / 2;
  const midupper = [...upper] as Vec3;
  midupper[i] = halfway;
  const midlower = [...lower] as Vec3;
  midlower[i] = halfway;
  return [
    [lower, midupper],
    [midlower, upper]
  ];
}

export class MarchingCubes {
  triangles: Triangle[] = [];
  cubeSize: number;
  fn: Shape3;

  constructor(cubeSize: number, shape: Shape3) {
    this.cubeSize = cubeSize;
    this.fn = shape;
  }

  doMarch = (bounds: Bounds) => {
    const [lower, upper] = bounds;
    const steps = new Vector(upper).minus(lower).result;
    const maxLen = Math.max(...steps);
    const maxDim = steps.findIndex(v => v === maxLen);

    // evaluate this cube
    const vertexPositions = cubeVerts.map(v =>
      v.map((o: number, i: number) =>
        o ? upper[i] : lower[i]) as Vec3);
    const results = vertexPositions.map(this.fn);

    const cubeType = results.reduce((a, v, i) => {
      if (v > 0) {
        a |= 1 << i;
      }
      return a;
    }, 0);

    // optimization, if this cube is far away from an edge relative to its own size, we can skip it
    if (cubeType === 255 && Math.min(...results) > maxLen) {
      return;
    }
    if (cubeType === 0 && Math.min(...results.map(Math.abs)) > maxLen) {
      return;
    }

    // if volume is too large we need to split it
    if (maxLen > this.cubeSize) {
      divideVolume(maxDim, bounds).forEach(this.doMarch);
      return;
    }

    // process Triangles
    const triEdges = triTable[cubeType];
    for (let i = 0; i < triEdges.length; i += 3) {
      const triangle: Triangle = [null, null, null];
      for (let j = 0; j < 3; j++) {
        const edgeType = triEdges[i + j];
        // vertices
        const [vertexType1, vertexType2] = edgeIndex[edgeType];
        const p1 = vertexPositions[vertexType1];
        const v1 = results[vertexType1];
        const p2 = vertexPositions[vertexType2];
        const v2 = results[vertexType2];

        // interpolate
        const v1_abs = Math.abs(v1);
        const ratio = v1_abs / (Math.abs(v2) + v1_abs);
        const vertex = new Vector(p2).minus(p1).scale(ratio).add(p1).result;
        triangle[j] = vertex;
      }
      this.triangles.push(triangle);
    }
  }
}