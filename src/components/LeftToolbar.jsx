import { Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { ToolbarBlock } from "./Block";
import config from "../config";
import { Fragment } from "react";

const LeftToolbar = () => {
  const state = useAppStore();
  const { width, padding } = config.leftToolbar;
  const options = config.block.options;
  const scale = {
    1: 30,
    10: 20,
    100: (width - 2 * padding) / options[100].width,
    1000: (width - 2 * padding) / options[1000].width,
  };

  const blocks = [];
  for (const label in options) {
    blocks.push({
      ...options[label],
      scale: scale[label],
    });
  }
  const totalHeight = blocks.reduce((sum, block) => sum + block.height * block.scale, 0);
  const gap = (state.height - totalHeight) / (blocks.length + 1);
  let y = gap;
  for (const block of blocks) {
    const { width, height, scale } = block;
    block.x = (config.leftToolbar.width - width * scale) / 2;
    block.y = y;
    y += height * scale + gap;
  }

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={width} height={state.height} />
      {blocks.map((block, i) => (
        <Fragment key={i}>
          <ToolbarBlock key={i} {...block} y={block.y + block.top * block.scale} />
          {/* <Rect
            x={block.x}
            y={block.y}
            width={block.width * block.scale}
            height={block.height * block.scale}
            stroke={"black"}
          /> */}
        </Fragment>
      ))}
    </>
  );
};

export default LeftToolbar;
