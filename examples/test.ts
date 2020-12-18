import { Shpere, Box } from '../lib/primitives';
import { render } from '../lib/render';

export default function () {
  render({
    name: "test",
    resolution: [100, 100, 100],
    shape: Box(),
    bounds: [[-2.1, -2.1, -2.1], [2.1, 2.1, 2.1]]
  });
}

