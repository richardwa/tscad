/// <reference path="./types.d.ts" />
import { distance } from "./math";

export function extrude(height: number, s: Shape2): Shape3 {
  const h = height / 2;
  return (p) => {
    const d = s([p[0], p[1]]);
    const w = Math.abs(p[2]) - h;

    const outside = distance(Math.max(d, 0), Math.max(w, 0));
    const inside = Math.min(Math.max(d, w), 0);
    return outside + inside;
  }
}

export function revolve(d: number, s: Shape2): Shape3 {
  return (p) => {
    return s([distance(p[0], p[2]) - d, p[1]]);
  }
} 