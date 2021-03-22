
import { diff, union } from '../csg/boolean';
import { extrude, mirror, revolve, tile } from '../csg/extrude';
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
const right = translate([10,0,0], box(10));
const up = translate([0,0,10], cylinder(10));
const front = translate([0,10,0], torus);

export const main =  union( right, up, front); //translate([0, 0, 15], buntCake);