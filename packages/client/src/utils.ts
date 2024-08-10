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
