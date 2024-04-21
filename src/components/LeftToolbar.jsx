import { Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { config } from "../config";
import { ToolbarTile } from "./Tile";

export const leftToolbarWidth = 180;

const LeftToolbar = () => {
  const state = useAppStore();

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={state.height} />

      {config.tile.options.map(({ fill, stroke }, i) => (
        <ToolbarTile key={i} fill={fill} stroke={stroke} x={20} y={i * 50} />
      ))}
    </>
  );
};

export default LeftToolbar;
