
import { union } from '../csg/boolean';
import { extrude, tile } from '../csg/extrude';
import { rotate, translate } from '../csg/manipulate';
import { box, poly, sphere } from '../csg/primitives';

const hexPlate = extrude(2, poly(6, 10));
export const main = tile({ x: [2, 20] }, hexPlate);