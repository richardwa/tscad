import { Vector } from './math';
import { triTable, edgeIndex, cubeVerts } from './marchingcubes-tables';

type Bounds = [Vec3, Vec3];
type Triangle = [Vec3, Vec3, Vec3];

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
  vertexCache: Map<string, number> = new Map();
  vertices: Vec3[] = [];
  faces: Vec3[] = []; // holds 3 vertex indexes
  minStep: number;
  maxStep: number;
  fn: Shape3;

  constructor([minStep, maxStep]: Vec2, shape: Shape3, bounds: Bounds) {
    this.minStep = minStep;
    this.maxStep = maxStep;
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
    if (maxLen > this.maxStep) {
      divideVolume(maxDim, bounds).forEach(this.doMarch);
      return;
    }

    const triangles = this.getTriangles(cubeType, results, vertexPositions);
    for (const triangle of triangles) {
      const translated = triangle.map(vert => {
        const hash = vert.join(' ');
        if (this.vertexCache.has(hash)) {
          return this.vertexCache.get(hash);
        } else {
          const index = this.vertices.length;
          this.vertices.push(vert);
          this.vertexCache.set(hash, index);
          return index;
        }
      }) as Vec3;
      this.faces.push(translated);
    }
  }

  getTriangles = (cubeType: number, results: number[], vertexPositions: Vec3[]) => {
    const triangles: Triangle[] = [];
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

        const v1_abs = Math.abs(v1);
        // interpolate
        const ratio = v1_abs / (Math.abs(v2) + v1_abs);
        const vertex = new Vector(p2).minus(p1).scale(ratio).add(p1).result;
        triangle[j] = vertex;
      }
      triangles.push(triangle);
    }
    return triangles;
  }
}