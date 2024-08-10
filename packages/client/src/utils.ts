import { Direction } from "./direction";
import { TerrainType } from "./terrainTypes";

export function getTerrainTypeByEmoji(emoji: string | undefined): TerrainType {
  switch (emoji) {
    case "❄️":
      return TerrainType.Snow;
    case "🪨":
      return TerrainType.Boulder;
    // case "🌊":
    // return TerrainType.Water;
    case "🧊":
      return TerrainType.Ice;
    default:
      return TerrainType.None;
  }
}

export function getAngle(direction: Direction) {
  switch (direction) {
    case Direction.North:
      return "rotate-180"; // Facing up
    case Direction.South:
      return "rotate-0"; // Facing down
    case Direction.East:
      return "-rotate-90"; // Facing right
    case Direction.West:
      return "rotate-90"; // Facing left
    default:
      return "rotate-0"; // Default (no rotation)
  }
}
