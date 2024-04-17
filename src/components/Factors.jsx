import { Group, Line, Ring } from "react-konva";
import { useAppStore } from "../state/store";
import { workspace } from "../config";
import { baseSize, tileType } from "./Tile";
import { commonProps, solvingRectProps } from "./Solving";
import { boxesIntersect, center, pointInRect } from "../util";
import { BasicSummary, fontSize, generateSum } from "./Summary";

const factorsSize = Math.round(baseSize * 1.5);

const Factors = () => {
  const state = useAppStore();
  const { origin } = state;
  if (!state.width || state.workspace != workspace.factors) return null;
  const rect = solvingRectProps(state);
  const { x, y, width, height } = rect;

  const sums = generateExpressions(state);
  const margin = 10;

  return (
    <Group x={Math.round(origin.x + x)} y={Math.round(origin.y + y)}>
      <Line x={0} y={0} points={[-1, 0, width, 0]} {...commonProps} />
      <Line x={0} y={factorsSize} points={[0, 0, width, 0]} {...commonProps} />
      <Line x={0} y={0} points={[0, -1, 0, height]} {...commonProps} />
      <Line x={factorsSize} y={0} points={[0, 0, 0, height]} {...commonProps} />
      {sums.left != "0" && <BasicSummary text={sums.left} x={-margin} align={true} y={(height - fontSize) / 2} />}
      {sums.top != "0" && <BasicSummary text={sums.top} x={width / 2} y={-56 - margin} />}
      {sums.main != "0" && <BasicSummary text={sums.main} x={width / 2} y={height - 56 - margin} />}
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

export default Factors;
