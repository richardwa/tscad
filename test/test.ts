import { diff, intersect, union } from '../csg/boolean';
import { extrude } from '../csg/extrude';
import { translate } from '../csg/manipulate';
import { box, rect, sphere } from '../csg/primitives';
import { render } from '../src/render';

const shape: Shape3 = intersect({ radius: 5 },
  box(30),
  translate([0, 0, 15], sphere(10)));

render({
  name: "test",
  shape,
  cubeSize: .4,
});

