
export class SpatialIndex<T> {
  keyFn: (n: Vec3) => string;
  cache = new Map<string, T>();
  index2d = new Map<string, Set<number>>();
  constructor(keyFn: (n: Vec3) => string) {
    this.keyFn = keyFn;
  }

  set(p: Vec3, t: T) {
    this.cache.set(this.keyFn(p), t);
    // fill 2d index
    for (let i = 0; i < 3; i++) {
      const tmp = [...p] as Vec3;
      tmp[i] = undefined;
      const key = this.keyFn(tmp);
      let m = this.index2d.get(key);
      if (m === undefined) {
        m = new Set();
        this.index2d.set(key, m);
      }
      m.add(p[i]);
    }
  }

  get(p: Vec3): T {
    return this.cache.get(this.keyFn(p));
  }

  orthoQuery(p1: Vec3, p2: Vec3): Array<[Vec3, T]> {
    const tmp = [undefined, undefined, undefined] as Vec3;
    let axis: number, lower: number, upper: number;
    for (let i = 0; i < 3; i++) {
      if (p1[i] === p2[i]) {
        tmp[i] = p1[i];
      } else {
        axis = i;
        if (p1[i] < p2[i]) {
          lower = p1[i];
          upper = p2[i];
        } else {
          lower = p2[i];
          upper = p1[i];
        }
      }
    }
    const key = this.keyFn(tmp);
    const data: [Vec3, T][] = [];
    const index = this.index2d.get(key);
    index.forEach(n => {
      if (n > lower && n < upper) {
        tmp[axis] = n;
        data.push([[...tmp], this.cache.get(this.keyFn(tmp))]);
      }
    });
    return data;
  }
}