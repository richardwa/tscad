
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

  divide(v: T) {
    const a = [] as T;
    for (let i in this.result) {
      a[i] = this.result[i] / v[i];
    }
    this.result = a;
    return this;
  }

  times(v: T) {
    const a = [] as T;
    for (let i in this.result) {
      a[i] = this.result[i] * v[i];
    }
    this.result = a;
    return this;
  }

  dot(v: T) {
    let sum = 0;
    for (let i in this.result) {
      sum += this.result[i] * v[i];
    }
    return sum;
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

  cross2d(v: Vec2) {
    return this.result[0] * v[1] - this.result[1] * v[0];
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

export function getSurfaceNormal(p: Vec3, fn: Shape3): Vector<Vec3> {
  const h = 0.001
  const val = fn(p);
  const [x, y, z] = p;
  return new Vector([
    fn([x + h, y, z]) - val,
    fn([x, y + h, z]) - val,
    fn([x, y, z + h]) - val
  ] as Vec3).toUnitVector();
}

// return x between a and b
export function clamp(x: number, a: number, b: number) {
  if (x < a) {
    return a;
  } else if (x > b) {
    return b;
  } else {
    return x;
  }
}

// s between 0 and 1, 
// returns the linear interpolation between a and b
export function mix(a: number, b: number, s: number) {
  return a * (1 - s) + b * s;
}

export const getHex: (n: number) => string = (() => {
  const buffer = new ArrayBuffer(4);
  const intView = new Int32Array(buffer);
  const floatView = new Float32Array(buffer);

  return (n: number) => {
    floatView[0] = n;
    return intView[0].toString(16);
  }
})();

export const positiveNumReducer = (a: number, v: number, i: number) => {
  if (v > 0) {
    a |= 1 << i;
  }
  return a;
}

export const boundsToCorners = ([[a, b, c], [x, y, z]]: Bounds) => [
  [a, b, c], [x, b, c], [a, y, c], [x, y, c],
  [a, b, z], [x, b, z], [a, y, z], [x, y, z]
] as Cube;

export const boundsToCorners2 = ([[a, b], [x, y]]: Bounds2) => [
  [a, b], [x, b], [a, y], [x, y],
] as Square;

export const getCentroid = (t: Vec3[]) => {
  const sum = t.reduce((a, v) => [a[0] + v[0], a[1] + v[1], a[2] + v[2]], [0, 0, 0]);
  return sum.map(p => p / 3) as Vec3;
}

export const getCenter = <T extends Vec2 | Vec3>(p1: T, p2: T) =>
  new Vector(p1).add(p2).scale(1 / 2).result as T;

export const splitCube = (cube: Cube): Cube[] => {
  const center = getCenter(cube[0], cube[7]) as Vec3;
  const c0 = boundsToCorners([cube[0], center]);
  const c7 = boundsToCorners([center, cube[7]]);
  const c1 = boundsToCorners([c0[1], c7[1]]);
  const c2 = boundsToCorners([c0[2], c7[2]]);
  const c3 = boundsToCorners([c0[3], c7[3]]);
  const c4 = boundsToCorners([c0[4], c7[4]]);
  const c5 = boundsToCorners([c0[5], c7[5]]);
  const c6 = boundsToCorners([c0[6], c7[6]]);
  return [c0, c1, c2, c3, c4, c5, c6, c7];
}
export const splitSquare = (square: Square): Square[] => {
  const center = getCenter(square[0], square[3]) as Vec2;
  const c0 = boundsToCorners2([square[0], center]);
  const c3 = boundsToCorners2([center, square[3]]);
  const c1 = boundsToCorners2([c0[1], c3[1]]);
  const c2 = boundsToCorners2([c0[2], c3[2]]);
  return [c0, c1, c2, c3];
}

export const interpolate = <T extends Vec2 | Vec3>(p1: T, p2: T, e1: number, e2: number): T => {
  const diff = new Vector(p2).minus(p1);
  const abs_e1 = Math.abs(e1);
  const abs_e2 = Math.abs(e2);
  return diff.scale(abs_e1 / (abs_e1 + abs_e2)).add(p1).result;
}

export const findZeroRecursive = <T extends Vec2 | Vec3>(p1: T, p2: T, e1: number, e2: number, threshold: number, fn: (t: T) => number): T => {
  const center = getCenter(p1, p2);
  const val = fn(center);
  if (Math.abs(val) < threshold) {
    return center;
  } else if (Math.sign(e1) !== Math.sign(val)) {
    return findZeroRecursive(p1, center, e1, val, threshold, fn);
  } else {
    return findZeroRecursive(center, p2, val, e2, threshold, fn);
  }
}