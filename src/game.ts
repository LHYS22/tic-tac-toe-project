export type Mark = "X" | "O";
export type Cell = Mark | null;
export type Board = Cell[];
export type Difficulty = "easy" | "medium" | "hard" | "master";

export const DIFFICULTIES: {
  id: Difficulty;
  name: string;
  description: string;
  level: number;
}[] = [
  { id: "easy", name: "Easy", description: "A nice warm-up.", level: 1 },
  { id: "medium", name: "Medium", description: "Knows a few tricks.", level: 2 },
  { id: "hard", name: "Hard", description: "Thinks a few moves ahead.", level: 3 },
  { id: "master", name: "Master", description: "A perfect-play machine.", level: 4 },
];

export function getWinner(board: Board): Mark | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [first, second, third] of lines) {
    if (board[first] && board[first] === board[second] && board[first] === board[third]) {
      return board[first];
    }
  }
  return null;
}

function openSquares(board: Board): number[] {
  return board.flatMap((cell, index) => (cell === null ? [index] : []));
}

function wouldWin(board: Board, square: number, mark: Mark): boolean {
  const next = [...board];
  next[square] = mark;
  return getWinner(next) === mark;
}

function chooseRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function otherMark(mark: Mark): Mark {
  return mark === "X" ? "O" : "X";
}

function scorePosition(board: Board, depth: number, npcMark: Mark, playerMark: Mark): number {
  const winner = getWinner(board);
  if (winner === npcMark) return 10 - depth;
  if (winner === playerMark) return depth - 10;
  if (openSquares(board).length === 0) return 0;

  let score = 0;
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const line of lines) {
    const computerMarks = line.filter((square) => board[square] === npcMark).length;
    const playerMarks = line.filter((square) => board[square] === playerMark).length;
    if (computerMarks && playerMarks) continue;
    if (computerMarks) score += [0, 1, 6, 0][computerMarks];
    if (playerMarks) score -= [0, 1, 6, 0][playerMarks];
  }
  return score;
}

function minimax(
  board: Board,
  isComputerTurn: boolean,
  depth: number,
  maxDepth: number,
  npcMark: Mark,
  playerMark: Mark,
): number {
  const winner = getWinner(board);
  if (winner || openSquares(board).length === 0 || depth === maxDepth) {
    return scorePosition(board, depth, npcMark, playerMark);
  }

  const scores = openSquares(board).map((square) => {
    const next = [...board];
    next[square] = isComputerTurn ? npcMark : playerMark;
    return minimax(next, !isComputerTurn, depth + 1, maxDepth, npcMark, playerMark);
  });

  return isComputerTurn ? Math.max(...scores) : Math.min(...scores);
}

function minimaxMove(
  board: Board,
  maxDepth: number,
  npcMark: Mark,
  playerMark: Mark,
): { square: number; score: number }[] {
  return openSquares(board).map((square) => {
    const next = [...board];
    next[square] = npcMark;
    return { square, score: minimax(next, false, 1, maxDepth, npcMark, playerMark) };
  });
}

function mediumMove(board: Board, squares: number[], npcMark: Mark, playerMark: Mark): number {
  const win = squares.find((square) => wouldWin(board, square, npcMark));
  if (win !== undefined) return win;

  const block = squares.find((square) => wouldWin(board, square, playerMark));
  if (block !== undefined) return block;

  if (squares.includes(4)) return 4;
  const corners = squares.filter((square) => [0, 2, 6, 8].includes(square));
  if (corners.length) return chooseRandom(corners);
  return chooseRandom(squares);
}

export function getNpcMove(board: Board, difficulty: Difficulty, npcMark: Mark = "O"): number {
  const squares = openSquares(board);
  if (squares.length === 0) throw new Error("Cannot choose a move on a full board.");

  const playerMark = otherMark(npcMark);
  if (difficulty === "easy") return chooseRandom(squares);
  if (difficulty === "medium") return mediumMove(board, squares, npcMark, playerMark);

  const scoredMoves = minimaxMove(
    board,
    difficulty === "master" ? Infinity : 4,
    npcMark,
    playerMark,
  );
  const bestScore = Math.max(...scoredMoves.map(({ score }) => score));
  const bestMoves = scoredMoves.filter(({ score }) => score === bestScore);

  if (difficulty === "hard" && scoredMoves.length > 1 && Math.random() < 0.12) {
    const lessAccurateMoves = scoredMoves.filter(({ score }) => score < bestScore);
    if (lessAccurateMoves.length) return chooseRandom(lessAccurateMoves).square;
  }

  return chooseRandom(bestMoves).square;
}
