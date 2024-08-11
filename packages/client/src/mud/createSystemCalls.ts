import { Has, HasValue, getComponentValue, runQuery } from "@latticexyz/recs";
import { uuid } from "@latticexyz/utils";
import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";
import { Direction } from "../direction";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Dispatch, SetStateAction } from "react";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  { playerEntity, worldContract, waitForTransaction }: SetupNetworkResult,
  {
    MapConfig,
    Obstruction,
    Player,
    Position,
    Slippery,
    Broken,
  }: ClientComponents,
) {
  const isObstructed = (x: number, y: number) => {
    return runQuery([Has(Obstruction), HasValue(Position, { x, y })]).size > 0;
  };

  const isSlippery = (x: number, y: number) => {
    return runQuery([Has(Slippery), HasValue(Position, { x, y })]).size > 0;
  };
  const isBroken = (x: number, y: number) => {
    return runQuery([Has(Broken), HasValue(Position, { x, y })]).size > 0;
  };

  const move = async (
    setDirection: Dispatch<SetStateAction<Direction>>,
    direction: Direction,
  ) => {
    setDirection(direction);

    if (!playerEntity) {
      throw new Error("no player");
    }

    const position = getComponentValue(Position, playerEntity);
    if (!position) {
      console.warn("cannot move without a player position, not yet spawned?");
      return;
    }

    let { x, y } = position;
    if (direction === Direction.North) {
      y -= 1;
    } else if (direction === Direction.East) {
      x += 1;
    } else if (direction === Direction.South) {
      y += 1;
    } else if (direction === Direction.West) {
      x -= 1;
    }

    const mapConfig = getComponentValue(MapConfig, singletonEntity);
    if (!mapConfig) {
      throw new Error("mapConfig not yet loaded or initialized");
    }

    const { width: mapWidth, height: mapHeight } = mapConfig;

    if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) {
      console.error("cannot move out of map boundaries");
      return;
    }

    if (isObstructed(x, y)) {
      console.warn("cannot move to obstructed space");
      return;
    }

    // Add this check for Broken tiles
    if (isBroken(x, y)) {
      console.warn("🕳️☠️ FELL THROUGH ICE!!! RESETTING GAME.");
      respawn(0, 0);
      return;
    }

    if (isSlippery(x, y)) {
      console.log("🥶 BRRRRR!!! SLIPPERY ICE");

      // Handle slippery tiles
      while (isSlippery(x, y)) {
        let nextX = x;
        let nextY = y;

        if (direction === Direction.North) nextY--;
        else if (direction === Direction.East) nextX++;
        else if (direction === Direction.South) nextY++;
        else if (direction === Direction.West) nextX--;

        if (nextX < 0 || nextX >= mapWidth || nextY < 0 || nextY >= mapHeight) {
          console.warn("⚠️ CANNOT SLIDE OFF MAP BOUNDARIES");
          break; // Stop sliding/moving at the last tile before going off the map boundaries
        }

        if (isObstructed(nextX, nextY)) {
          console.warn("⚠️ CANNOT MOVE INTO OBSTRUCTION");
          break; // Stop sliding/moving at the last slippery tile before an obstruction
        }

        if (isBroken(x, y)) {
          console.warn("🕳️☠️ FELL THROUGH ICE!!! GAME OVER.");
          respawn(0, 0);
          break;
        }

        console.log(`🧊 Sliding on ice at - x:${x}, y: ${y}`);
        x = nextX;
        y = nextY;
      }
    }

    const positionId = uuid();
    Position.addOverride(positionId, {
      entity: playerEntity,
      value: { x, y },
    });

    try {
      const tx = await worldContract.write.move([direction]);
      await waitForTransaction(tx);
    } finally {
      Position.removeOverride(positionId);
    }
  };

  const spawn = async (x: number, y: number) => {
    if (!playerEntity) {
      throw new Error("no player");
    }

    const canSpawn = getComponentValue(Player, playerEntity)?.value !== true;
    if (!canSpawn) {
      throw new Error("already spawned");
    }

    if (isObstructed(x, y)) {
      console.warn("cannot spawn on obstructed space");
      return;
    }

    const positionId = uuid();
    Position.addOverride(positionId, {
      entity: playerEntity,
      value: { x, y },
    });
    const playerId = uuid();
    Player.addOverride(playerId, {
      entity: playerEntity,
      value: { value: true },
    });

    try {
      const tx = await worldContract.write.spawn([x, y]);
      await waitForTransaction(tx);
    } finally {
      Position.removeOverride(positionId);
      Player.removeOverride(playerId);
    }
  };

  const respawn = async (x: number, y: number) => {
    if (!playerEntity) {
      throw new Error("no player");
    }

    const canSpawn = getComponentValue(Player, playerEntity)?.value !== true;
    if (canSpawn) throw new Error("Not yet spawned");

    if (isObstructed(x, y)) {
      console.warn("cannot spawn on obstructed space");
      return;
    }

    const positionId = uuid();
    Position.addOverride(positionId, {
      entity: playerEntity,
      value: { x, y },
    });
    const playerId = uuid();
    Player.addOverride(playerId, {
      entity: playerEntity,
      value: { value: true },
    });

    try {
      const tx = await worldContract.write.respawn([x, y]);
      await waitForTransaction(tx);
    } finally {
      Position.removeOverride(positionId);
      Player.removeOverride(playerId);
      console.log("❤️ PLAYER RESPAWNED");
    }
  };

  return {
    move,
    spawn,
    respawn,
  };
}
