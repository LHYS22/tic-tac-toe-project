# Tic Tac Toe

A responsive player-versus-NPC tic-tac-toe game built with React, TypeScript, Vite, and Tailwind CSS.

Choose whether you or the bot makes the first move before starting a round.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production site is written to `dist/`. GitHub Pages deployment is configured through the workflow in `.github/workflows/deploy.yml`; in the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

## Difficulty and streaks

- **Easy:** the NPC chooses a random open square.
- **Medium:** the NPC takes a winning move or blocks yours, then favors the center and corners.
- **Hard:** the NPC uses depth-limited minimax and occasionally makes a less accurate move.
- **Master:** the NPC uses full minimax and plays optimally.

Current and best winning streaks are saved independently for every difficulty in the browser's local storage. A streak milestone is reached at three consecutive wins.
