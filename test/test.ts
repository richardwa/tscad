/// <reference path="../types.d.ts" />

import { diff, intersect, union } from '../src/csg/boolean';
import { extrude, revolve, tile } from '../src/csg/extrude';
import { translate } from '../src/csg/manipulate';
import { box, poly, rect, sphere } from '../src/csg/primitives';
import { render } from '../src/render/render';

const shape: Shape3 = revolve('z', 20, poly(5, 10));
tile({ x: [4, 25], y: [3, 30], z: [3, 30] }, sphere(10));
intersect({ radius: 5 },
  box(30),
  translate([0, 0, 15], sphere(10)));

render({
  name: "test",
  size: 4,
  shape,
});

