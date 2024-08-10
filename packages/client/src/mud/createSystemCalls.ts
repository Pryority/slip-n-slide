import { Has, HasValue, getComponentValue, runQuery } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { uuid } from "@latticexyz/utils";
import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";
import { Direction } from "../direction";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  { playerEntity, worldContract, waitForTransaction }: SetupNetworkResult,
  { MapConfig, Obstruction, Player, Position, Slippery }: ClientComponents,
) {
  const wrapPosition = (x: number, y: number) => {
    const mapConfig = getComponentValue(MapConfig, singletonEntity);
    if (!mapConfig) {
      throw new Error("mapConfig no yet loaded or initialized");
    }
    return [
      (x + mapConfig.width) % mapConfig.width,
      (y + mapConfig.height) % mapConfig.height,
    ];
  };

  const isObstructed = (x: number, y: number) => {
    return runQuery([Has(Obstruction), HasValue(Position, { x, y })]).size > 0;
  };

  const isSlippery = (x: number, y: number) => {
    return runQuery([Has(Slippery), HasValue(Position, { x, y })]).size > 0;
  };
  const move = async (direction: Direction) => {
    if (!playerEntity) {
      throw new Error("no player");
    }

    const position = getComponentValue(Position, playerEntity);
    if (!position) {
      console.warn("cannot move without a player position, not yet spawned?");
      return;
    }

    let { x: inputX, y: inputY } = position;
    if (direction === Direction.North) {
      inputY -= 1;
    } else if (direction === Direction.East) {
      inputX += 1;
    } else if (direction === Direction.South) {
      inputY += 1;
    } else if (direction === Direction.West) {
      inputX -= 1;
    }

    let [x, y] = wrapPosition(inputX, inputY);
    if (isObstructed(x, y)) {
      console.warn("cannot move to obstructed space");
      return;
    }

    if (isSlippery(x, y)) {
      console.warn("slippery tile!");
      // return;

      // Handle slippery tiles
      while (isSlippery(x, y)) {
        let nextX = x;
        let nextY = y;
        if (direction === Direction.North) nextY--;
        else if (direction === Direction.East) nextX++;
        else if (direction === Direction.South) nextY++;
        else if (direction === Direction.West) nextX--;

        [nextX, nextY] = wrapPosition(nextX, nextY);

        if (isObstructed(nextX, nextY)) {
          break; // Stop at the last slippery tile before an obstruction
        }

        console.log(`Slipping on ice tile - x:${x}, y: ${y}`);
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

  const spawn = async (inputX: number, inputY: number) => {
    if (!playerEntity) {
      throw new Error("no player");
    }

    const canSpawn = getComponentValue(Player, playerEntity)?.value !== true;
    if (!canSpawn) {
      throw new Error("already spawned");
    }

    const [x, y] = wrapPosition(inputX, inputY);
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

  return {
    move,
    spawn,
  };
}
