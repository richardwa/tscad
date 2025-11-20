// @ts-ignore
import * as ubilabs from 'kd-tree-javascript'

const distanceFn3 = (a: Vec3, b: Vec3): number => {
  // distance formula for 'cube' space
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]))
}
const distanceFn2 = (a: Vec2, b: Vec2): number => {
  // distance formula for 'cube' space
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]))
}
export class SpatialIndex<T extends Vec2 | Vec3> {
  kdtree: ubilabs.kdTree<T>
  constructor(points: T[]) {
    if (points[0].length === 2) {
      this.kdtree = new ubilabs.kdTree<T>(points, distanceFn2 as any, [0, 1])
    } else {
      this.kdtree = new ubilabs.kdTree<T>(points, distanceFn3 as any, [0, 1, 2])
    }
  }

  queryCube(center: T, size: number): T[] {
    // @ts-ignore
    return this.kdtree.nearest(center, 1000, (size * 1.01) / 2).map(([c]) => c)
  }
}
