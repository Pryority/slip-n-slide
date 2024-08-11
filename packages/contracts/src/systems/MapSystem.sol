// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { MapConfig, Movable, Obstruction, Player, Position, Slippery, Broken, StartTile, EndTile, Completed } from "../codegen/index.sol";
import { Direction, TerrainType } from "../codegen/common.sol";
import { addressToEntityKey } from "../addressToEntityKey.sol";
import { positionToEntityKey } from "../positionToEntityKey.sol";

contract MapSystem is System {
  function respawn(int32 startX, int32 startY) public {
    bytes32 player = addressToEntityKey(address(_msgSender()));
    require(Player.get(player), "Player not spawned");

    // Reset all broken tiles to Ice
    resetToOriginalMap();

    // Reset player position
    Position.set(player, startX, startY);
    Completed.set(player, false);
  }

  function resetToOriginalMap() internal {
    // Retrieve the original map configuration
    (uint32 width, uint32 height, bytes memory terrain) = MapConfig.get();

    // Reset each tile to its original state
    for (uint32 y = 0; y < height; y++) {
      for (uint32 x = 0; x < width; x++) {
        bytes32 entity = positionToEntityKey(int32(x), int32(y));
        bytes1 terrainType = terrain[(y * width) + x];

        if (terrainType == bytes1(uint8(TerrainType.Ice))) {
          Slippery.set(entity, true);
          Broken.set(entity, false); // Ensure broken tiles are not set
        }
        // else {
        //   Obstruction.set(entity, false);
        //   Slippery.set(entity, false);
        //   Broken.set(entity, false); // Ensure broken tiles are not set
        // }

        // if (x == 0 && y == 0) {
        //   StartTile.set(entity, true);
        // } else if (x == width - 1 && y == height - 1) {
        //   EndTile.set(entity, true);
        // } else {
        //   StartTile.set(entity, false);
        //   EndTile.set(entity, false);
        // }
      }
    }

    MapConfig.set(width, height, terrain);
  }

  function spawn(int32 x, int32 y) public {
    bytes32 player = addressToEntityKey(address(_msgSender()));
    require(!Player.get(player), "already spawned");

    bytes32 position = positionToEntityKey(x, y);
    require(!Obstruction.get(position), "this space is obstructed");

    Player.set(player, true);
    Position.set(player, x, y);
    Movable.set(player, true);
  }

  function move(Direction direction) public {
    bytes32 player = addressToEntityKey(_msgSender());
    require(Movable.get(player), "cannot move");

    (int32 x, int32 y) = Position.get(player);
    // bytes32 currentPosition = positionToEntityKey(x, y);
    (int32 newX, int32 newY) = getNewPosition(x, y, direction);
    bytes32 newPosition = positionToEntityKey(newX, newY);

    // Ensure the new position is within boundaries
    (uint32 width, uint32 height, ) = MapConfig.get();
    if (!isWithinMapBoundaries(newX, newY, width, height)) {
      return; // Stop if we reach the map boundary
    }

    require(!Obstruction.get(newPosition), "this space is obstructed");
    // Check if the new position is a Broken tile
    if (Broken.get(newPosition)) {
      respawn(0, 0); // FALL THROUGH BROKEN ICE -- RESTART
      return; // Exit the function
    }

    // Move to the new position
    Position.set(player, newX, newY);

    // Check if the new position is slippery
    if (Slippery.get(newPosition)) {
      handleSlipperyTile(player, direction);
    }

    if (EndTile.get(newPosition)) {
      Completed.set(player, true);
    }
  }

  function handleSlipperyTile(bytes32 player, Direction direction) internal {
    (int32 x, int32 y) = Position.get(player);
    (uint32 width, uint32 height, ) = MapConfig.get();
    bytes32 initialPosition = positionToEntityKey(x, y);

    while (true) {
      (int32 newX, int32 newY) = getNewPosition(x, y, direction);

      // Stop sliding if we hit the map boundary
      if (!isWithinMapBoundaries(newX, newY, width, height)) {
        break;
      }

      bytes32 newPosition = positionToEntityKey(newX, newY);

      if (Obstruction.get(newPosition)) {
        break; // Stop sliding if we hit an obstruction
      }

      if (Broken.get(newPosition)) {
        respawn(0, 0);
        return;
      }

      if (!Slippery.get(newPosition)) {
        Position.set(player, newX, newY);
        break; // Stop sliding if we reach a non-slippery tile
      }

      Broken.set(initialPosition, true);

      // Continue sliding
      x = newX;
      y = newY;
      Position.set(player, x, y);
    }
  }

  function isWithinMapBoundaries(int32 x, int32 y, uint32 width, uint32 height) internal pure returns (bool) {
    return x >= 0 && x < int32(width) && y >= 0 && y < int32(height);
  }

  function getNewPosition(int32 x, int32 y, Direction direction) internal pure returns (int32, int32) {
    if (direction == Direction.North) {
      return (x, y - 1);
    } else if (direction == Direction.East) {
      return (x + 1, y);
    } else if (direction == Direction.South) {
      return (x, y + 1);
    } else if (direction == Direction.West) {
      return (x - 1, y);
    }
    revert("Invalid direction");
  }
}
