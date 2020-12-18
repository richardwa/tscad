import { Shpere, Box } from '../src/primitives';
import { union, translate } from '../src/operations';
import { render } from '../src/render';

const shape =
  union(
    translate([0, 0, 2], Shpere(1)),
    Shpere(1.5)
  );

console.time("render");
render({
  name: "test",
  shape,
  resolution: [150, 150, 150],
  bounds: [[-3, -3, -3], [3, 3, 4]]
});
console.timeEnd("render");

