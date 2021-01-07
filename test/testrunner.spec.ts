

type Assert = (b: boolean, s: string) => void;
export type Converter<T> = (t: T) => any;
type AssertEquals<T> = (a: T, b: T, s?: string, c?: Converter<T>) => void;

type Test<T> = (p: { assert: Assert, assertEquals: AssertEquals<T> }) => void;
const identity = (o: any) => o;
export type Tests<T> = { [k: string]: Test<T> };

export const TestRunner = <T>(
  tests: Tests<T>,
  filter: (t: string) => boolean = () => true,
  converter: Converter<T> = identity
) => {
  const runTest = ([k, t]: [k: string, t: Test<T>]) => {
    let pass = true;
    const assert: Assert = (a, b) => {
      if (!a) {
        pass = false;
      }
      console.assert(a, b);
    };
    const assertEquals: AssertEquals<T> = (a, b, s = '', c = converter) => {
      const x = c(a);
      const y = c(b);
      if (x !== y) {
        pass = false;
      }
      console.assert(x === y, `${x} !== ${y} : ${s}`);
    }
    console.log('TEST: ' + k);
    t({ assert, assertEquals });
    if (pass) {
      console.log('PASSED\n');
    } else {
      console.log('FAILED\n');
    }
  }
  Object.entries(tests)
    .filter(([k, t]) => filter(k))
    .forEach(runTest);
};