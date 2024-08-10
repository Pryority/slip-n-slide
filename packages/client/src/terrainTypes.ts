export enum TerrainType {
  None = 0,
  Snow = 1,
  Boulder = 2,
  // Water = 3,
  Ice = 3,
}

type TerrainConfig = {
  emoji?: string;
  bgColor?: string;
  bgImage?: string;
};

export const terrainTypes: Record<TerrainType, TerrainConfig> = {
  [TerrainType.None]: {
    emoji: "",
    bgColor: "bg-transparent", // Assuming no background color for None
  },
  [TerrainType.Snow]: {
    emoji: "❄️",
    bgColor: "bg-white",
    bgImage: "url('/snow-bg.png')",
  },
  [TerrainType.Boulder]: {
    emoji: "🪨",
    bgColor: "bg-gray-500",
    bgImage: "url('/rock-bg.png')",
  },
  // [TerrainType.Water]: {
  //   emoji: "🌊",
  //   bgColor: "bg-blue-500",
  // },
  [TerrainType.Ice]: {
    emoji: "🧊",
    bgColor: "bg-cyan-200",
    bgImage: "url('/ice-bg.png')",
  },
};
