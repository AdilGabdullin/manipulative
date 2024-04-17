import { Circle, Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { leftToolbarWidth } from "./LeftToolbar";
import { menuHeight } from "./Menu";
import { boxesIntersect, center } from "../util";
import { useRef } from "react";
import { colors, workspace } from "../config";
import { tileType } from "./Tile";
import { generateSum } from "./Summary";

export const margin = 10;
export const buttonHeight = 64;
export const buttonWidth = 140;
export const scrollSize = 14;
export const stroke = "grey";
export const commonProps = {
  strokeWidth: 2,
  cornerRadius: 8,
  stroke: colors.black,
  fill: colors.white,
};
export const textProps = {
  stroke: "#299af3",
  fill: "#299af3",
  align: "center",
  fontFamily: "Calibri",
};

const Solving = () => {
  const state = useAppStore();
  const { origin } = state;
  if (!state.width || state.workspace != workspace.solving) return null;
  const rect = solvingRectProps(state);
  const { x, y, width, height } = rect;
  const onCenterClick = (e) => {
    state.nextSolvingSign();
  };

  return (
    <Group x={origin.x + x} y={origin.y + y}>
      <Rect x={0} y={0} width={width} height={height} {...commonProps} />
      <Line x={width / 2} y={0} points={[0, 0, 0, height]} {...commonProps} />
      <CenterCircle x={width / 2} y={height / 2} value={state.solvingSign} onPointerClick={onCenterClick} />
    </Group>
  );
};

const CenterCircle = ({ x, y, value, onPointerClick }) => {
  const r = buttonHeight / 2;
  const fontSize = 40;
  const rectRef = useRef();
  const onPointerEnter = (e) => {
    rectRef.current?.setAttr("stroke", textProps.stroke);
  };
  const onPointerLeave = (e) => {
    rectRef.current?.setAttr("stroke", commonProps.stroke);
  };
  return (
    <Group x={x} y={y} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onPointerClick={onPointerClick}>
      <Circle ref={rectRef} x={0} y={0} radius={r} {...commonProps} />
      <Text x={-r} y={-fontSize / 2} width={2 * r} text={value} fontSize={fontSize} {...textProps} />
    </Group>
  );
};

export function solvingRectProps(state) {
  const { width, height, fullscreen } = state;
  const rectWidth = Math.min(width - leftToolbarWidth - 45, 750);
  let totalHeight = height - margin * 2 - menuHeight - scrollSize;
  if (fullscreen) {
    totalHeight = Math.min(totalHeight, 600);
  }
  const rectHeight = totalHeight - buttonHeight - margin;
  const x = -rectWidth / 2;
  const y = -(totalHeight + scrollSize) / 2;
  return { x, y, width: rectWidth, height: rectHeight };
}

export function generateExpression(state) {
  const { elements, solvingSign } = state;
  const rect = solvingRectProps(state);
  const tiles = Object.values(elements).filter((e) => e.type == tileType && boxesIntersect(e, rect));
  const leftTiles = tiles.filter((tile) => center(tile).x < 0);
  const rightTiles = tiles.filter((tile) => center(tile).x >= 0);
  const expression = `${generateSum(leftTiles)} ${solvingSign} ${generateSum(rightTiles)}`;
  return expression;
}

export default Solving;
