import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "constants";

export type ScalableSquare<T> = {
  forEach: (f: (t: T, i: number) => void) => void;
  get: (n: number) => T;
  size: number;
}

class SingletonSquare<T> implements ScalableSquare<T> {
  private t: T;
  size: number = 1;
  constructor(t: T) {
    this.t = t;
  }
  forEach(f: (t: T, index: number) => void) {
    f(this.t, 0);
  }
  get(n: number) {
    return this.t;
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
  forEach(f: (t: T, i: number) => void) {

  }
  get() {
    return null;
  }
}

export type Square4<T> = [ScalableSquare<T>, ScalableSquare<T>, ScalableSquare<T>, ScalableSquare<T>];

class CombinedSquare<T> implements ScalableSquare<T> {
  list: ScalableSquare<T>[] = [];
  size: number;
  private halfSize: number;
  private quarterSize: number;
  constructor(size: number, arr: Square4<T>) {
    this.size = size * 4;
    this.halfSize = Math.floor(Math.sqrt(this.size));
    this.quarterSize = this.halfSize / 2;
    this.list = arr;
  }

  forEach(f: (t: T, index: number) => void) {
    this.list.forEach((quad, i) => {
      const x_offset = Math.floor(i % 2) * this.quarterSize;
      const y_offset = Math.floor(i / 2) * this.quarterSize;
      quad.forEach((q, j) => {
        const x = x_offset + Math.floor(i % this.quarterSize);
        const y = y_offset + Math.floor(i / this.quarterSize);
        f(q, x + this.halfSize * y);
      });
    });
  }

  get(n: number) {
    const x = Math.floor(n % this.halfSize);
    const y = Math.floor(n / this.halfSize);
    const quad = Math.floor(x / this.quarterSize) + 2 * Math.floor(y / this.quarterSize);
    if (quad <= 3) {
      const index = Math.floor(x % this.quarterSize) + this.quarterSize * Math.floor(y % this.quarterSize);
      return this.list[quad].get(index);
    }
  }
}

// position matters
export const combine4Squares = <T>(arr: Square4<T>): ScalableSquare<T> => {
  const quadSize = Math.max(...arr.map(q => q.size));
  const hasValues = arr.map(a => a instanceof NullSquare ? 0 : 1);
  if (Math.max(...hasValues) === 0) {
    return new NullSquare(quadSize * 4);
  } else {
    return new CombinedSquare(quadSize, arr);
  }
}

export const printSquare = <T>(s: ScalableSquare<T>) => {
  const width = Math.floor(Math.sqrt(s.size));
  let sb = []
  for (let i = 0; i < s.size; i++) {
    sb.push(s.get(i));
    if (Math.floor(i % width) === width - 1) {
      console.log(sb.join('|'));
      sb = [];
    }
  }
}