
import { ScalableSquare, createSquare, combine4Squares, printSquare } from './treesquares';
const blank = createSquare(null);
const zero = createSquare(0);
const one = createSquare(1);
const two = createSquare(2);


printSquare(zero);
printSquare(one);

const a = combine4Squares([one, zero, two, blank]);
console.log("test a", a.size);
printSquare(a);

const b = combine4Squares([one, two, zero, one]);
console.log("test b", b.size);
printSquare(b);

const c = combine4Squares([a, b, a, b]);
console.log("test c", c.size);
printSquare(c, o => o === null ? ' ' : o);

const d = combine4Squares([a, b, a, b], 8);
console.log("test d", d.size);
printSquare(d, o => o === null ? ' ' : o);

const mat: number[][] = [[], [], [], []];
const width = Math.sqrt(c.size);
let count = 0;
c.forEach((n, i, j) => {
  count++;
  mat[j][i] = n;
});
console.log(count);
console.log(mat);

