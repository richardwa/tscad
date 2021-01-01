
const a = [];
console.time('obj');
for (let i = 0; i < 1000000; i++) {
  a[i] = new Uint32Array(1);
}
console.timeEnd('obj');