import { CubeFace } from "./surfacenets";

const DEBUG = true;
type Log = typeof console.log;
export const llog = (f: Log) => {
  if (DEBUG) {
    console.log(f());
  }
}

export const log: Log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
}