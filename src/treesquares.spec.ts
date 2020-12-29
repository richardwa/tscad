
import { ScalableSquare, createSquare, combine4Squares, printSquare } from './treesquares';

const one = createSquare(1);
const zero = createSquare(0);


printSquare(zero);
printSquare(one);

const a = combine4Squares([one, zero, zero, one]);
console.log("test 1", a.size);
printSquare(a);

const b = combine4Squares([one, one, one, one]);
console.log("test 2", b.size);
printSquare(b);

const c = combine4Squares([a, b, b, a]);
console.log("test 3", c.size);
printSquare(c);