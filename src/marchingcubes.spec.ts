import { divideVolume } from "./marchingcubes";

let divided = divideVolume(0, [[-11, -10, -10], [10, 10, 10]]);
console.log(divided);
divided = divideVolume(1, [[-11, -10, -10], [10, 10, 10]]);
console.log(divided);
divided = divideVolume(2, [[-11, -10, -10], [10, 10, 10]]);
console.log(divided);