import { Group, Line } from "react-konva";
import { useAppStore } from "../state/store";
import { workspace } from "../config";
import { baseSize, tileType } from "./Tile";
import { commonProps, solvingRectProps } from "./Solving";
import { boxesIntersect, center, pointInRect } from "../util";
import { BasicSummary, fontSize, generateSum } from "./Summary";

const factorsSize = Math.round(baseSize * 1.5);

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
      <Line x={0} y={0} points={[0, 0, width, 0, width, height, 0, height,0,0]} {...commonProps} />
    </Group>
  );
};

function leftArea(rect) {
  const { x, y, height } = rect;
  return {
    x: x,
    y: y + 1.5 * baseSize,
    width: 1.5 * baseSize,
    height: height - 1.5 * baseSize,
  };
}

function topArea(rect) {
  const { x, y, width } = rect;
  return {
    x: x + 1.5 * baseSize,
    y: y,
    width: width - 1.5 * baseSize,
    height: 1.5 * baseSize,
  };
}

function mainArea(rect) {
  const { x, y, width, height } = rect;
  return {
    x: x + 1.5 * baseSize,
    y: y + 1.5 * baseSize,
    width: width - 1.5 * baseSize,
    height: height - 1.5 * baseSize,
  };
}

export function generateExpressions(state) {
  const { elements } = state;
  const rect = solvingRectProps(state);
  const tiles = Object.values(elements).filter((e) => e.type == tileType && boxesIntersect(e, rect));
  const leftTiles = tiles.filter((tile) => pointInRect(center(tile), leftArea(rect)));
  const topTiles = tiles.filter((tile) => pointInRect(center(tile), topArea(rect)));
  const mainTiles = tiles.filter((tile) => pointInRect(center(tile), mainArea(rect)));
  return {
    left: generateSum(leftTiles),
    top: generateSum(topTiles),
    main: generateSum(mainTiles),
  };
}

export default Substitute;
