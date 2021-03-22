
import { union } from '../csg/boolean';
import { extrude } from '../csg/extrude';
import { rotate, translate } from '../csg/manipulate';
import { box, poly, sphere } from '../csg/primitives';

export const main = extrude(2, poly(6, 10));
rotate('y', 15, rotate('z', 45,
  union({ radius: 3 },
    box(10.2),
    translate([10, 10, 10], sphere(10)))));