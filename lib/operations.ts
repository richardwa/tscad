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

  if (shapes.length === 0) {
    throw "no shapes given to union";
  } else if (shapes.length === 1) {
    return shapes[0];
  } else {
    // do Union
    return (p) => {
      return Math.min(...shapes.map(f => f(p)));
    };
  }

}