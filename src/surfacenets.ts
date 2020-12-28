import { cubeVerts, edgeIndex, edgeTable } from './marchingcubes-tables';
import { Vector } from './math';
export type Bounds = [Vec3, Vec3];
export type Triangle = [Vec3, Vec3, Vec3];
export type Cube = [Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3];
export type CubeFace = {
  a_size: number;
  b_size: number;
  get: (a: number, b: number) => {
    pos: Vec3,
    cubeIndex: number;
  }
};
const getAsize = (a: CubeFace) => a.a_size;
const getBsize = (a: CubeFace) => a.b_size;


type CubeFace4 = [CubeFace, CubeFace, CubeFace, CubeFace];
type CubeSurface = [CubeFace, CubeFace, CubeFace, CubeFace, CubeFace, CubeFace];
const reduceCorners = (a: number, v: number, i: number) => {
  if (v > 0) {
    a |= 1 << i;
  }
  return a;
};

const combineFaces = (max_a: number, max_b: number, faces: CubeFace4): CubeFace => ({
  a_size: max_a * 2,
  b_size: max_b * 2,
  get: (a, b) => {
    // find the correct sub cube
    let index = 0;
    if (a >= max_a) {
      a -= max_a;
      index += 1;
    }
    if (b >= max_b) {
      b -= max_b;
      index += 2;
    }
    const subCubeFace = faces[index];
    const a_ratio = subCubeFace.a_size / max_a;
    const b_ratio = subCubeFace.b_size / max_b;
    return subCubeFace.get(Math.floor(a / a_ratio), Math.floor(b / b_ratio));
  }
});

function logFace(name: string, c: CubeFace) {
  console.log("print face", name);
  for (let j = c.b_size - 1; j >= 0; j--) {
    const sb = [];
    for (let i = 0; i < c.a_size; i++) {
      sb.push(c.get(i, j) ? 1 : 0);
    }
    console.log(sb.join(' '));
  }
}

const emptyFace = {
  a_size: 1,
  b_size: 1,
  get: () => undefined
};
const emptyCube = [emptyFace, emptyFace, emptyFace, emptyFace, emptyFace, emptyFace] as CubeSurface;

// create a cube from 2 points
const makeCube = ([a, b, c]: Vec3, [i, j, k]: Vec3): Cube => [
  [a, b, c], [i, b, c], [i, j, c], [a, j, c],
  [a, b, k], [i, b, k], [i, j, k], [a, j, k]
];

export class SurfaceNets {
  triangles: Triangle[] = [];
  cubeSize: number;
  fn: Shape3;

  constructor(cubeSize: number, shape: Shape3) {
    this.cubeSize = cubeSize;
    this.fn = shape;
  }

  doMarch = (bounds: Bounds) => {
    const [lower, upper] = bounds;
    // evaluate this cube
    const vertexPositions = cubeVerts.map(v =>
      v.map((o: number, i: number) =>
        o ? upper[i] : lower[i]) as Vec3);
    this._doMarch(vertexPositions as Cube);
  };

  // divides a cube into 8 sections.  0,1,2,3 bottom cubes; 4,5,6,7 top cubes (same indexing as CubeCorners)
  _divideVolume = (pos: Cube): Cube[] => {
    const lower = pos[0];
    const upper = pos[6];
    const center = new Vector(lower).add(upper).scale(1 / 2).result;
    const [a, b, c] = lower;
    const [i, j, k] = center;
    const [x, y, z] = upper;
    return [
      makeCube([a, b, c], [i, j, k]),
      makeCube([i, b, c], [x, j, k]),
      makeCube([i, j, c], [x, y, k]),
      makeCube([a, j, c], [i, y, k]),

      makeCube([a, b, k], [i, j, z]),
      makeCube([i, b, k], [x, j, z]),
      makeCube([i, j, k], [x, y, z]),
      makeCube([a, j, k], [i, y, z])
    ];
  }

  putQuad = (a: Vec3, b: Vec3, c: Vec3, d: Vec3) => {
    this.triangles.push([a, b, c], [c, b, d]);
  }

  findVertex = (cubeType: number, pos: Cube, results: number[]): Vec3 => {
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
      const v1 = results[vertexType1];
      const p2 = pos[vertexType2];
      const v2 = results[vertexType2];
      const ans = this.interpolate(p1, v1, p2, v2);
      intercepts.push(ans);
    }

