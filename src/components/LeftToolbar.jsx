import { Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { ToolbarBlock } from "./Block";
import config from "../config";
import { Fragment } from "react";

const LeftToolbar = () => {
  const state = useAppStore();
  const { width } = config.leftToolbar;
  const blocks = getBlocks(state);
  const totalHeight = blocks.reduce((sum, { height, top, scale }) => sum + (height + top) * scale, 0);
  const gap = (state.height - totalHeight) / (blocks.length + 1);
  let y = gap;
  for (const block of blocks) {
    const { height, right, top, scale } = block;
    block.x = (width - (block.width - right) * scale) / 2;
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

function getBlocks(state) {
  const { block, blockSet, workspace } = config;
  const blocks = { ...block.options };
  blocks[1].scale = 30;
  blocks[10].scale = 16;
  blocks[100].scale = 13;
  blocks[1000].scale = 10;

  if (state.blockSet == blockSet.flats) {
    delete blocks[1000];
  }
  if (state.blockSet == blockSet.rods) {
    delete blocks[1000];
    delete blocks[100];
  }
  if (state.workspace == workspace.factors) {
    delete blocks[1000];
    const horizontalBlock10 = { ...blocks[10] };
    const { width, height } = horizontalBlock10;
    blocks[20] = {
      ...horizontalBlock10,
      width: height,
      height: width,
      size: [10, 1, 1],
      shadowId: "#shadow-block-10-h",
    };
  }
  return Object.values(blocks);
}

export default LeftToolbar;
