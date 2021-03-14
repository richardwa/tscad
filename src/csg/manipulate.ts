export function translate(translation: Vec3, s: Shape3): Shape3 {
  const fn = (v: number, i: number) => v - translation[i];
  return (p) => {
    return s(p.map(fn) as Vec3);
  }
}

export function rotate(axis: Axis, degrees: number, s: Shape3): Shape3 {
  const sn = Math.sin(degrees * 2 * Math.PI / 360);
  const cs = Math.cos(degrees * 2 * Math.PI / 360);

  switch (axis) {
    case 'x': return ([x, y, z]) => s([x, y * cs - z * sn, y * sn + z * cs]);
    case 'y': return ([x, y, z]) => s([x * cs + z * sn, y, z * cs - x * sn]);
    case 'z': return ([x, y, z]) => s([x * cs - y * sn, x * sn + y * cs, z]);
  }
}

export function scale(d: number, s: Shape3): Shape3 {
  const sc = (a: number) => a / d;
  return (p) => {
    return s(p.map(sc) as Vec3) * d;
  }
}