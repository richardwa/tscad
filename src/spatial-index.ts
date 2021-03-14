import * as ubilabs from 'kd-tree-javascript';

const distanceFn = (a: Vec3, b: Vec3): number => {
  // distance formula for 'cube' space
  return Math.max(
    Math.abs(a[0] - b[0]),
    Math.abs(a[1] - b[1]),
    Math.abs(a[2] - b[2])
  );
};

export class SpatialIndex {
  kdtree: ubilabs.kdTree<Vec3>;
  constructor(points: Vec3[]) {
    this.kdtree = new ubilabs.kdTree<Vec3>(points, distanceFn, [0, 1, 2]);
  }


  queryCube(center: Vec3, size: number): Vec3[] {
    return this.kdtree
      .nearest(center, 1000, (size * 1.01) / 2)
      .map(([c, i]) => c);
  }

}