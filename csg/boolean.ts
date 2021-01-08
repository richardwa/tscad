import { clamp, mix, Vector } from "../src/math";

type Ops = 'union' | 'diff' | 'intersect';
const ops: { [key in Ops]: (s1: Shape3, s2: Shape3) => Shape3 } = {
  union: (s1: Shape3, s2: Shape3): Shape3 => {
    return (p) => {
      return Math.min(s1(p), s2(p));
    };
  },
  diff: (s1: Shape3, s2: Shape3): Shape3 => {
    return (p) => {
      return Math.max(s1(p), -s2(p));
    };
  },
  intersect: (s1: Shape3, s2: Shape3): Shape3 => {
    return (p) => {
      return Math.max(s1(p), s2(p));
    }
  }
};
const roundOps: { [key in Ops]: (r: number, s1: Shape3, s2: Shape3) => Shape3 } = {
  union: (radius: number, s1: Shape3, s2: Shape3): Shape3 => {
    return (p) => {
      const p1 = s1(p);
      const p2 = s2(p);
      const h = clamp(0.5 + 0.5 * (p2 - p1) / radius, 0, 1);
      return mix(p2, p1, h) - radius * h * (1 - h);
    };
  },
  diff: (radius: number, s1: Shape3, s2: Shape3): Shape3 => {
    return (p) => {
      const p1 = s1(p);
      const p2 = s2(p);
      const h = clamp(0.5 - 0.5 * (p1 + p2) / radius, 0, 1);
      return mix(p1, -p2, h) + radius * h * (1 - h);
    };
  },
  intersect: (radius: number, s1: Shape3, s2: Shape3): Shape3 => {
    return (p) => {
      const p1 = s1(p);
      const p2 = s2(p);
      const h = clamp(0.5 - 0.5 * (p2 - p1) / radius, 0, 1);
      return mix(p2, p1, h) + radius * h * (1 - h);
    };
  }
};


type OpParams = {
  radius: number;
}
const opRouter = (op: Ops) => (a: OpParams | Shape3, ...s: Shape3[]) => {
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
    throw `${op} requires 2 or more shapes`;
  } else if (shapes.length === 1) {
    return shapes[0];
  }

  const [head, ...rest] = shapes;
  if (radius && radius > 0) {
    return rest.reduce((a, v, i) => roundOps[op](radius, a, v), head);
  } else {
    return rest.reduce((a, v, i) => ops[op](a, v), head);
  }
}
export const union = opRouter('union');
export const diff = opRouter('diff');
export const intersect = opRouter('intersect');


