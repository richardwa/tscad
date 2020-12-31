import { poly } from '../csg/primitives';
import { union } from '../csg/boolean';
import { render } from '../src/render';
import { extrude, tile } from '../csg/extrude';
import { rotate, translate } from '../csg/manipulate';

const shape: Shape3 = extrude(10, poly(6, 5));

const s = 10;
render({
  name: "test-shapes",
  shape,
  cubeSize: 10,
  bounds: [[-s, -s, -s], [s, s, s]]
});

