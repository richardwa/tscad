export type Shape2 = (x: number, y: number) => number;
export type Shape3 = (x: number, y: number, z: number) => number;

function distance(...xs: number[]) {
  let sum = 0.0;
  for (const x of xs) {
    sum += x * x;
  }
  return Math.sqrt(sum);
}

export function Circle(r: number = 1): Shape2 {
  return (x, y) => distance(x, y) - r;
}

export function Shpere(r: number = 1): Shape3 {
  return (x, y, z) => distance(x, y, z) - r;
}


export function Rect(x: number = 2, y: number = x): Shape2 {
  const x1 = x / 2, y1 = y / 2;
  return (x, y) => {
    const i = Math.max(Math.abs(x) - x1, 0);
    const j = Math.max(Math.abs(y) - y1, 0);
    return Math.sqrt(i * i + j * j);
  }
}

export function Box(x: number = 2, y: number = x, z: number = y): Shape3 {
  const x1 = x / 2, y1 = y / 2, z1 = z / 2;
  return (x, y, z) => {
    const i = Math.max(Math.abs(x) - x1, 0);
    const j = Math.max(Math.abs(y) - y1, 0);
    const k = Math.max(Math.abs(z) - z1, 0);
    return Math.sqrt(i * i + j * j + k * k);
  }
}

