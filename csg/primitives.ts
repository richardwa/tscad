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

  const es = verts.map((e, i) => new Vector(verts[(i + 1) / verts.length]).minus(e).result);
  const esdot = es.map(e => new Vector(e).dot(e));

  return (p) => {
    const vs = verts.map(e => new Vector(p).minus(e).result);
    const pq = vs.map((v, i) => {
      const factor = clamp(new Vector(v).dot(es[i]) / esdot[i], 0, 1);
      return new Vector(es[i]).scale(factor).add(v).magnitude();
    });

    return Math.min(...pq);
  }
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

