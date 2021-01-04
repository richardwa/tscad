import { connectNodes, Direction, Node } from "./cubetrees2";

type Assert = typeof console.assert;
type Test = (a: Assert) => void;

class Props {
  id: number;
}

let initNodes: Node<Props>[];
function createCube(): Node<Props> {
  let counter = 0;
  class TestNode extends Node<Props>{
    constructor() {
      super();
      this.data = {
        id: counter++
      };
    }
    createNode(direction: Direction, to: TestNode) {
      return new TestNode();
    }
  }
  initNodes = [...new Array(8)].map(() => new TestNode());
  connectNodes(initNodes);
  return initNodes[0];
}

const tests: { [k: string]: Test } = {
  "construct cube": (assert) => {
    const cube = createCube();
    const nodes = cube.getNodes();
    assert(nodes.size === 8, `expect 8, got ${nodes.size}`);
  },
  "find corner": (assert) => {
    const cube = createCube();
    assert(cube.find(0).data.id === 1, 'expect 1');
    assert(cube.find(1).data.id === 3, 'expect 2');
    assert(cube.find(2).data.id === 4, 'expect 4');
    assert(cube.next[0].n.next[2].n.data.id === 5, 'expect 5');
    assert(cube.find(0).find(2).data.id === 5, 'expect 5');
    assert(cube.find(1).find(2).data.id === 7, 'expect 7');
  },
  "all corners": (assert) => {
    const cube = createCube();
    const corners = cube.getCorners();
    assert(corners.length === 8, 'require 8 corners');
    corners.forEach((c, i) => {
      assert(c === initNodes[i], `${i} is null`);
    });
  },
  "_divide cube": (assert) => {
    const cube = createCube();
    const originalSize = cube.size[0];
    const cubes = cube.divideCube(0);
    const nodes = cube.getNodes();
    // console.dir(cubes[0].getCorners(), { depth: 4 });
    // console.dir(cubes[1].getCorners(), { depth: 4 });
    assert(nodes.size === 12, `expect 12, got ${nodes.size}`);
    assert(cubes[0].size[0] === originalSize / 2, `size check x, got ${cubes[0].size[0]}`);
    assert(cubes[0].size[1] === originalSize, `size check y`);
    assert(cubes[0].size[2] === originalSize, `size check z`);

  },
  "_octant divide": (assert) => {
    const cube = createCube();
    cube.octantDivide();
    const nodes = cube.getNodes();
    assert(nodes.size === 27, `expect 27 nodes, got  ${nodes.size}`);

    const corners = cube.getCorners();
    assert(corners[0] === initNodes[0], 'ensure corner zero is same');
    assert(corners[1].find(0) === initNodes[1], 'ensure corner 1 is same');

    assert(corners[6].getCorners()[6] === initNodes[6], 'ensure last corner is same');
  },
}


const TestRunner = () => {
  const runTest = ([k, t]: [k: string, t: Test]) => {
    let pass = true;
    const assert: Assert = (a, b) => {
      if (!a) {
        pass = false;
      }
      console.assert(a, b);
    };
    console.log('TEST: ' + k);
    t(assert);
    if (pass) {
      console.log('PASSED\n');
    } else {
      console.log('FAILED\n');
    }
  }

  Object.entries(tests).filter(([k, t]) => {
    return k.startsWith("_");
  }).forEach(runTest);
};
TestRunner();