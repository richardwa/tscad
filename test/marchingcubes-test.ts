import { Sphere, Box, Circle, Rect } from '../csg/primitives';
import { union } from '../csg/boolean';
import { render } from '../src/render';
import { revolve, tile } from '../csg/extrude';
import { rotate, translate } from '../csg/manipulate';

const shape = rotate('y', 0, rotate('z', 0,
  union({ radius: 3 },
    Box(20.2),
    translate([10, 10, 10], Sphere(10)))));

const s = 256;

render({
  name: "marchingcubes",
  shape,
  cubeSize: 1,
  bounds: [[-s, -s, -s], [s, s, s]]
  // bounds: [[-14, -8, -4], [-12, -6, 0]]
});

