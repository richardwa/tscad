import { distance } from "./math";

type UnionParams = {
  radius: number;
}

function _union(s1: Shape3, s2: Shape3): Shape3 {
  return (p) => {
    return Math.min(s1(p), s2(p));
  };
}

function _unionR(radius: number, s1: Shape3, s2: Shape3): Shape3 {
  return (p) => {
    const p1 = s1(p);
    const p2 = s2(p);
    const h = Math.max(radius - Math.abs(p1 - p2), 0);
    return Math.min(p1, p2) - h * h * 0.25 / radius;
  };
}

export function union(a: UnionParams | Shape3, ...s: Shape3[]): Shape3 {
  const shapes: Shape3[] = [];
  let radius = 0;

  // normalize arguments
  if ('radius' in a) {
    radius = a.radius;
  } else {
    shapes.push(a);
  }
  shapes.push(...s);

  // check arguments
  if (shapes.length === 0) {
    throw "no shapes given to union";
  } else if (shapes.length === 1) {
    return shapes[0];
  }

  const [head, ...rest] = shapes;
  if (radius && radius > 0) {
    return rest.reduce((a, v, i) => _unionR(radius, a, v), head);
  } else {
    return rest.reduce((a, v, i) => _union(a, v), head);
  }

}

export function translate(translation: Vec3, s: Shape3): Shape3 {
  const translate = (p: Vec3) =>
    translation.map((v, i) => p[i] - v) as Vec3;
  return (p) => {
    return s(translate(p));
  }
}