    const vert = new Vector(intercepts[0]);
    for (let i = 1; i < intercepts.length; i++) {
      vert.add(intercepts[i]);
    }
    return vert.scale(1 / intercepts.length).result;
  }

  interpolate = (p1: Vec3, v1: number, p2: Vec3, v2: number) => {
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
      const midVal = this.fn(temp);
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

  count = 0;
  _doMarch = (cube: Cube): CubeSurface => {
    const iteration = this.count++;
    const results = cube.map(this.fn);
    // console.log(iteration, results);

    const lower = cube[0];
    const upper = cube[6];
    const lengths = new Vector(upper).minus(lower).result;
    const maxLen = Math.max(...lengths);

    // optimization, this cube is far away from an edge relative to its own size
    // we can skip it even when this cube is above the min size
    if (Math.min(...results.map(Math.abs)) > maxLen) {
      return emptyCube;
    }

    // base case, we are small enought to find a vertex
    if (maxLen < this.cubeSize) {
      const cubeIndex = results.reduce(reduceCorners, 0);
      if (cubeIndex === 0xff || cubeIndex === 0x00) {
        return emptyCube;
      }

      const center = new Vector(cube[0]).add(cube[6]).scale(1 / 2).result;
      // const center = this.findVertex(cubeIndex, cube, results);
      const val = this.fn(center);
      //if (Math.abs(val) < 0.5) {
      const cubeFace: CubeFace = {
        a_size: 1,
        b_size: 1,
        get: () => ({ pos: center, cubeIndex })
      };
      // terminate recursion
      return [cubeFace, cubeFace, cubeFace, cubeFace, cubeFace, cubeFace];
      //}
    }

    // recursion
    const subResults = this._divideVolume(cube).map(this._doMarch);

    const cubeQuads = [
      [0, 3, 4, 7], // left
      [1, 2, 5, 6], // right
      [0, 1, 4, 5], // front
      [3, 2, 7, 6], // back
      [0, 1, 3, 2], // bottom
      [4, 5, 7, 6],  // top
    ];

    // output polygons - stitch together interior faces
    const masks = [
      [0b01100000, 0b01000100],
      [0b11000000, 0b01000100],
      [0b11000000, 0b01100000],
    ]; // mask to check sign change for x,y,z directions
    for (let i = 0; i < 3; i++) {
      const mask = masks[i];
      const lower = cubeQuads[i * 2].map(f => subResults[f][i * 2 + 1]) as CubeFace4;
      const upper = cubeQuads[i * 2 + 1].map(f => subResults[f][i * 2]) as CubeFace4;
      const max_a = Math.max(...lower.map(getAsize), ...upper.map(getAsize));
      const max_b = Math.max(...lower.map(getBsize), ...upper.map(getBsize));

      const face1 = combineFaces(max_a, max_b, lower);
      const face2 = combineFaces(max_a, max_b, upper);
      logFace(`${iteration}:${i} lower`, face1);
      logFace(`${iteration}:${i} higher`, face2);

      for (let b = 0; b < face1.b_size; b++) {
        for (let a = 0; a < face1.a_size; a++) {
          const v1 = face1.get(a, b);
          const v2 = face2.get(a, b);
          if (!v1 || !v2) continue;
          let cross = v1.cubeIndex & mask[0];
          if (cross !== mask[0] && cross !== 0) {
            if (b !== face1.b_size - 1) {
              const u1 = face1.get(a, b + 1);
              const u2 = face2.get(a, b + 1);
              if (u1 && u2) {
                if (u1 === v1) {
                  this.triangles.push([v1.pos, v2.pos, u2.pos]);
                } else if (u2 === v2) {
                  this.triangles.push([v1.pos, v2.pos, u1.pos]);
                } else {
                  this.putQuad(v1.pos, v2.pos, u1.pos, u2.pos);
                }
              }
            }
          }

          cross = v1.cubeIndex & mask[1]
          if (cross !== mask[1] && cross !== 0) {
            if (a !== face1.a_size - 1) {
              const u1 = face1.get(a + 1, b);
              const u2 = face2.get(a + 1, b);
              if (u1 && u2) {
                if (u1 === v1) {
                  this.triangles.push([v1.pos, v2.pos, u2.pos]);
                } else if (u2 === v2) {
                  this.triangles.push([v1.pos, v2.pos, u1.pos]);
                } else {
                  this.putQuad(v1.pos, v2.pos, u1.pos, u2.pos);
                }
              }
            }
          }
        }
      }
    }

    // combine and return exterior faces
    const newSurface = new Array(6) as CubeSurface;

    // foreach face direction
    for (let f = 0; f < 6; f++) {
      const faces = cubeQuads[f].map(c => subResults[c][f]) as CubeFace4;
      const max_a = Math.max(...faces.map(getAsize));
      const max_b = Math.max(...faces.map(getBsize));
      newSurface[f] = combineFaces(max_a, max_b, faces);
      logFace(`iter${iteration}:${f}`, newSurface[f]);
    }
    return newSurface;
  }
}