import React from "react";

interface Props {
  onStartGame: () => void;
}

export default function StartScreen({ onStartGame }: Props) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#1e1e1e] z-50 items-center justify-center space-y-8">
      <p className="text-4xl font-bold">{`Slip n' Slide`}</p>
      <div className="text-center flex flex-col items-start border p-2 rounded-sm">
        <p className="text-xl mb-2">Instructions:</p>
        <ul className="text-lg space-y-2 flex flex-col items-start">
          <li>❄️ Slide across the ice tiles using arrow keys.</li>
          <li>🪨 Avoid obstacles like boulders.</li>
          <li>🏁 Reach the goal at the bottom right corner to win.</li>
          <li>🚶‍♂️ Plan your moves carefully to navigate through the maze.</li>
        </ul>
      </div>
      <button
        onClick={onStartGame}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Start Game
      </button>
    </div>
  );
}
