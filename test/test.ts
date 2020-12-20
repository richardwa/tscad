import { Shpere, Box, Circle, Rect } from '../src/primitives';
import { union } from '../src/boolean';
import { render } from '../src/render';
import { revolve } from '../src/extrude';
import { rotate, translate } from '../src/manipulate';

const shape = union(
  { radius: 2 },
  Shpere(10),
  translate([10, 10, 10], Box(20)));

render({
  name: "test",
  shape,
  resolution: [200, 200, 200],
  bounds: [[-20, -20, -20], [21, 21, 21]]
});

