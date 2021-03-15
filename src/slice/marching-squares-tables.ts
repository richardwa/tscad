
/// corners indexes
/// 3    2
/// ○ -- ○
/// |    |
/// ○ -- ○
/// 0    1

/// edge indexes
///    2
///  ○ -- ○
/// 3|    | 1
///  ○ -- ○
///    0    

const edges = [
  [0, 1], [1, 2], [2, 3], [3, 0]
];

const cases = [
  /// ○ -- ○
  /// |    |
  /// ○ -- ○
  [],

  /// ○ -- ○
  /// |    |
  /// ● -- ○
  [3, 0],

  /// ○ -- ○
  /// |    |
  /// ○ -- ●
  [0, 1],

  /// ○ -- ○
  /// |    |
  /// ● -- ●
  [3, 1],

  /// ○ -- ●
  /// |    |
  /// ○ -- ○
  [1, 2],

  /// ○ -- ●
  /// |    |
  /// ● -- ○
  // ambiguous case, for my purpose we can ignore this case and split into smaller squares
  undefined,

  /// ○ -- ●
  /// |    |
  /// ○ -- ●
  [0, 2],

  /// ○ -- ●
  /// |    |
  /// ● -- ●
  [3, 2]
]

export const edgeTable: number[][][] = [
  ...cases,
  ...cases.map(c =>
    c === undefined ?
      undefined :
      c.reverse())
    .reverse()
].map(pairs => {
  if (pairs) {
    return pairs.map(p => edges[p]);
  }
});