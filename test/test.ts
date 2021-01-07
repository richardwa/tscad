import { extrude } from '../csg/extrude';
import { rect } from '../csg/primitives';
import { render } from '../src/render';

const shape: Shape3 = extrude(10, rect(10, 20));

const s = 32;
render({
  name: "test",
  shape,
  cubeSize: 1,
  bounds: [[-s, -s, -s], [s, s, s]]
});

