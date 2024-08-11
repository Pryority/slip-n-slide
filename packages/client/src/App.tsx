import { useState } from "react";
import { useComponentValue } from "@latticexyz/react";
import { SyncStep } from "@latticexyz/store-sync";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMUD } from "./MUDContext";
import { GameBoard } from "./GameBoard";
import WinningScreen from "./WinningScreen";
import StartScreen from "./StartScreen";

export const App = () => {
  const {
    components: { SyncProgress },
    systemCalls: { spawn, respawn },
  } = useMUD();

  const loadingState = useComponentValue(SyncProgress, singletonEntity, {
    step: SyncStep.INITIALIZE,
    message: "Connecting",
    percentage: 0,
    latestBlockNumber: 0n,
    lastBlockNumberProcessed: 0n,
  });

  const [gameStarted, setGameStarted] = useState(false);
  // const [complete, setComplete] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
    setHasWon(false);
    spawn(0, 0);
  };

  const handleWinGame = () => {
    setHasWon(true);
  };

  const handleRestartGame = async () => {
    setGameStarted(false);
    setHasWon(false);
    respawn(0, 0);
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      {loadingState.step !== SyncStep.LIVE ? (
        <div>
          {loadingState.message} ({loadingState.percentage.toFixed(2)}%)
        </div>
      ) : hasWon ? (
        <WinningScreen onRestartGame={handleRestartGame} />
      ) : !gameStarted ? (
        <StartScreen onStartGame={handleStartGame} />
      ) : (
        <GameBoard onWinGame={handleWinGame} />
      )}
    </div>
  );
};
