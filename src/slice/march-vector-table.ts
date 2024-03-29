export const outgoingDirection = [
  /// ○ -- ○
  /// |    |
  /// ○ -- ○  0
  [0, 0],

  /// ○ -- ○
  /// |    |
  /// ● -- ○  1
  [0, -1],

  /// ○ -- ○
  /// |    |
  /// ○ -- ●  2
  [1, 0],

  /// ○ -- ○
  /// |    |
  /// ● -- ●  3
  [1, 0],

  /// ● -- ○
  /// |    |
  /// ○ -- ○  4
  [-1, 0],

  /// ● -- ○
  /// |    |
  /// ● -- ○  5
  [0, -1],

  /// ● -- ○
  /// |    |
  /// ○ -- ●  6
  [], // won't happen

  /// ● -- ○
  /// |    |
  /// ● -- ● 7
  [1, 0],

  /// ○ -- ●
  /// |    |
  /// ○ -- ○ 8
  [0, 1],

  /// ○ -- ●
  /// |    |
  /// ● -- ○ 9
  [],

  /// ○ -- ●
  /// |    |
  /// ○ -- ● 10
  [0, 1],

  /// ○ -- ●
  /// |    |
  /// ● -- ● 11
  [0, 1],

  /// ● -- ●
  /// |    |
  /// ○ -- ○ 12
  [-1, 0],

  /// ● -- ●
  /// |    |
  /// ● -- ○ 13
  [0, -1],

  /// ● -- ●
  /// |    |
  /// ○ -- ● 14
  [-1, 0],

  /// ● -- ●
  /// |    |
  /// ● -- ● 15
  []
]
