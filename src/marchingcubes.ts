import { Vector } from './math';
import { triTable, edgeIndex, cubeVerts } from './marchingcubes-tables';
import { epsilon } from './constants';
import { MeshBuilder } from './mesh';
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
  mesh: MeshBuilder = new MeshBuilder();
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

        triangle[j] = this.interpolate(p1, v1, p2, v2);
      }
      this.mesh.addTriangle(triangle);
    }
  }

  interpolate = (p1: Vec3, v1: number, p2: Vec3, v2: number) => {
    let middle: Vec3;
    for (let i = 0; i < 10; i++) {
      const v1_abs = Math.abs(v1);
      const ratio = v1_abs / (Math.abs(v2) + v1_abs);
      middle = new Vector(p2).minus(p1).scale(ratio).add(p1).result;
      const midVal = this.fn(middle);
      if (Math.abs(midVal) < epsilon) {
        break;
      } else if (Math.sign(midVal) === Math.sign(v1)) {
        p1 = middle;
        v1 = midVal
      } else {
        p2 = middle;
        v2 = midVal;
      }
    }

    return middle;
  }
}