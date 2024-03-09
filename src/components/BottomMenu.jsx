import { Line, Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { leftToolbarWidth } from "./LeftToolbar";
import BrushMenu from "./BrushMenu";

export const bottomMenuHeight = 50;

const BottomMenu = () => {
  const state = useAppStore();
  const { width, height, fdMode } = state;
  const x = leftToolbarWidth;
  const y = height - bottomMenuHeight;
  return (
    <>
      <Line id="bottom-menu-line" points={[x, y, width, y]} stroke="#c0c0c0" />
      <Rect id="bottom-menu-rect" fill="#ffffff" x={x} y={y} width={width} height={bottomMenuHeight} />
      {fdMode && <BrushMenu x={x} y={y} height={bottomMenuHeight}/>}
    </>
  );
};

export default BottomMenu;
