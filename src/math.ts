
export function distance(...xs: number[]) {
  let sum = 0.0;
  for (const x of xs) {
    sum += x * x;
  }
  return Math.sqrt(sum);
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