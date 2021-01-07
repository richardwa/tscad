import { TestRunner, Tests, Converter } from "../test/testrunner.spec";
import { Cube, Direction, Position } from "./cubetree";

const converter: Converter<Cube<any>> = (c: Cube<any>) => c && c.path.join('');

const tests: Tests<Cube<any>> = {
  "test get neighbor": ({ assertEquals }) => {
    const cube = new Cube([], null);
    const ch = cube.split();

    assertEquals(
      ch[Position.botfrontright],
      ch[Position.botfrontleft].getNeighbor(Direction.right),
      'case 1');

    assertEquals(
      ch[Position.botbackright],
      ch[Position.topbackright].getNeighbor(Direction.bottom),
      'case 2');

    assertEquals(
      ch[Position.botbackleft],
      ch[Position.botfrontleft].getNeighbor(Direction.back),
      'case 3');
  },
  "uncle": ({ assertEquals }) => {
    const cube = new Cube([], null);
    const ch = cube.split();

    const ch2 = ch[Position.botfrontright].split();

    assertEquals(
      ch[Position.botfrontleft],
      ch2[Position.topbackleft].getNeighbor(Direction.left));

  },
  "test split": ({ assertEquals }) => {
    const cube = new Cube([], null);
    const ch = cube.split();

    const ch0 = ch[Position.botfrontleft].split();
    const ch1 = ch[Position.botfrontright].split();

    assertEquals(
      ch0[Position.topfrontright],
      ch1[Position.topfrontleft].getNeighbor(Direction.left),
      'cousin');

  }
};

TestRunner(tests, undefined, converter);