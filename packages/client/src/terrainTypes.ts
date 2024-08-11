export enum TerrainType {
  None = 0,
  Snow = 1,
  Rock = 2,
  Ice = 3,
  Broken = 4,
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
  [TerrainType.Rock]: {
    emoji: "🪨",
    bgColor: "bg-gray-500",
    bgImage: "url('/rock-bg.png')",
  },
  [TerrainType.Ice]: {
    emoji: "🧊",
    bgColor: "bg-cyan-200",
    bgImage: "url('/thin-ice.png')",
  },
  [TerrainType.Broken]: {
    emoji: "🕳️",
    bgColor: "bg-cyan-700",
    bgImage: "url('/hole.png')",
  },
};
