import React from "react";

interface Props {
  onStartGame: () => void;
}

export default function StartScreen({ onStartGame }: Props) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#1e1e1e] z-50 items-center justify-center space-y-8">
      <div
        className={
          "h-96 w-96 absolute right-40 flex z-[-1] opacity-25 animate-bounce"
        }
      >
        <img src="/pudgy.png" alt="Player" className="object-cover" />
      </div>
      <p className="text-6xl uppercase italic font-bold">{`Slip n' Slide`}</p>
      <div className="text-center flex flex-col items-start border p-2 rounded-sm bg-neutral-950/80 backdrop-blur-sm">
        <ul className="text-lg space-y-2 flex flex-col items-start">
          <li className="text-neutral-50">
            ❄️ Slide across the ice tiles using arrow keys.
          </li>
          <li className="text-neutral-50">🪨 Avoid obstacles like boulders.</li>
          <li className="text-neutral-50">
            🏁 Reach the goal at the bottom right corner to win.
          </li>
          <li className="text-neutral-50">
            🚶‍♂️ Plan your moves carefully to navigate through the maze.
          </li>
        </ul>
      </div>
      <button
        onClick={onStartGame}
        className="px-7 py-3 text-xl bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Start Game
      </button>
    </div>
  );
}
