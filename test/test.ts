import { Shpere, Box } from '../src/primitives';
import { union, translate } from '../src/operations';
import { render } from '../src/render';

const shape =
  union(
    translate([0, 0, 10], Shpere(10)),
    Box(20)
  );

render({
  name: "test",
  shape,
  resolution: [100, 100, 100],
  bounds: [[-20, -20, -20], [30, 30, 30]]
});

