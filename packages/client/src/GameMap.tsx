import { Entity } from "@latticexyz/recs";
import { twMerge } from "tailwind-merge";
import { terrainTypes } from "./terrainTypes";
import { getAngle, getTerrainTypeByEmoji } from "./utils";
import { Direction } from "./direction";

type Props = {
  direction: Direction;
  width: number;
  height: number;
  terrain?: {
    x: number;
    y: number;
    emoji?: string;
    bgColor?: string;
  }[];
  players?: {
    x: number;
    y: number;
    emoji: string;
    entity: Entity;
  }[];
};

export const GameMap = ({
  direction,
  width,
  height,
  terrain,
  players,
}: Props) => {
  const rows = new Array(width).fill(0).map((_, i) => i);
  const columns = new Array(height).fill(0).map((_, i) => i);

  const r = rows.map((y) =>
    columns.map((x) => {
      const terrainTile = terrain?.find((t) => t.x === x && t.y === y);
      const terrainType = getTerrainTypeByEmoji(terrainTile?.emoji);
      const terrainConfig = terrainTypes[terrainType] || {
        bgColor: "bg-gray-500",
        emoji: "❓",
      };
      const playersHere = players?.filter((p) => p.x === x && p.y === y);
      const tileBgColor = terrainConfig.bgColor;
      const tileBgImage = terrainConfig.bgImage;

      return (
        <div
          key={`${x},${y}`}
          className={twMerge(
            "w-8 h-8 flex items-center justify-center",
            tileBgColor,
          )}
          style={{
            gridColumn: x + 1,
            gridRow: y + 1,
            backgroundImage: tileBgImage ? tileBgImage : undefined,
            backgroundSize: "cover",
          }}
        >
          <div className="flex flex-wrap gap-1 items-center justify-center relative">
            {terrainConfig.emoji &&
            terrainConfig.emoji !== "🌊" &&
            terrainConfig.emoji !== "🧊" &&
            terrainConfig.emoji !== "🪨" &&
            terrainConfig.emoji !== "❄️" ? (
              <div className="absolute inset-0 flex items-center justify-center text-3xl pointer-events-none">
                {terrainConfig.emoji}
              </div>
            ) : null}
            <div className="relative">
              {playersHere?.map((p) => (
                <span
                  key={p.entity}
                  className={twMerge("h-8 w-8 flex z-50", getAngle(direction))}
                >
                  <img src="/pudgy.png" alt="Player" className="object-cover" />
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }),
  );

  return (
    <div className="inline-grid p-2 bg-neutral-500 relative overflow-hidden">
      {...r}
    </div>
  );
};
