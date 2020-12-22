
// some basic vector maths
export class Vector<T extends number[]>{
  result: T;
  constructor(v: T) {
    this.result = v;
  }

  minus(v: T) {
    const a = [] as T;
    for (let i in this.result) {
      a[i] = this.result[i] - v[i];
    }
    this.result = a;
    return this;
  }

  add(v: T) {
    const a = [] as T;
    for (let i in this.result) {
      a[i] = this.result[i] + v[i];
    }
    this.result = a;
    return this;
  }
  scale(s: number) {
    const a = [] as T;
    for (let i in this.result) {
      a[i] = this.result[i] * s;
    }
    this.result = a;
    return this;
  }

  cross(v: Vec3) {
    const a = [0, 0, 0] as T;
    a[0] = this.result[1] * v[2] - this.result[2] * v[1];
    a[1] = this.result[2] * v[0] - this.result[0] * v[2];
    a[2] = this.result[0] * v[1] - this.result[1] * v[0];
    this.result = a;
    return this;
  }

  magnitude() {
    let sum = 0;
    for (let v of this.result) {
      sum += v * v;
    }
    return Math.sqrt(sum);
  }
}



// return x between a and b
function clamp(x: number, a: number, b: number) {
  if (x < a) {
    return a;
  } else if (x > b) {
    return b;
  } else {
    return x;
  }
}