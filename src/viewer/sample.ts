
import { union } from '../csg/boolean';
import { rotate, translate } from '../csg/manipulate';
import { box, sphere } from '../csg/primitives';

export const main = rotate('y', 0, rotate('z', 0,
  union({ radius: 3 },
    box(20.2),
    translate([10, 10, 10], sphere(10)))));