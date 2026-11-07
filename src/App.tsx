import { useEffect, useState } from "react";
import {
  DIFFICULTIES,
  getNpcMove,
  getWinner,
  type Board,
  type Difficulty,
} from "./game";

type GameResult = "playing" | "win" | "loss" | "draw";
type FirstPlayer = "you" | "bot";
type Turn = "player" | "npc";
type Streak = { current: number; best: number };
type Streaks = Record<Difficulty, Streak>;

const emptyStreaks: Streaks = {
  easy: { current: 0, best: 0 },
  medium: { current: 0, best: 0 },
  hard: { current: 0, best: 0 },
  master: { current: 0, best: 0 },
};

function loadStreaks(): Streaks {
  const stored = localStorage.getItem("tic-tac-toe-streaks");
  if (!stored) return emptyStreaks;

  const parsed: unknown = JSON.parse(stored);
  if (!parsed || typeof parsed !== "object") return emptyStreaks;

  const result = { ...emptyStreaks };
  for (const difficulty of DIFFICULTIES) {
    const value = (parsed as Record<string, unknown>)[difficulty.id];
    if (value && typeof value === "object") {
      const streak = value as Record<string, unknown>;
      result[difficulty.id] = {
        current: typeof streak.current === "number" ? streak.current : 0,
        best: typeof streak.best === "number" ? streak.best : 0,
      };
    }
  }
  return result;
}

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [firstPlayer, setFirstPlayer] = useState<FirstPlayer>("you");
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [result, setResult] = useState<GameResult>("playing");
  const [started, setStarted] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [turn, setTurn] = useState<Turn>("player");
  const [streaks, setStreaks] = useState<Streaks>(loadStreaks);
  const playerMark = firstPlayer === "you" ? "X" : "O";
  const npcMark = playerMark === "X" ? "O" : "X";

  useEffect(() => {
    localStorage.setItem("tic-tac-toe-streaks", JSON.stringify(streaks));
  }, [streaks]);

  useEffect(() => {
    if (!started || result !== "playing") return;
    if (turn !== "npc") return;

    setThinking(true);
    const timer = window.setTimeout(() => {
      const square = getNpcMove(board, difficulty, npcMark);
      const next = [...board];
      next[square] = npcMark;
      setBoard(next);
      setThinking(false);

      if (getWinner(next) === npcMark) finishRound("loss");
      else if (next.every(Boolean)) finishRound("draw");
      else setTurn("player");
    }, 500);

    return () => window.clearTimeout(timer);
  }, [board, difficulty, npcMark, result, started, turn]);

  function finishRound(outcome: Exclude<GameResult, "playing">) {
    setResult(outcome);
    setStreaks((previous) => {
      const current = outcome === "win" ? previous[difficulty].current + 1 : 0;
      return {
        ...previous,
        [difficulty]: {
          current,
          best: Math.max(previous[difficulty].best, current),
        },
      };
    });
  }

  function startGame() {
    setBoard(Array(9).fill(null));
    setResult("playing");
    setThinking(false);
    setTurn(firstPlayer === "you" ? "player" : "npc");
    setStarted(true);
  }

  function playSquare(square: number) {
    if (!started || result !== "playing" || turn !== "player" || thinking || board[square] !== null) return;

    const next = [...board];
    next[square] = playerMark;
    setBoard(next);
    if (getWinner(next) === playerMark) finishRound("win");
    else if (next.every(Boolean)) finishRound("draw");
    else setTurn("npc");
  }

  const selectedDifficulty = DIFFICULTIES.find((item) => item.id === difficulty)!;
  const currentStreak = streaks[difficulty].current;
  const bestStreak = streaks[difficulty].best;
  const isMilestone = currentStreak >= 3;

  function statusText() {
    if (result === "win") return "You got this one!";
    if (result === "loss") return "The bot takes this round.";
    if (result === "draw") return "A perfect little stalemate.";
    if (thinking) return "The bot is thinking...";
    return turn === "player" ? `Your turn — you're ${playerMark}` : `Bot's turn — it's ${npcMark}`;
  }

  return (
    <main className="min-h-screen px-5 pb-12 pt-6 sm:px-8 sm:pt-8">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <a className="brand" href="#" aria-label="Tic Tac Toe home">
          <span className="brand-mark" aria-hidden="true">xo</span>
          <span>little XO</span>
        </a>
        <div className="top-note">
          <span className="online-dot" />
          <span>Ready when you are</span>
        </div>
      </header>

      {!started ? (
        <section className="landing-layout mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-star">✳</span> THE CLASSIC, REIMAGINED</p>
            <h1>One board.<br />A <span className="headline-accent">little</span> rivalry.</h1>
            <p className="hero-description">
              A quick game of Xs and Os, with a bot that meets you where you are.
              Pick your level, make your move, and see how long you can keep a streak alive.
            </p>
            <div className="hero-footnote">
              <span className="avatar-pair" aria-hidden="true"><i>X</i><i>O</i></span>
              <span>Just you, the bot, and a 3 × 3 board.</span>
            </div>
          </div>

          <div className="setup-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">FIRST THINGS FIRST</p>
                <h2>Choose your opponent</h2>
              </div>
              <span className="step-count">01 <span>/ 02</span></span>
            </div>

            <div className="difficulty-list" role="radiogroup" aria-label="Choose bot difficulty">
              {DIFFICULTIES.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  role="radio"
                  aria-checked={difficulty === item.id}
                  className={`difficulty-option ${difficulty === item.id ? "is-selected" : ""}`}
                  onClick={() => setDifficulty(item.id)}
                >
                  <span className={`difficulty-symbol difficulty-${item.id}`} aria-hidden="true">
                    {item.id === "easy" ? "✳" : item.id === "medium" ? "↗" : item.id === "hard" ? "⌁" : "✦"}
                  </span>
                  <span className="difficulty-copy">
                    <span className="difficulty-name">{item.name}</span>
                    <span className="difficulty-description">{item.description}</span>
                  </span>
                  <span className="difficulty-level" aria-label={`${item.level} out of 4`}>
                    {Array.from({ length: 4 }, (_, index) => (
                      <i key={index} className={index < item.level ? "filled" : ""} />
                    ))}
                  </span>
                  <span className="radio-indicator" aria-hidden="true" />
                </button>
              ))}
            </div>

            <div className="starter-picker">
              <p className="starter-label">WHO GOES FIRST?</p>
              <div className="starter-options" role="radiogroup" aria-label="Choose who starts">
                {(["you", "bot"] as const).map((starter) => (
                  <button
                    type="button"
                    key={starter}
                    role="radio"
                    aria-checked={firstPlayer === starter}
                    className={`starter-option ${firstPlayer === starter ? "is-selected" : ""}`}
                    onClick={() => setFirstPlayer(starter)}
                  >
                    <span className="starter-mark">{starter === "you" ? "X" : "O"}</span>
                    <span>{starter === "you" ? "I’ll go first" : "Bot goes first"}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="streak-preview">
              <div className="streak-icon" aria-hidden="true">↗</div>
              <div className="streak-copy">
                <strong>{currentStreak} win{currentStreak === 1 ? "" : "s"} in a row</strong>
                <span>
                  {currentStreak >= 3
                    ? "Three in a row! Your streak is on."
                    : `${3 - currentStreak} more to light up your streak.`}
                </span>
              </div>
              <div className="record-pill" title={`${selectedDifficulty.name} best streak`}>
                <span>BEST</span>
                <strong>{bestStreak}</strong>
              </div>
            </div>

            <button type="button" className="start-button" onClick={startGame}>
              Let&apos;s play <span aria-hidden="true">↗</span>
            </button>
            <p className="privacy-note">Your streaks stay on this device.</p>
          </div>
        </section>
      ) : (
        <section className="game-layout mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="game-copy">
            <button type="button" className="back-link" onClick={() => setStarted(false)}>
              <span aria-hidden="true">←</span> Change opponent
            </button>
            <p className="eyebrow"><span className="eyebrow-star">✳</span> YOU&apos;RE PLAYING</p>
            <h1>A <span className="headline-accent">{selectedDifficulty.name.toLowerCase()}</span><br />kind of day.</h1>
            <p className="hero-description">
              You&apos;re <strong className={playerMark === "X" ? "text-x" : "text-o"}>{playerMark}</strong>,
              {" "}the bot is <strong className={npcMark === "X" ? "text-x" : "text-o"}>{npcMark}</strong>.
              {selectedDifficulty.id === "master"
                ? " The Master plays perfectly — can you force a draw?"
                : firstPlayer === "bot"
                  ? " The bot gets the first move. See if you can turn the tables."
                  : " Make your move and see what the bot has in store."}
            </p>

            <div className="streak-panel">
              <div className="streak-icon large" aria-hidden="true">↗</div>
              <div className="streak-copy">
                <span className="panel-label">YOUR {selectedDifficulty.name.toUpperCase()} STREAK</span>
                <strong className="streak-number">{currentStreak} <small>in a row</small></strong>
                <span>
                  {isMilestone ? "Three in a row! Keep it going." : `${3 - currentStreak} more win${3 - currentStreak === 1 ? "" : "s"} to hit your streak.`}
                </span>
              </div>
              <div className="record-panel">
                <span>PERSONAL BEST</span>
                <strong>{bestStreak}</strong>
              </div>
            </div>
            <button type="button" className="text-button" onClick={startGame}>
              <span aria-hidden="true">↻</span> Start a new round
            </button>
          </div>

          <div className="game-card">
            <div className="game-card-top">
              <div className="versus">
                <div className={`player-tag ${turn === "player" && result === "playing" ? "active" : ""}`}>
                  <span className={`player-symbol ${playerMark === "X" ? "text-x" : "text-o"}`}>{playerMark}</span><span>You</span>
                </div>
                <span className="versus-divider">vs</span>
                <div className={`player-tag ${turn === "npc" && result === "playing" ? "active" : ""}`}>
                  <span className={`player-symbol ${npcMark === "X" ? "text-x" : "text-o"}`}>{npcMark}</span><span>Bot</span>
                </div>
              </div>
              <span className={`game-status ${result !== "playing" ? "finished" : ""}`}>
                <i className={thinking ? "thinking-dot" : ""} /> {statusText()}
              </span>
            </div>

            <div className="board" role="grid" aria-label="Tic tac toe board">
              {board.map((cell, index) => (
                <button
                  type="button"
                  role="gridcell"
                  key={index}
                  className={`board-cell ${cell ? `mark-${cell.toLowerCase()}` : ""}`}
                  onClick={() => playSquare(index)}
                  disabled={Boolean(cell) || result !== "playing" || thinking}
                  aria-label={`Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}${cell ? `, ${cell}` : ", empty"}`}
                >
                  {cell && <span>{cell}</span>}
                </button>
              ))}
            </div>
            <div className="game-card-bottom">
              <span><i className={playerMark === "X" ? "legend-x" : "legend-o"}>{playerMark}</i> {turn === "player" ? "Your move" : result === "playing" ? "Bot's move" : "Round finished"}</span>
              <span>First to three in a row wins</span>
            </div>
          </div>
        </section>
      )}

      <footer className="page-footer mx-auto flex w-full max-w-6xl items-center justify-between">
        <span>Made for one more round <span className="footer-heart">♥</span></span>
        <span>TIC TAC TOE <i>·</i> 2026</span>
      </footer>
    </main>
  );
}

export default App;
