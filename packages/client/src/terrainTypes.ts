export enum TerrainType {
  TallGrass = 1,
  Boulder,
  Water,
}

type TerrainConfig = {
  emoji?: string;
  bgColor?: string;
};

export const terrainTypes: Record<TerrainType, TerrainConfig> = {
  [TerrainType.TallGrass]: {
    emoji: "🌳",
  },
  [TerrainType.Boulder]: {
    emoji: "🪨",
  },
  [TerrainType.Water]: {
    bgColor: "blue",
  },
};
