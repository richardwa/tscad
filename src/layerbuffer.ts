
/// <reference path="./types.d.ts" />

/**
 * Buffers 3D data, once z limit is reached, new layers will cover over old ones
 */
export class CircularLayerBuffer<U> {
  buffer: Map<number, U>[];
  size: Vec3;
  fn: (t: Vec3) => U;

  constructor(size: Vec3, fn: (t: Vec3) => U) {
    this.buffer = [];
    for (let i = 0; i < size[2]; i++) {
      this.buffer[i] = new Map();
    }
    this.size = size;
    this.fn = fn;
  }

  initLayer(z: number) {
    this.buffer[z % this.size[2]].clear();
  }

  get(p: Vec3): U {
    const z1 = p[2] % this.size[2];
    const index = p[0] + p[1] * this.size[0];
    const ans = this.buffer[z1].get(index);
    if (ans === undefined) {
      const val = this.fn(p);
      this.buffer[z1].set(index, val);
      return val;
    } else {
      return ans;
    }
  }
}