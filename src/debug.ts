import { CubeFace } from "./surfacenets";

const DEBUG = true;
type Log = typeof console.log;
export const log: Log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
}

export const logFace = (name: string, c: CubeFace) => {
  if (DEBUG) {
    console.log("print face", name);
    for (let j = c.b_size - 1; j >= 0; j--) {
      const sb = [];
      for (let i = 0; i < c.a_size; i++) {
        sb.push(c.get(i, j) ? 1 : 0);
      }
      console.log(sb.join(' '));
    }
  }
}