import { Circle, Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { leftToolbarWidth } from "./LeftToolbar";
import { menuHeight } from "./Menu";
import { boxesIntersect, numberBetweenStrict } from "../util";
import { useRef, useState } from "react";
import { colors, workspace } from "../config";
import { tileType } from "./Tile";
import Summary, { generateSum } from "./Summary";

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
  const { elements, origin } = state;
  const signs = ["=", ">", "≥", "<", "≤"];
  const [signIndex, setSignIndex] = useState(0);
  if (!state.width || state.workspace != workspace.solving) return null;
  const rect = solvingRectProps(state);
  const { x, y, width, height } = rect;
  const onCenterClick = (e) => {
    setSignIndex((signIndex + 1) % signs.length);
  };

  return (
    <Group x={origin.x + x} y={origin.y + y}>
      <Rect x={0} y={0} width={width} height={height} {...commonProps} />
      <Line x={width / 2} y={0} points={[0, 0, 0, height]} {...commonProps} />
      <CenterCircle x={width / 2} y={height / 2} value={signs[signIndex]} onPointerClick={onCenterClick} />
      <Summary
        x={width / 2}
        y={height + margin}
        text={generateExpression(elements, rect, signs[signIndex])}
        visible={true}
      />
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

function center({ x, y, width, height }) {
  return { x: x + width / 2, y: y + height / 2 };
}

function pointInRect(point, rect) {
  const { x, y, width, height } = rect;
  return numberBetweenStrict(point.x, x, x + width) && numberBetweenStrict(point.y, y, y + height);
}

function generateExpression(elements, rect, sign) {
  const tiles = Object.values(elements).filter((e) => e.type == tileType);
  const width = rect.width / 2;
  const leftSide = { ...rect, width };
  const rightSide = { ...rect, x: rect.x + width, width };
  const leftTiles = tiles.filter((tile) => boxesIntersect(tile, leftSide) && !pointInRect(center(tile), rightSide));
  const rightTiles = tiles.filter((tile) => boxesIntersect(tile, rightSide) && !pointInRect(center(tile), leftSide));
  const expression = `${generateSum(leftTiles)} ${sign} ${generateSum(rightTiles)}`;
  //   if (expression.match(/^0.*0$/)) return "";
  return expression;
}

export default Solving;
