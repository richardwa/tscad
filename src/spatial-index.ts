import * as ubilabs from 'kd-tree-javascript';

export class SpatialIndex {
  keyFn: (n: Vec3) => string;
  cache = new Set<string>();
  kdtree = new ubilabs.kdTree<Vec3>([], (a, b) => {
    // distance formula for 'cube' space
    return Math.max(
      Math.abs(a[0] - b[0]),
      Math.abs(a[1] - b[1]),
      Math.abs(a[2] - b[2])
    );
  }, [0, 1, 2]);

  constructor(keyFn: (n: Vec3) => string) {
    this.keyFn = keyFn;
  }

  set(p: Vec3) {
    const key = this.keyFn(p);
    if (!this.cache.has(key)) {
      this.cache.add(key);
      this.kdtree.insert(p);
    }
  }

  queryCube(center: Vec3, size: number): Vec3[] {
    return this.kdtree
      .nearest(center, 1000, (size * 1.01) / 2)
      .map(([c, i]) => c);
  }

}