import { Shpere, Box, Circle } from '../src/primitives';
import { union, translate, extrude } from '../src/operations';
import { render } from '../src/render';

const shape = extrude(5, Circle(10));
union({ radius: 5 },
  translate([10, 10, 10], Shpere(10)),
  Box(20)
);

render({
  name: "test",
  shape,
  resolution: [200, 200, 200],
  bounds: [[-20, -20, -20], [30, 30, 30]]
});

