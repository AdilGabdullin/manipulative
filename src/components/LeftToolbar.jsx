import { Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { config } from "../config";
import { ToolbarTile } from "./Tile";
import { Fragment } from "react";

export const leftToolbarWidth = 180;

const LeftToolbar = () => {
  const state = useAppStore();
  const { tile, leftToolbar } = config;
  const width = leftToolbar.width;
  const { height, fullscreen } = state;
  const optionPairs = tile.options;
  const count = optionPairs.length;
  const size = fullscreen ? 60 : 50;
  const margin = (height - size * count) / (count + 1);

  const startWidth = 2.5 * size;
  const endWidth = 1.2 * size;
  const widthStep = (endWidth - startWidth) / (tile.options.length - 1);
  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={width} height={height} />
      {tile.options.map((op, i) => (
        <Fragment key={i}>
          <ToolbarTile
            x={(width - startWidth - widthStep * i) / 2}
            y={(margin + size) * i + margin}
            width={startWidth + widthStep * i}
            height={size}
            fill={op.fill}
            // stroke={op.stroke}
            stroke="black"
          />
        </Fragment>
      ))}
    </>
  );
};

export default LeftToolbar;
