import { Corner, createCube, Cube, Edge } from "./cubetrees";
import { Vector } from "./math";

type Assert = typeof console.assert;
type Test = (a: Assert) => void;

const getCube = (p: Pair<Vec3> = [[-32, -32, -32], [32, 32, 32]]) => createCube(p);

const tests: { [k: string]: Test } = {
  "construct edge": (assert) => {
    const edge = new Edge([
      new Corner([0, 0, 0]),
      new Corner([0, 0, 1])
    ]);
    assert(edge.corners.length === 2, "edge needs 2 corners");
  },
  "split edge": (assert) => {
    const edge = new Edge([
      new Corner([0, 0, 0]),
      new Corner([0, 0, 2])
    ]);
    const ch = edge.split();
    ch.forEach((e, i) => {
      e.corners.forEach((c, j) => {
        assert(c, `${i} ${j} corner`);
      })
    });
    assert(edge.children.length === 2, "split edge needs 2 children");
  },
  "construct cube": (assert) => {
    const cube = getCube();
    assert(new Set(cube.edges).size === 12, "number of edges not correct");
    assert(new Set(cube.getCorners()).size === 8, "number of corners not correct");
  },
  "corners": (assert) => {
    const cube = getCube();
    cube.getCorners().forEach((c, i) => {
      assert(c, `${i} corner is empty`);
    });
  },
  "face corners": (assert) => {
    const cube = getCube();
    for (let f = 0; f < 6; f++) {
      const corners = cube.getFaceCorners(f);
      corners.forEach((c, i) => {
        assert(c, `${f} ${i}  corner: ${c}`);
      });
    }
  },
  "get leaf edges": (assert) => {
    const cube = getCube();
    let count: number;
    count = cube.getLeafEdges().size;
    assert(count === 12, `expected 12 edges, got ${count}`);
    cube.split();
    count = cube.getLeafEdges().size;
    // 24 edge edge
    // 5 face edge per face
    // 6 faces
    // 24 + 5x6 = 54
    assert(count === 54, `expected 54 edges, got ${count}`);
  },
  "child edges": (assert) => {
    const cube = getCube();
    cube.split().forEach((ch, i) => {
      ch.edges.forEach((e, j) => {
        assert(e, `child ${i}, edge ${j} : ${e}`);
      })
    });
  },
  "child corners": (assert) => {
    const cube = getCube();
    const s = cube.split();
    s.forEach((ch, i) => {
      ch.getCorners().forEach((c, j) => {
        assert(c, `child ${i}: ${ch.name}; corner ${j} ${c}`);
      })
    });
  },
  "child sizes": (assert) => {
    const cube = getCube();
    cube.split().forEach((c: Cube, i) => {
      const c1 = c.getCorner(0);
      const c2 = c.getCorner(6);
      const maxLen = new Vector(c2.pos).minus(c1.pos).result;

      for (let j = 0; j < 3; j++) {
        assert(maxLen[j] === 32, `size of child ${i}, ${j} not correct, expect 32 got: ${maxLen[j]}`);
      }
    });
  }
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
    return !k.startsWith("_");
  }).forEach(runTest);
};
TestRunner();