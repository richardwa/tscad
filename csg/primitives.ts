import { Vector } from '../src/math';

export function Circle(r: number = 1): Shape2 {
  return (p) => new Vector(p).magnitude() - r;
}

export function Sphere(r: number = 1): Shape3 {
  return (p) => new Vector(p).magnitude() - r;
}


export function Rect(x: number = 2, y: number = x): Shape2 {
  const x1 = x / 2, y1 = y / 2;
  return ([x, y]) => {
    const i = Math.max(Math.abs(x) - x1, 0);
    const j = Math.max(Math.abs(y) - y1, 0);
    const outside = new Vector([Math.max(i, 0), Math.max(j, 0)]).magnitude();
    const inside = Math.min(Math.max(i, j), 0);
    return outside + inside;
  }
}

export function Box(x: number = 2, y: number = x, z: number = y): Shape3 {
  const x1 = x / 2, y1 = y / 2, z1 = z / 2;
  return ([x, y, z]) => {
    const i = Math.abs(x) - x1;
    const j = Math.abs(y) - y1;
    const k = Math.abs(z) - z1;
    const outside = new Vector([Math.max(i, 0), Math.max(j, 0), Math.max(k, 0)]).magnitude();
    const inside = Math.min(Math.max(i, j, k), 0);
    return outside + inside;
  }
}

