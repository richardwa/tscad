import { Shpere, Box, Circle, Rect } from '../src/primitives';
import { union } from '../src/boolean';
import { render } from '../src/render';
import { revolve, tile } from '../src/extrude';
import { rotate, translate } from '../src/manipulate';

const shape = rotate('y', 15, rotate('z', 16,
  union({ radius: 3 },
    Box(20.2),
    translate([10, 10, 10], Shpere(10)))));

const s = 256;
render({
  name: "test",
  shape,
  cubeSize: 1,
  bounds: [[-s, -s, -s], [s, s, s]]
});

