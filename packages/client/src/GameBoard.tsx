import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { GameMap } from "./GameMap";
import { useMUD } from "./MUDContext";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { hexToArray } from "@latticexyz/utils";
import { TerrainType, terrainTypes } from "./terrainTypes";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Has, getComponentValueStrict } from "@latticexyz/recs";
import { useCallback, useEffect, useState } from "react";
import { Direction } from "./direction";

export const GameBoard = ({ onWinGame }: { onWinGame: () => void }) => {
  const [direction, setDirection] = useState<Direction>(Direction.East);

  useKeyboardMovement(setDirection);

  const {
    components: { MapConfig, Player, Position },
    network: { playerEntity },
  } = useMUD();

  const players = useEntityQuery([Has(Player), Has(Position)]).map((entity) => {
    const position = getComponentValueStrict(Position, entity);
    return {
      entity,
      x: position?.x,
      y: position?.y,
      emoji: entity === playerEntity ? "🤠" : "🥸",
    };
  });

  const mapConfig = useComponentValue(MapConfig, singletonEntity);
  if (mapConfig == null) {
    throw new Error(
      "map config not set or not ready, only use this hook after loading state === LIVE",
    );
  }

  const { width, height, terrain: terrainData } = mapConfig;
  const terrainArray = Array.from(hexToArray(terrainData));

  const terrain = terrainArray.map((value, index) => {
    const terrainType = value as TerrainType;
    const terrainConfig = terrainTypes[terrainType] || {
      bgColor: "bg-gray-500",
      emoji: "❓",
    };
    return {
      x: index % width,
      y: Math.floor(index / width),
      bgColor: terrainConfig.bgColor,
      emoji: terrainConfig.emoji,
    };
  });

  const checkWinCondition = useCallback(() => {
    const playerAtGoal = players?.some(
      (p) => p.x === width - 1 && p.y === height - 1,
    );
    if (playerAtGoal) {
      onWinGame?.();
    }
  }, [width, height, onWinGame, players]);

  useEffect(() => {
    checkWinCondition();
  }, [players, checkWinCondition]);

  return (
    <GameMap
      direction={direction}
      width={width}
      height={height}
      terrain={terrain}
      players={players}
    />
  );
};
