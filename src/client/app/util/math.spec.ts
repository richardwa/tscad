import { V3 } from "./math";
import { test } from "vitest";

test("math", () => {
  const ans = V3.minus([1, 2, 3], [1, 1, 1]);
  console.log(ans);
});
