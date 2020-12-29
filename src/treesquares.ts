
export type ScalableSquare<T> = {
  forEach: (f: (t: T, x: number, y: number) => void) => void;
  get: (x: number, y: number) => T;
  size: number;
}

class SingletonSquare<T> implements ScalableSquare<T> {
  private t: T;
  size: number = 1;
  constructor(t: T) {
    this.t = t;
  }
  forEach(f: (t: T, x: number, y: number) => void) {
    f(this.t, 0, 0);
  }
  get(x: number, y: number) {
    if (x === 0 && y === 0) {
      return this.t;
    }
  }
}

export const createSquare = <T>(t: T): ScalableSquare<T> => {
  if (t === null || t === undefined) {
    return new NullSquare(1);
  } else {
    return new SingletonSquare(t);
  }
}

class NullSquare<T> implements ScalableSquare<T> {
  size: number;
  constructor(size: number) {
    this.size = size;
  }
  forEach() {
  }
  get() {
    return null;
  }
}

export type Square4<T> = [ScalableSquare<T>, ScalableSquare<T>, ScalableSquare<T>, ScalableSquare<T>];

class CombinedSquare<T> implements ScalableSquare<T> {
  list: ScalableSquare<T>[] = [];
  size: number;
  private half: number;
  constructor(size: number, arr: Square4<T>) {
    this.size = size;
    this.half = size / 2;
    this.list = arr;
  }

  forEach(f: (t: T, x: number, y: number) => void) {
    this.list.forEach((quad, i) => {
      const x_offset = Math.floor(i % 2) * this.half;
      const y_offset = Math.floor(i / 2) * this.half;
      quad.forEach((q, a, b) => {
        f(q, a + x_offset, b + y_offset);
      });
    });
  }

  get(x: number, y: number) {
    if (x < this.size && y < this.size) {
      const quad = Math.floor(x / this.half) + 2 * Math.floor(y / this.half);
      const a = Math.floor(x % this.half);
      const b = Math.floor(y % this.half);
      return this.list[quad].get(a, b);
    }
  }
}

// position matters
export const combine4Squares = <T>(arr: Square4<T>): ScalableSquare<T> => {
  const size = Math.max(...arr.map(q => q.size)) * 2;
  const hasValues = arr.map(a => a instanceof NullSquare ? 0 : 1);
  if (Math.max(...hasValues) === 0) {
    return new NullSquare(size);
  } else {
    return new CombinedSquare(size, arr);
  }
}

export const printSquare = <T>(s: ScalableSquare<T>, f: (t: T) => any = o => o) => {
  for (let j = 0; j < s.size; j++) {
    const sb = [];
    for (let i = 0; i < s.size; i++) {
      sb.push(s.get(i, j));
    }
    console.log(sb.map(f).join('|'));
  }
}