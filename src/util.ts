import { edgeIndex, edgeTable } from "./marchingcubes-tables";
import { Vector } from "./math";
import { CubeCorners } from "./surfacenets";

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

export const findFaces = (axis, left: CubeFace, right: CubeFace) => {
  const search = (x: number, y: number, cube: Cube, match: Cube, mask: number[]) => {
    const corner1 = (cube.type & mask[0]) > 0;
    const corner2 = (cube.type & mask[1]) > 0;
    if (corner1 !== corner2) {
      const cube2 = left.get(x, y);
      const match2 = right.get(x, y);
      if (cube2 && match2) {
        if (corner1 > corner2) {
          this.putQuad(cube.pos, match.pos, match2.pos, cube2.pos);
        } else {
          this.putQuad(cube2.pos, match2.pos, match.pos, cube.pos);
        }
      }
    }
  }

  const searchFaces0 = axisDirectionMasks[2 * axis];
  const searchFaces1 = axisDirectionMasks[2 * axis + 1];
  // iterate over the longer side (i.e smaller cubes)
  left.forEach((cube, i, j) => {
    const match = right.get(i, j);
    if (!match) {
      return;
    }
    search(i + 1, j, cube, match, searchFaces1);
    search(i, j + 1, cube, match, searchFaces0);
  });
}

export const findFaces4 = (axis: number, a: Cube[], b: Cube[], c: Cube[], d: Cube[]) => {
  const sizes = [a.length, b.length, c.length, d.length];
  const maxSize = Math.max(...sizes);
  const ratio = sizes.map(s => Math.floor(maxSize / s));
  for (let i = 0; i < maxSize; i++) {
    const quad = [
      a[Math.floor(i / ratio[0])],
      b[Math.floor(i / ratio[1])],
      c[Math.floor(i / ratio[2])],
      d[Math.floor(i / ratio[3])]
    ];
    if (quad[0] === undefined || quad[1] === undefined || quad[2] === undefined || quad[3] === undefined) {
      continue;
    }
    const searchFaces = axisDirectionMasks[2 * axis];
    const corner1 = (quad[0].type & searchFaces[0]) > 0;
    const corner2 = (quad[0].type & searchFaces[1]) > 0;
    if (corner1 !== corner2) {
      console.log('found top');
      this.putQuad(quad[3].pos, quad[1].pos, quad[0].pos, quad[2].pos);
    }
  }
}

