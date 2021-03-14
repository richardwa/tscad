import { off } from "process";
import { clamp, Vector } from "../util/math";

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

// tile in 1-Dimension
const tile1D = (p: [times: number, width: number]) => {
  const [times, width] = p;
  const upper = Math.floor(times / 2);
  const lower = -Math.floor(times / 2) + ((times + 1) % 2);
  const f = (x: number) => x - width * clamp(Math.round(x / width), lower, upper);
  // offset even numbers to keep centered after tiling
  const offset = width / 2;
  return (times % 2 === 1) ? f : (x: number) => f(x + offset);
}

type TileParams = {
  [a in Axis]?: [times: number, width: number]
}
const identity = (n: number) => n;
export function tile(o: TileParams, s: Shape3): Shape3 {
  const tileX = o.x ? tile1D(o.x) : identity;
  const tileY = o.y ? tile1D(o.y) : identity;
  const tileZ = o.z ? tile1D(o.z) : identity;
  return (p) => s([tileX(p[0]), tileY(p[1]), tileZ(p[2])]);
}