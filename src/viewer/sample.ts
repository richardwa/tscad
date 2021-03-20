
import { union } from '../csg/boolean';
import { rotate, translate } from '../csg/manipulate';
import { box, sphere } from '../csg/primitives';

export const main = rotate('y', 15, rotate('z', 45,
  union({ radius: 3 },
    box(10.2),
    translate([10, 10, 10], sphere(10)))));