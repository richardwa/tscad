import { clamp, V2, V3 } from '../util/math';
import { extrude } from './extrude';
import { addFunc, f, v3 } from './glsl-util';

export function circle(r: number = 1): Shape2 {
  const sp = (p: Vec2) => V2.length(p) - r;
  sp.gl = addFunc('float', 'vec2 p', `return length(p)-${f(r)};`, []);
  return sp;
}

export function sphere(r: number = 1): Shape3 {
  const sp = (p: Vec3) => V3.length(p) - r;
  sp.gl = addFunc('float', 'vec3 p', `return length(p)-${f(r)};`, []);
  return sp;
}

export function cylinder(radius: number = 1, height = 2): Shape3 {
  return extrude(height, circle(radius));
}

export function rect(x: number = 2, y: number = x): Shape2 {
  const x1 = x / 2, y1 = y / 2;
  const sp = ([x, y]: Vec2) => {
    const i = Math.max(Math.abs(x) - x1, 0);
    const j = Math.max(Math.abs(y) - y1, 0);
    const outside = V2.length([Math.max(i, 0), Math.max(j, 0)]);
    const inside = Math.min(Math.max(i, j), 0);
    return outside + inside;
  }
  sp.gl = addFunc('float', 'vec2 p', [
    `// rect`,
    `vec2 d = abs(p)-vec2(${f(x1)}, ${f(y1)});`,
    `return length(max(d,0.0))+min(max(d.x,d.y),0.0); `
  ].join('\n'), []);
  return sp;
}

const cross2d: GLNode = addFunc('float', 'vec2 v0, vec2 v1', 'return v0.x*v1.y - v0.y*v1.x;', []);
const poly2 = (points: Vec2[]): Shape2 => {
  const sp = (p: Vec2) => {
    const a = V2.minus(p, points[0]);
    let distance = V2.dot(a, a);
    let sign = 1;
    const len = points.length
    for (let i = 0; i < len; i++) {
      const i2 = (i + 1) % len;
      const e = V2.minus(points[i2], points[i]);
      const v = V2.minus(p, points[i]);
      const pq = V2.minus(v, V2.scale(clamp(
        V2.dot(v, e) / V2.dot(e, e), 0, 1), e));
      distance = Math.min(distance, V2.dot(pq, pq));

      //winding number
      const v2 = V2.minus(p, points[i2]);
      const val3 = V2.cross(e, v);
      const cond = [v[1] >= 0 ? 1 : 0, v2[1] < 0 ? 1 : 0, val3 > 0 ? 1 : 0];
      if (Math.max(...cond) === Math.min(...cond)) {
        sign *= -1;
      }
    }
    return Math.sqrt(distance) * sign;
  }
  // from iq - https://www.shadertoy.com/view/WdSGRd
  const poly = points.map(p => `vec2(${f(p[0])}, ${f(p[1])})`).join(',');
  const n = points.length;
  sp.gl = addFunc('float', 'vec2 p', [
    `// polygon`,
    `vec2[${n}] poly = vec2[${n}](${poly});`,
    `vec2[${n}] e;`,
    `vec2[${n}] v;`,
    `vec2[${n}] pq;`,
    // data
    `for( int i=0; i<${n}; i++) {`,
    `    int i2 = int(mod(float(i+1),float(${n})));`, //i+1
    `    e[i] = poly[i2] - poly[i];`,
    `    v[i] = p - poly[i];`,
    `    pq[i] = v[i] - e[i]*clamp( dot(v[i],e[i])/dot(e[i],e[i]), 0.0, 1.0 );`,
    `}`,
    //distance
    `float d = dot(pq[0], pq[0]); `,
    `for( int i=1; i<${n}; i++) {`,
    `  d = min( d, dot(pq[i], pq[i]));`,
    `}`,
    //winding number
    // from http://geomalgorithms.com/a03-_inclusion.html
    `int wn =0; `,
    `for( int i=0; i<${n}; i++) {`,
    `    int i2= int(mod(float(i+1),float(${n})));`,
    `    bool cond1= 0. <= v[i].y;`,
    `    bool cond2= 0. > v[i2].y;`,
    `    float val3= $1(e[i],v[i]);`, //isLeft
    `    wn+= cond1 && cond2 && val3>0. ? 1 : 0;`, // have  a valid up intersect
    `    wn-= !cond1 && !cond2 && val3<0. ? 1 : 0;`, // have  a valid down intersect
    `}`,
    `float s= wn == 0 ? 1. : -1.;`,
    `return sqrt(d) * s;`,
  ].join('\n'), [cross2d]);
  return sp;
}

/**
 * @param points number of corners for a regular polygon.  Can also use an abitrary array of points
 * @param radius circle radius used to inscribe regular polygon, not required when using list of points
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
  const sp = ([x, y, z]: Vec3) => {
    const i = Math.abs(x) - x1;
    const j = Math.abs(y) - y1;
    const k = Math.abs(z) - z1;
    const outside = V3.length([Math.max(i, 0), Math.max(j, 0), Math.max(k, 0)]);
    const inside = Math.min(Math.max(i, j, k), 0);
    return outside + inside;
  }

  sp.gl = addFunc('float', 'vec3 p', [
    `// box`,
    `vec3 q = abs(p) - ${v3([x1, y1, z1])}; `,
    `return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); `
  ].join('\n'), []);
  return sp;
}

