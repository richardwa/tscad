import { sign } from 'crypto';
import { clamp, Vector } from '../src/math';
import { extrude } from './extrude';

export function circle(r: number = 1): Shape2 {
  return (p) => new Vector(p).magnitude() - r;
}

export function sphere(r: number = 1): Shape3 {
  return (p) => new Vector(p).magnitude() - r;
}

export function cylinder(radius: number = 1, height = 2): Shape3 {
  return extrude(height, circle(radius));
}

export function rect(x: number = 2, y: number = x): Shape2 {
  const x1 = x / 2, y1 = y / 2;
  return ([x, y]) => {
    const i = Math.max(Math.abs(x) - x1, 0);
    const j = Math.max(Math.abs(y) - y1, 0);
    const outside = new Vector([Math.max(i, 0), Math.max(j, 0)]).magnitude();
    const inside = Math.min(Math.max(i, j), 0);
    return outside + inside;
  }
}

// from iq - https://www.shadertoy.com/view/WdSGRd
const poly2 = (points: Vec2[]) => (p: Vec2) => {
  const a = new Vector(p).minus(points[0]);
  let distance = a.dot(a.result);
  let sign = 1;
  const len = points.length
  for (let i = 0; i < len; i++) {
    const i2 = (i + 1) % len;
    const e = new Vector(points[i2]).minus(points[i]).result;
    const v = new Vector(p).minus(points[i]).result;
    const pq = new Vector(v).minus(new Vector(e).scale(clamp(
      new Vector(v).dot(e) / new Vector(e).dot(e), 0, 1)).result);
    distance = Math.min(distance, pq.dot(pq.result));

    //winding number
    const v2 = new Vector(p).minus(points[i2]).result;
    const val3 = new Vector(e).cross2d(v);
    const cond = [v[1] >= 0 ? 1 : 0, v2[1] < 0 ? 1 : 0, val3 > 0 ? 1 : 0];
    if (Math.max(...cond) === Math.min(...cond)) {
      sign *= -1;
    }
  }
  return Math.sqrt(distance) * sign;
}

/**
 * @param points specify number of corners for a regular polygon.  Can also use an abitrary array of points
 * @param radius not required when using list of points
 */
export function poly(points: number | Vec2[], radius?: number): Shape2 {
  const verts: Vec2[] = [];
  if (typeof points === 'number') {
    if (!radius) {
      throw 'error: radius required unless explict Vec2[] is given for points';
    }
    verts.push([0, radius]);
    const angle = 2 * Math.PI / points;
    for (let i = 1; i < points; i++) {
      const [x, y] = verts[i - 1];
      const x1 = Math.cos(angle) * x - Math.sin(angle) * y;
      const y1 = Math.sin(angle) * x + Math.cos(angle) * y;
      verts.push([x1, y1]);
    }
  } else {
    verts.push(...points);
  }
  if (verts.length < 3) {
    throw 'error: polygon requires at least 3 points';
  }
  return poly2(verts);
}

export function box(x: number = 2, y: number = x, z: number = y): Shape3 {
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

