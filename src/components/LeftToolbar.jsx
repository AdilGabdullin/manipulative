import { Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { config } from "../config";
import { ToolbarTile } from "./Tile";
import { Fragment } from "react";
import { sum } from "../util";

export const leftToolbarWidth = 180;

const LeftToolbar = () => {
  const state = useAppStore();
  return state.orientation == "Horizontal" ? <LeftToolbarStack /> : <LeftToolbarColumns />;
};

const LeftToolbarStack = () => {
  const state = useAppStore();
  const { tile, leftToolbar } = config;
  const width = leftToolbar.width;
  const { height, fullscreen } = state;
  const count = tile.options.length;
  const size = fullscreen ? 60 : 50;
  const margin = (height - size * count) / (count + 1);
  const sizes = getSizes(size, count);
  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={width} height={height} />
      {tile.options.map((op, i) => (
        <Fragment key={i}>
          <ToolbarTile
            {...op}
            x={(width - sizes[i]) / 2}
            y={(margin + size) * i + margin}
            width={sizes[i]}
            height={size}
          />
        </Fragment>
      ))}
    </>
  );
};

const LeftToolbarColumns = () => {
  const state = useAppStore();
  const { tile, leftToolbar } = config;
  const width = leftToolbar.width;
  const { height, fullscreen } = state;
  const size = fullscreen ? 60 : 50;
  const sizes = getSizes(size, tile.options.length);

  const column1 = tile.options.slice(0, 4);
  const margin1 = (height - sum(sizes.slice(0, 4))) / 5;
  const column2 = tile.options.slice(4);
  const margin2 = (height - margin1 * 2 - sum(sizes.slice(4))) / 4;

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={width} height={height} />
      {column1.map((op, i) => (
        <Fragment key={i}>
          <ToolbarTile
            {...op}
            x={(width - size * 2) / 3}
            y={margin1 * (i + 1) + sum(sizes.slice(0, i))}
            width={size}
            height={sizes[i]}
          />
        </Fragment>
      ))}
      {column2.map((op, i) => (
        <Fragment key={i}>
          <ToolbarTile
            {...op}
            x={((width - size * 2) * 2) / 3 + size}
            y={margin1 + margin2 * i + sum(sizes.slice(4, 4 + i))}
            width={size}
            height={sizes[4 + i]}
          />
        </Fragment>
      ))}
    </>
  );
};

function getSizes(size, number) {
  const startWidth = 2.5 * size;
  const endWidth = 1.2 * size;
  const sizeStep = (-endWidth + startWidth) / (number - 1);
  const sizes = [];
  for (let i = 0; i < number; i += 1) {
    sizes.push(startWidth - sizeStep * i);
  }
  return sizes;
}

export default LeftToolbar;
