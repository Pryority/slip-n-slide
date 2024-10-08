// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { MapConfig, Movable, Obstruction, Player, Position, Slippery } from "../codegen/index.sol";
import { Direction } from "../codegen/common.sol";
import { addressToEntityKey } from "../addressToEntityKey.sol";
import { positionToEntityKey } from "../positionToEntityKey.sol";

contract MapSystem is System {
  function respawn(int32 x, int32 y) public {
    bytes32 player = addressToEntityKey(address(_msgSender()));
    require(Player.get(player), "Player not spawned");
    // Reset player position
    Position.set(player, x, y);
  }

  function spawn(int32 x, int32 y) public {
    bytes32 player = addressToEntityKey(address(_msgSender()));
    require(!Player.get(player), "already spawned");

    // Constrain position to map size, wrapping around if necessary
    (uint32 width, uint32 height, ) = MapConfig.get();
    x = (x + int32(width)) % int32(width);
    y = (y + int32(height)) % int32(height);

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
    (int32 newX, int32 newY) = getNewPosition(x, y, direction);

    // Ensure the new position is within boundaries
    (uint32 width, uint32 height, ) = MapConfig.get();
    if (!isWithinMapBoundaries(newX, newY, width, height)) {
      return; // Stop if we reach the map boundary
    }

    bytes32 newPosition = positionToEntityKey(newX, newY);
    require(!Obstruction.get(newPosition), "this space is obstructed");

    // Move to the new position
    Position.set(player, newX, newY);

    // Check if the new position is slippery
    if (Slippery.get(newPosition)) {
      handleSlipperyTile(player, direction);
    }
  }

  function handleSlipperyTile(bytes32 player, Direction direction) internal {
    (int32 x, int32 y) = Position.get(player);
    (uint32 width, uint32 height, ) = MapConfig.get();

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

      if (!Slippery.get(newPosition)) {
        Position.set(player, newX, newY);
        break; // Stop sliding if we reach a non-slippery tile
      }

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
