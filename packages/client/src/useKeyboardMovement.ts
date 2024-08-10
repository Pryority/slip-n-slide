import { Dispatch, SetStateAction, useEffect } from "react";
import { useMUD } from "./MUDContext";
import { Direction } from "./direction";

export const useKeyboardMovement = (
  setDirection: Dispatch<SetStateAction<Direction>>,
) => {
  const {
    systemCalls: { move },
  } = useMUD();

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        move(setDirection, Direction.North);
      }
      if (e.key === "ArrowDown") {
        move(setDirection, Direction.South);
      }
      if (e.key === "ArrowLeft") {
        move(setDirection, Direction.West);
      }
      if (e.key === "ArrowRight") {
        move(setDirection, Direction.East);
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [move, setDirection]);
};
