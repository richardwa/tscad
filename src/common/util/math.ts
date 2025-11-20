// some basic vector maths

export const V3 = {
  add: ([a, b, c]: Vec3, [x, y, z]: Vec3) => [a + x, b + y, c + z] as Vec3,
  minus: ([a, b, c]: Vec3, [x, y, z]: Vec3) => [a - x, b - y, c - z] as Vec3,
  times: ([a, b, c]: Vec3, [x, y, z]: Vec3) => [a * x, b * y, c * z] as Vec3,
  divide: ([a, b, c]: Vec3, [x, y, z]: Vec3) => [a / x, b / y, c / z] as Vec3,
  dot: ([a, b, c]: Vec3, [x, y, z]: Vec3) => a * x + b * y + c * z,
  scale: (a: number, [x, y, z]: Vec3) => [a * x, a * y, a * z] as Vec3,
  length: ([a, b, c]: Vec3) => Math.sqrt(a * a + b * b + c * c),
  normalize: (a: Vec3) => V3.scale(1 / V3.length(a), a),
  cross: ([a, b, c]: Vec3, [x, y, z]: Vec3) =>
    [b * z - c * y, c * x - a * z, a * y - b * x] as Vec3,
};

export const V2 = {
  add: ([a, b]: Vec2, [x, y]: Vec2) => [a + x, b + y] as Vec2,
  minus: ([a, b]: Vec2, [x, y]: Vec2) => [a - x, b - y] as Vec2,
  times: ([a, b]: Vec2, [x, y]: Vec2) => [a * x, b * y] as Vec2,
  divide: ([a, b]: Vec2, [x, y]: Vec2) => [a / x, b / y] as Vec2,
  dot: ([a, b]: Vec2, [x, y]: Vec2) => a * x + b * y,
  scale: (a: number, [x, y]: Vec2) => [a * x, a * y] as Vec2,
  length: ([a, b]: Vec2) => Math.sqrt(a * a + b * b),
  normalize: (a: Vec2) => V2.scale(1 / V2.length(a), a),
  cross: ([a, b]: Vec2, [x, y]: Vec2) => a * y - b * x,
};

export function getSurfaceNormal(p: Vec3, fn: Shape3): Vec3 {
  const h = 0.001;
  const val = fn(p);
  const [x, y, z] = p;
  return V3.normalize([
    fn([x + h, y, z]) - val,
    fn([x, y + h, z]) - val,
    fn([x, y, z + h]) - val,
  ] as Vec3);
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
  };
})();

export const positiveNumReducer = (a: number, v: number, i: number) => {
  if (v > 0) {
    a |= 1 << i;
  }
  return a;
};

export const boundsToCorners = ([[a, b, c], [x, y, z]]: Bounds) =>
  [
    [a, b, c],
    [x, b, c],
    [a, y, c],
    [x, y, c],
    [a, b, z],
    [x, b, z],
    [a, y, z],
    [x, y, z],
  ] as Cube;

export const boundsToCorners2 = ([[a, b], [x, y]]: Bounds2) =>
  [
    [a, b],
    [x, b],
    [a, y],
    [x, y],
  ] as Square;

export const getCentroid = (t: Vec3[]) => {
  const sum = t.reduce(
    (a, v) => [a[0] + v[0], a[1] + v[1], a[2] + v[2]],
    [0, 0, 0],
  );
  return sum.map((p) => p / 3) as Vec3;
};

export const getCenter = (p1: Vec3, p2: Vec3): Vec3 =>
  V3.scale(1 / 2, V3.add(p1, p2 as Vec3));
export const getCenter2 = (p1: Vec2, p2: Vec2): Vec2 =>
  V2.scale(1 / 2, V2.add(p1, p2 as Vec2));

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
};
export const splitSquare = (square: Square): Square[] => {
  const center = getCenter2(square[0], square[3]) as Vec2;
  const c0 = boundsToCorners2([square[0], center]);
  const c3 = boundsToCorners2([center, square[3]]);
  const c1 = boundsToCorners2([c0[1], c3[1]]);
  const c2 = boundsToCorners2([c0[2], c3[2]]);
  return [c0, c1, c2, c3];
};

export const interpolate = (
  p1: Vec3,
  p2: Vec3,
  e1: number,
  e2: number,
): Vec3 => {
  const diff = V3.minus(p2 as Vec3, p1);
  const abs_e1 = Math.abs(e1);
  const abs_e2 = Math.abs(e2);
  return V3.add(V3.scale(abs_e1 / (abs_e1 + abs_e2), diff), p1);
};

export const interpolate2 = (
  p1: Vec2,
  p2: Vec2,
  e1: number,
  e2: number,
): Vec2 => {
  const diff = V2.minus(p2, p1);
  const abs_e1 = Math.abs(e1);
  const abs_e2 = Math.abs(e2);
  return V2.add(V2.scale(abs_e1 / (abs_e1 + abs_e2), diff), p1);
};

export const findZeroRecursive = (
  p1: Vec3,
  p2: Vec3,
  e1: number,
  e2: number,
  threshold: number,
  fn: (t: Vec3) => number,
): Vec3 => {
  const center = getCenter(p1, p2 as Vec3);
  const val = fn(center);
  if (Math.abs(val) < threshold) {
    return center;
  } else if (Math.sign(e1) !== Math.sign(val)) {
    return findZeroRecursive(p1, center, e1, val, threshold, fn);
  } else {
    return findZeroRecursive(center, p2, val, e2, threshold, fn);
  }
};

export const findZeroRecursive2 = (
  p1: Vec2,
  p2: Vec2,
  e1: number,
  e2: number,
  threshold: number,
  fn: (t: Vec2) => number,
): Vec2 => {
  const center = getCenter2(p1, p2);
  const val = fn(center);
  if (Math.abs(val) < threshold) {
    return center;
  } else if (Math.sign(e1) !== Math.sign(val)) {
    return findZeroRecursive2(p1, center, e1, val, threshold, fn);
  } else {
    return findZeroRecursive2(center, p2, val, e2, threshold, fn);
  }
};
