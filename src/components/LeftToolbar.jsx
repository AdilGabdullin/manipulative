import { Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { config } from "../config";
import { ToolbarTile } from "./Tile";

export const leftToolbarWidth = 180;

const LeftToolbar = () => {
  const state = useAppStore();
  const { tile, leftToolbar } = config;
  const width = leftToolbar.width;
  const { height, fullscreen } = state;
  const options = tile.options;
  const count = options.length;
  const size = fullscreen ? 60 : 50;
  const left = (width - size) / 2;
  const margin = (height / 2 - size * count) / (count + 1);

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={width} height={height} />
      {options.map((op, i) => (
        <ToolbarTile
          key={i}
          x={left}
          y={(margin + size) * i + margin}
          size={size}
          fill={op.fill}
          stroke={op.stroke}
          text={op.text}
          height={op.height || 1}
        />
      ))}
    </>
  );
};

export default LeftToolbar;
