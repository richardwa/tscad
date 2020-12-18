import { Shpere, Box } from '../src/primitives';
import { union } from '../src/operations';
import { render } from '../src/render';

const shape =
  union(
    Box(1.5),
    Shpere()
  );

render({
  name: "test",
  resolution: [200, 200, 200],
  shape,
  bounds: [[-3, -3, -3], [3, 3, 3]]
});

