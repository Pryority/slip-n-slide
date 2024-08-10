import { useEffect } from "react";
import confetti from "canvas-confetti";

interface Props {
  onRestartGame: () => void;
}

export default function WinningScreen({ onRestartGame }: Props) {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-amber-500 z-50 items-center justify-center">
      <p className="text-4xl font-bold mb-4">You Won!</p>
      <button
        onClick={onRestartGame}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Restart
      </button>
    </div>
  );
}
