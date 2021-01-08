
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
  dot(v: T) {
    let sum = 0;
    for (let i in this.result) {
      sum += this.result[i] * v[i];
    }
    return sum;
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

  toUnitVector() {
    const mag = this.magnitude();
    return this.scale(1 / mag);
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
export function clamp(x: number, a: number, b: number) {
  if (x < a) {
    return a;
  } else if (x > b) {
    return b;
  } else {
    return x;
  }
}

// s between 0 and 1, 
// returns the linear interpolation between a and b
export function mix(a: number, b: number, s: number) {
  return a * (1 - s) + b * s;
}