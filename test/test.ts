import { diff, intersect, union } from '../csg/boolean';
import { extrude, tile } from '../csg/extrude';
import { translate } from '../csg/manipulate';
import { box, poly2, rect, sphere } from '../csg/primitives';
import { render } from '../src/render';

const shape: Shape3 = extrude(10, poly2([[0, 0], [10, 0], [10, 10], [-5, 10]]));
tile({ x: [4, 25], y: [3, 30], z: [3, 30] }, sphere(10));
intersect({ radius: 5 },
  box(30),
  translate([0, 0, 15], sphere(10)));

render({
  name: "test",
  cubeSize: 2,
  shape,
});

