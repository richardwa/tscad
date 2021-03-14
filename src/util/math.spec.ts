/// <reference path="../../types.d.ts" />

import { Vector } from "./math";

const ans = new Vector([1, 2, 3]).minus([1, 1, 1]).result;
console.log(ans);