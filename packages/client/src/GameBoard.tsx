import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { GameMap } from "./GameMap";
import { useMUD } from "./MUDContext";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { hexToArray } from "@latticexyz/utils";
import { TerrainType, terrainTypes } from "./terrainTypes";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Has, getComponentValueStrict } from "@latticexyz/recs";

export const GameBoard = () => {
  useKeyboardMovement();

  const {
    components: { MapConfig, Player, Position },
    network: { playerEntity },
    systemCalls: { spawn },
  } = useMUD();

  const canSpawn = useComponentValue(Player, playerEntity)?.value !== true;

  // Recompute the players array each time the position changes
  const players = useEntityQuery([Has(Player), Has(Position)]).map((entity) => {
    const position = getComponentValueStrict(Position, entity); // useComponentValueStrict(Position, entity);
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
  console.log("Decoded terrain array:", terrainArray);

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

  return (
    <GameMap
      width={width}
      height={height}
      terrain={terrain}
      onTileClick={canSpawn ? spawn : undefined}
      players={players} // Pass the updated players array
    />
  );
};
