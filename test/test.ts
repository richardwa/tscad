import { Shpere, Box, Circle, Rect } from '../src/primitives';
import { union } from '../src/boolean';
import { render } from '../src/render';
import { revolve } from '../src/extrude';
import { rotate, translate } from '../src/manipulate';

const shape = union({ radius: 2 },
  Box(20),
  translate([10, 10, 10], Shpere(10)));


render({
  name: "test",
  shape,
  stepSize: 0.2,
  bounds: [[-100, -100, -100], [100, 100, 100]]
});

