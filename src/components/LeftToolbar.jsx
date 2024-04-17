import { Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { ToolbarBlock } from "./Block";
import config from "../config";

export const leftToolbarWidth = 180;

const LeftToolbar = () => {
  const state = useAppStore();

  const blocks = [];

  let y = 20;
  for (const props of Object.values(config.blocks)) {
    blocks.push({ ...props, y: y });
    y += 200;
  }
  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={state.height} />
      {blocks.map((props, i) => (
        <ToolbarBlock {...props} />
      ))}
    </>
  );
};

export default LeftToolbar;
