
// some basic vector maths
export class Vector<T extends number[]>{
  result: T;
  constructor(v: T) {
    this.result = v;
  }

  minus(v: T) {
    const a = [] as T;
    for (let i in this.result) {
      a[i] = this.result[i] - v[i];
    }
    this.result = a;
    return this;
  }

  add(v: T) {
    const a = [] as T;
    for (let i in this.result) {
      a[i] = this.result[i] + v[i];
    }
    this.result = a;
    return this;
  }
  scale(s: number) {
    const a = [] as T;
    for (let i in this.result) {
      a[i] = this.result[i] * s;
    }
    this.result = a;
    return this;
  }

  cross(v: Vec3) {
    const a = [0, 0, 0] as T;
    a[0] = this.result[1] * v[2] - this.result[2] * v[1];
    a[1] = this.result[2] * v[0] - this.result[0] * v[2];
    a[2] = this.result[0] * v[1] - this.result[1] * v[0];
    this.result = a;
    return this;
  }

  toUnitVector() {
    const mag = this.magnitude();
    return this.scale(1 / mag);
  }

  magnitude() {
    let sum = 0;
    for (let v of this.result) {
      sum += v * v;
    }
    return Math.sqrt(sum);
  }


}



// return x between a and b
function clamp(x: number, a: number, b: number) {
  if (x < a) {
    return a;
  } else if (x > b) {
    return b;
  } else {
    return x;
  }
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