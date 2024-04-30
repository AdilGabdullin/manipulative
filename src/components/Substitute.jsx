import { Group, Line } from "react-konva";
import { useAppStore } from "../state/store";
import { workspace } from "../config";
import { tileType } from "./Tile";
import { commonProps, solvingRectProps } from "./Solving";
import { boxesIntersect, center, pointInRect } from "../util";
import { BasicSummary, generateSum } from "./Summary";

const Substitute = () => {
  const state = useAppStore();
  const { origin, showSummary } = state;
  if (!state.width || state.workspace != workspace.substitute) return null;
  const rect = solvingRectProps(state);
  const { x, y, width, height } = rect;
  const sums = generateExpressions(state);
  const margin = 10;
  return (
    <Group x={Math.round(origin.x + x)} y={Math.round(origin.y + y)}>
      <Line x={0} y={0} points={[-1, 0, width, 0, width, height, 0, height, 0, 0]} {...commonProps} />
      <Line x={0} y={Math.round(height / 2)} points={[0, 0, width, 0]} {...commonProps} />
      <Line x={Math.round(width / 2)} y={0} points={[0, 0, 0, height / 2]} {...commonProps} />
      {showSummary && sums.left != "0" && <BasicSummary text={sums.left} x={width * 0.25} y={margin} />}
      {showSummary && sums.right != "0" && <BasicSummary text={sums.right} x={width * 0.75} y={margin} />}
      {showSummary && sums.bottom != "0" && <BasicSummary text={sums.bottom} x={width / 2} y={height - 56 - margin} />}
    </Group>
  );
};

function leftArea(rect) {
  const { x, y, width, height } = rect;
  return {
    x: x,
    y: y,
    width: width / 2,
    height: height / 2,
  };
}

function rightArea(rect) {
  const { x, y, width, height } = rect;
  return {
    x: x + width / 2,
    y: y,
    width: width / 2,
    height: height / 2,
  };
}

function bottomArea(rect) {
  const { x, y, width, height } = rect;
  return {
    x: x,
    y: y + height / 2,
    width: width,
    height: height / 2,
  };
}

export function generateExpressions(state) {
  const { elements } = state;
  const rect = solvingRectProps(state);
  const tiles = Object.values(elements).filter((e) => e.type == tileType && boxesIntersect(e, rect));
  const leftTiles = tiles.filter((tile) => pointInRect(center(tile), leftArea(rect)));
  const rightTiles = tiles.filter((tile) => pointInRect(center(tile), rightArea(rect)));
  const bottomTiles = tiles.filter((tile) => pointInRect(center(tile), bottomArea(rect)));
  return {
    left: generateSum(leftTiles),
    right: generateSum(rightTiles),
    bottom: generateSum(bottomTiles),
  };
}

export default Substitute;
