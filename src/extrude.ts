/// <reference path="./types.d.ts" />
import { Vector } from "./math";

export function extrude(height: number, s: Shape2): Shape3 {
  const h = height / 2;
  return (p) => {
    const d = s([p[0], p[1]]);
    const w = Math.abs(p[2]) - h;

    const outside = new Vector([Math.max(d, 0), Math.max(w, 0)]).magnitude();
    const inside = Math.min(Math.max(d, w), 0);
    return outside + inside;
  }
}

export function revolve(axis: Axis, offset: number, s: Shape2): Shape3 {
  switch (axis) {
    case 'x': return (p) => s([new Vector([p[1], p[2]]).magnitude() - offset, p[0]]);
    case 'y': return (p) => s([new Vector([p[0], p[2]]).magnitude() - offset, p[1]]);
    case 'z': return (p) => s([new Vector([p[0], p[1]]).magnitude() - offset, p[2]]);
  }
}

export function mirror(plane: Plane, s: Shape3): Shape3 {
  switch (plane) {
    case 'yz': return (p) => s([Math.abs(p[0]), p[1], p[2]]);
    case 'xy': return (p) => s([p[0], p[1], Math.abs(p[2])]);
    case 'xz': return (p) => s([p[0], Math.abs(p[1]), p[2]]);
  }
}


type TileParams = {
  [a in Axis]?: {
    times: number;
    width: number;
  }
}
export function tile(o: TileParams, s: Shape3): Shape3 {
  return null;
}