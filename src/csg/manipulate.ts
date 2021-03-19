import { addFunc, wrap } from "./glsl-util";

export function translate(translation: Vec3, s: Shape3): Shape3 {
  const fn = (v: number, i: number) => v - translation[i];
  const sp = (p: Vec3) => s(p.map(fn) as Vec3);
  sp.gl = addFunc();
  return sp;
}

export function rotate(axis: Axis, degrees: number, s: Shape3): Shape3 {
  const sn = Math.sin(degrees * 2 * Math.PI / 360);
  const cs = Math.cos(degrees * 2 * Math.PI / 360);

  switch (axis) {
    case 'x': return wrap(
      ([x, y, z]) => s([x, y * cs - z * sn, y * sn + z * cs]),
      addFunc());
    case 'y': return wrap(
      ([x, y, z]) => s([x * cs + z * sn, y, z * cs - x * sn]),
      addFunc());
    case 'z': return wrap(
      ([x, y, z]) => s([x * cs - y * sn, x * sn + y * cs, z]),
      addFunc());
  }
}

export function scale(d: number, s: Shape3): Shape3 {
  const sc = (a: number) => a / d;
  const sp = (p: Vec3) => s(p.map(sc) as Vec3) * d;
  sp.gl = addFunc();
  return sp;
}