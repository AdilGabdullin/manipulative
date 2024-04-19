import { Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { ToolbarBlock } from "./Block";
import config from "../config";
import { Fragment } from "react";

const LeftToolbar = () => {
  const state = useAppStore();
  const { width, padding } = config.leftToolbar;
  const options = { ...config.block.options };
  const { flats, rods } = config.blockSet;

  const scale = {
    1: 30,
    10: 20,
    100: (width - 2 * padding) / (options[100].width + options[100].right),
    1000: (width - 2 * padding) / (options[1000].width + options[1000].right),
  };

  if (state.blockSet == flats) {
    delete options[1000];
  }
  if (state.blockSet == rods) {
    delete options[1000];
    delete options[100];
  }

  const blocks = [];
  for (const label in options) {
    blocks.push({
      ...options[label],
      scale: scale[label],
    });
  }
  const totalHeight = blocks.reduce((sum, { height, top, scale }) => sum + (height + top) * scale, 0);
  const gap = (state.height - totalHeight) / (blocks.length + 1);
  let y = gap;
  for (const block of blocks) {
    const { width, height, right, top, scale } = block;
    block.x = (config.leftToolbar.width - (width + right) * scale) / 2;
    block.y = y;
    y += (height + top) * scale + gap;
  }

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={width} height={state.height} />
      {blocks.map((block, i) => (
        <Fragment key={i}>
          <ToolbarBlock key={i} {...block} y={block.y + block.top * block.scale} />
        </Fragment>
      ))}
    </>
  );
};

export default LeftToolbar;
