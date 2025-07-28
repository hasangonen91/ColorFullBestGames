export type BoardType5x5 = number[][];

export const getEmptyBoard5x5 = (): BoardType5x5 => [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
];

const hasValue = (board: BoardType5x5, value: number): boolean => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === value) {
        return true;
      }
    }
  }
  return false;
};

export const isFull5x5 = (board: BoardType5x5): boolean => {
  return !hasValue(board, 0);
};

const getRandomPosition = (): [number, number] => {
  const rowPosition = Math.floor(Math.random() * 5);
  const colPosition = Math.floor(Math.random() * 5);
  return [rowPosition, colPosition];
};

export const generateRandom5x5 = (board: BoardType5x5): BoardType5x5 => {
  if (isFull5x5(board)) {
    return board;
  }
  let [row, col] = getRandomPosition();
  while (board[row][col] !== 0) {
    [row, col] = getRandomPosition();
  }
  board[row][col] = 2;
  return board;
};

const takingAllToLeft = (board: BoardType5x5): BoardType5x5 => {
  const newBoard = getEmptyBoard5x5();
  for (let i = 0; i < board.length; i++) {
    let colIndex = 0;
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] !== 0) {
        newBoard[i][colIndex] = board[i][j];
        colIndex++;
      }
    }
  }
  return newBoard;
};

const merge = (board: BoardType5x5): [BoardType5x5, number] => {
  let score = 0;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length - 1; j++) {
      if (board[i][j] !== 0 && board[i][j] === board[i][j + 1]) {
        board[i][j] = board[i][j] * 2;
        score += board[i][j];
        board[i][j + 1] = 0;
      }
    }
  }
  return [board, score];
};

export const moveLeft5x5 = (board: BoardType5x5): [BoardType5x5, number] => {
  const newBoard1 = takingAllToLeft(board);
  const newBoard2 = merge(newBoard1);
  return [takingAllToLeft(newBoard2[0]), newBoard2[1]];
};

const reverse = (board: BoardType5x5): BoardType5x5 => {
  const reverseBoard = getEmptyBoard5x5();
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      reverseBoard[i][j] = board[i][board[i].length - 1 - j];
    }
  }
  return reverseBoard;
};

export const moveRight5x5 = (board: BoardType5x5): [BoardType5x5, number] => {
  const reversedBoard = reverse(board);
  const newBoard = moveLeft5x5(reversedBoard);
  return [reverse(newBoard[0]), newBoard[1]];
};

const rotateLeft = (board: BoardType5x5): BoardType5x5 => {
  const rotateBoard = getEmptyBoard5x5();
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      rotateBoard[i][j] = board[j][board[i].length - 1 - i];
    }
  }
  return rotateBoard;
};

const rotateRight = (board: BoardType5x5): BoardType5x5 => {
  const rotateBoard = getEmptyBoard5x5();
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      rotateBoard[i][j] = board[board[i].length - 1 - j][i];
    }
  }
  return rotateBoard;
};

export const moveUp5x5 = (board: BoardType5x5): [BoardType5x5, number] => {
  const rotateBoard = rotateLeft(board);
  const newBoard = moveLeft5x5(rotateBoard);
  return [rotateRight(newBoard[0]), newBoard[1]];
};

export const moveDown5x5 = (board: BoardType5x5): [BoardType5x5, number] => {
  const rotateBoard = rotateRight(board);
  const newBoard = moveLeft5x5(rotateBoard);
  return [rotateLeft(newBoard[0]), newBoard[1]];
};

export const checkScore5x5 = (board: BoardType5x5): boolean => {
  return hasValue(board, 2048);
};

const hasDiff = (board: BoardType5x5, updatedBoard: BoardType5x5): boolean => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] !== updatedBoard[i][j]) {
        return true;
      }
    }
  }
  return false;
};

export const isOver5x5 = (board: BoardType5x5): boolean => {
  return !(
    hasDiff(board, moveLeft5x5(board)[0]) ||
    hasDiff(board, moveRight5x5(board)[0]) ||
    hasDiff(board, moveUp5x5(board)[0]) ||
    hasDiff(board, moveDown5x5(board)[0])
  );
}; 