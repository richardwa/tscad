import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "constants";

type UnionParams = {
  radius: number;
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

  // do Union
  return (p) => {
    return Math.min(...shapes.map(f => f(p)));
  };
}

export function translate(translation: Vec3, s: Shape3): Shape3 {
  return (p) => {
    const translated: Vec3 = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      translated[i] = p[i] - translation[i];
    }
    return s(translated);
  }

}