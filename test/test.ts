import { Shpere, Box, Circle, Rect } from '../src/primitives';
import { union, translate } from '../src/boolean';
import { render } from '../src/render';
import { revolve } from '../src/extrude';

const shape = revolve(10, Rect(10));
union({ radius: 5 },
  translate([10, 10, 10], Shpere(10)),
  Box(20)
);

render({
  name: "test",
  shape,
  resolution: [200, 200, 200],
  bounds: [[-20, -20, -20], [20, 20, 20]]
});

