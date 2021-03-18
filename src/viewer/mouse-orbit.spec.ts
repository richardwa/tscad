/// <reference path="../../types.d.ts" />

import { assert } from "console";
import { sphericalToCartesion } from "./mouse-orbit";

const assertEquals = (a: number[], b: number[], ...rest: any[]) => assert(
  a.reduce((a, v, i) => a && Math.abs(v - b[i]) < 0.01, true), a, b, ...rest);

assertEquals(sphericalToCartesion({
  origin: [0, 0, 0],
  pos: [1, 0, 0]
}).cameraPos, [0, 0, -1]);

assertEquals(sphericalToCartesion({
  origin: [0, 0, 0],
  pos: [2, Math.PI / 6, 0]
}).cameraPos, [1, 0, -Math.sqrt(3)]);

assertEquals(sphericalToCartesion({
  origin: [0, 0, 0],
  pos: [2, Math.PI / 6, Math.PI / 4]
}).cameraPos, [1, 2, -Math.sqrt(3)]);
