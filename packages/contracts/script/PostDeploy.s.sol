// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { MapConfig, Obstruction, Position, Slippery, StartTile, EndTile } from "../src/codegen/index.sol";
import { TerrainType } from "../src/codegen/common.sol";
import { positionToEntityKey } from "../src/positionToEntityKey.sol";

contract PostDeploy is Script {
  function run(address worldAddress) external {
    StoreSwitch.setStoreAddress(worldAddress);
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    TerrainType B = TerrainType.Broken;
    TerrainType S = TerrainType.Snow;
    TerrainType R = TerrainType.Rock;
    TerrainType I = TerrainType.Ice; // New terrain type for ice

    TerrainType[20][20] memory map_x00_y00 = [
      [S, I, I, R, I, I, I, I, I, I, I, I, I, I, I, I, I, I, I, I],
      [I, R, I, I, I, I, I, R, R, R, R, R, R, R, I, I, I, I, I, I],
      [I, I, R, I, I, I, I, I, I, I, I, I, I, R, I, I, I, I, I, I],
      [I, I, I, R, R, R, I, I, I, R, I, I, I, I, I, I, I, I, I, I],
      [I, I, I, I, I, R, I, I, R, I, I, I, I, I, R, R, R, R, R, I],
      [I, I, I, I, I, R, R, R, I, I, I, I, I, I, I, I, I, I, I, I],
      [I, I, I, I, I, I, I, I, R, R, I, R, I, I, I, I, R, I, I, I],
      [I, I, R, R, R, R, R, I, I, I, I, I, I, R, I, I, I, R, I, I],
      [I, I, I, I, I, I, R, R, B, R, R, I, I, R, I, I, I, I, R, I],
      [I, R, I, I, I, I, I, I, I, I, R, I, I, R, I, I, I, I, I, R],
      [I, I, I, R, I, I, R, R, R, I, I, R, I, I, I, I, I, I, I, I],
      [I, I, I, I, I, I, R, I, I, I, I, R, I, I, R, R, R, R, R, I],
      [I, R, I, I, I, I, I, I, I, R, I, I, I, I, I, I, I, I, I, I],
      [I, I, R, R, I, I, R, I, I, I, I, R, I, I, I, I, I, I, I, I],
      [I, I, I, I, R, R, R, R, R, I, I, I, I, I, I, I, R, R, R, R],
      [I, I, R, I, I, I, I, I, I, I, I, I, I, I, I, R, I, I, I, I],
      [I, I, I, I, I, R, I, I, I, I, I, I, I, I, I, I, R, I, I, I],
      [I, I, I, I, I, I, R, I, I, I, I, I, I, I, B, I, I, R, I, I],
      [I, I, I, I, I, I, I, R, I, I, I, I, I, I, I, I, I, I, R, I],
      [S, I, I, I, I, I, I, I, I, I, B, I, I, I, I, I, I, I, I, S]
    ];

    uint32 height = uint32(map_x00_y00.length);
    uint32 width = uint32(map_x00_y00[0].length);
    bytes memory terrain = new bytes(width * height);

    for (uint32 y = 0; y < height; y++) {
      for (uint32 x = 0; x < width; x++) {
        TerrainType terrainType = map_x00_y00[y][x];

        terrain[(y * width) + x] = bytes1(uint8(terrainType));
        bytes32 entity = positionToEntityKey(int32(x), int32(y));

        if (terrainType == TerrainType.Rock) {
          Position.set(entity, int32(x), int32(y));
          Obstruction.set(entity, true);
        } else if (terrainType == TerrainType.Ice) {
          Position.set(entity, int32(x), int32(y));
          Slippery.set(entity, true);
        }

        if (x == 0 && y == 0) {
          Position.set(entity, int32(x), int32(y));
          StartTile.set(entity, true);
        } else if (x == width - 1 && y == height - 1) {
          Position.set(entity, int32(x), int32(y));
          EndTile.set(entity, true);
        }
      }
    }

    MapConfig.set(width, height, terrain);
    vm.stopBroadcast();
  }
}
