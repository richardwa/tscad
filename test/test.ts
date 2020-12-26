import { Shpere, Box, Circle, Rect } from '../csg/primitives';
import { union } from '../csg/boolean';
import { render } from '../src/render';
import { revolve, tile } from '../csg/extrude';
import { rotate, translate } from '../csg/manipulate';

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
  // bounds: [[-14, -8, -4], [-12, -6, 0]]
});

