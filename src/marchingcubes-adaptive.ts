import { Vector } from './math';
import { triTable, edgeIndex, cubeVerts, edgeToFaces } from './marchingcubes-tables';
import { epsilon } from './constants';
import { HashSet } from './hastset';
export type Bounds = [Vec3, Vec3];
export type Polygon = Vec3[]; // list of points that forms a closed shape
export type Curve = Vec3[]; // list of points that form a curve

// same as polygon, except it orgainizes its points into the respectives groups;
export type Perimeter = [
  Curve, Curve, // left , right
  Curve, Curve, // front , back
  Curve, Curve // top bottom
]

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


export class MarchingCubesAdaptive {
  polygons: Polygon[] = [];
  cubeSize: number;
  fn: Shape3;
  vertexCache = new HashSet((o: Vec3) => o.map(n => Math.floor(n * 10 / epsilon)).join(""));
  count = 0;

  constructor(cubeSize: number, shape: Shape3) {
    this.cubeSize = cubeSize;
    this.fn = shape;
  }

  doMarch = (bounds: Bounds): Perimeter => {
    const iteration = ++this.count;
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


    // process polygon
    console.log(iteration, "cubeType", cubeType)
    const basePerim: Perimeter = [[], [], [], [], [], []];
    if (cubeType === 255 || cubeType === 0) {
      return basePerim;
    }
    const polygon: Vec3[] = []

    // for each cube edge, create the polygon
    for (let i = 0; i < edgeIndex.length; i++) {
      const [corner1, corner2] = edgeIndex[i];
      if (Math.sign(results[corner1]) !== Math.sign(results[corner2])) {
        const vertex = this.interpolate(
          vertexPositions[corner1],
          results[corner1],
          vertexPositions[corner2],
          results[corner2]
        );

        polygon.push(vertex);
        edgeToFaces[i].forEach(f => basePerim[f].push(vertex));
      }
    }

    // check quality of the polygon
    const center = new Vector(polygon[0]);
    for (let i = 1; i < polygon.length; i++) {
      center.add(polygon[i]);
    }
    center.scale(1 / polygon.length);

    const val = this.fn(center.result);
    // quality check passed
    if (true || Math.abs(val) < 0.2) {
      this.polygons.push(polygon);
      console.log(iteration, "cube perim", basePerim);
      return basePerim;
    }

    // quality failed, need further divisions
    const blocks = divideVolume(maxDim, bounds);
    const perim0 = this.doMarch(blocks[0]);
    const perim1 = this.doMarch(blocks[1]);

    console.log(iteration, "perim0", perim0);
    console.log(iteration, "perim1", perim1);


    // merge on the split dimension
    const merge0: [Curve, Curve] = [perim0[maxDim * 2], perim0[maxDim * 2 + 1]];
    const merge1: [Curve, Curve] = [perim1[maxDim * 2], perim1[maxDim * 2 + 1]];

    // we only need to merge when sides have uneven segments
    if (merge0[1].length !== merge1[0].length) {
      const merged: Curve = [...merge0[1], ...merge1[0]];
      console.log("merged", merged);
      this.polygons.push(merged);
    }

    const combinedPerim: Perimeter = [[], [], [], [], [], []];
    combinedPerim[maxDim * 2] = merge0[0];
    combinedPerim[maxDim * 2 + 1] = merge1[1];
    for (let i = 0; i < 6; i++) {
      // not on the split dimension, we combine
      if (Math.floor(i / 2) !== maxDim) {
        combinedPerim[i].push(...perim0[i], ...perim1[i]);
      }
    }
    return combinedPerim;
  }

  interpolate = (p1: Vec3, v1: number, p2: Vec3, v2: number) => {
    // the points are coming in from a cube, find the axis we are moving on
    const limit = 15;
    const axis = p1[0] !== p2[0] ? 0 : (p1[1] !== p2[1] ? 1 : 2);
    const temp = [...p1] as Vec3;
    let low = p1[axis];
    let high = p2[axis];
    let i;
    for (i = 0; i < limit; i++) {
      const middle = (low + high) / 2;
      temp[axis] = middle;
      const midVal = this.fn(temp);
      if (Math.abs(midVal) < epsilon) {
        break;
      } else if (Math.sign(midVal) === Math.sign(v1)) {
        low = middle;
        v1 = midVal
      } else {
        high = middle;
        v2 = midVal;
      }
    }
    if (i === limit) {
      console.log("reached limit of interpolation", axis, temp, p1, v1, p2, v2);
    }

    return this.vertexCache.add(temp);
  }
}