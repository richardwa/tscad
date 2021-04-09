
import { diff, union } from '../csg/boolean';
import { extrude, mirror, revolve, tile, tileCircular } from '../csg/extrude';
import { rotate, translate } from '../csg/manipulate';
import { box, circle, cylinder, poly, rect, sphere } from '../csg/primitives';

// all primitives
const c = circle(5);
const r = rect(12);
const p = poly(5, 10);

const b = box(15);
const cy = cylinder(4, 15);

const torus = revolve('z', 5, c);
const buntCake = revolve('z', 15, p);

// axis check
const xCheck = translate([10, 0, 0], box(10));
const yCheck = translate([0, 10, 0], torus);
const zCheck = translate([0, 0, 10], cylinder(10));
const axisCheck = union(xCheck, yCheck, zCheck);

export const main = box(10);