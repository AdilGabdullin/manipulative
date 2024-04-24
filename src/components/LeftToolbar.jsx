import { Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { config } from "../config";
import { ToolbarTile } from "./Tile";
import { arrayChunk } from "../util";
import { Fragment } from "react";

export const leftToolbarWidth = 180;

const LeftToolbar = () => {
  const state = useAppStore();
  const { tile, leftToolbar } = config;
  const width = leftToolbar.width;
  const { height, fullscreen } = state;
  const optionPairs = arrayChunk(tile.options, 2);
  const count = optionPairs.length;
  const size = fullscreen ? 60 : 50;
  const left = (width - size * 2) / 3;
  const margin = (height - size * count) / (count + 1);

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={width} height={height} />
      {optionPairs.map(([op1, op2], i) => (
        <Fragment key={i}>
          <ToolbarTile x={left} y={(margin + size) * i + margin} size={size} fill={op1.fill} stroke={op1.stroke} />
          <ToolbarTile
            x={2*left + size}
            y={(margin + size) * i + margin}
            size={size}
            fill={op2.fill}
            stroke={op2.stroke}
          />
        </Fragment>
      ))}
    </>
  );
};

export default LeftToolbar;
