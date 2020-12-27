import * as isosurface from 'isosurface';
import { union } from '../csg/boolean';
import { rotate, translate } from '../csg/manipulate';
import { Box, Shpere } from '../csg/primitives';
import { writeOBJ } from '../src/render';

const shape = rotate('y', 15, rotate('z', 16,
  union({ radius: 3 },
    Box(20.2),
    translate([10, 10, 10], Shpere(10)))));

const s = 30;
['surfaceNets', 'marchingCubes', 'marchingTetrahedra'].forEach(algo => {
  console.time(algo);
  var mesh = isosurface[algo]([64, 64, 64], function (x, y, z) {
    return shape([x, y, z]);
  }, [[-s, -s, -s], [s, s, s]]);
  console.timeEnd(algo);

  console.log("vertices", mesh.positions.length);
  console.log("faces", mesh.cells.length);

  writeOBJ({ faces: mesh.cells, vertices: mesh.positions, name: algo });

})



