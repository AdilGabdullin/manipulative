import { Group, Line } from "react-konva";
import { colors, config } from "../config";
import { useAppStore } from "../state/store";
import { halfPixel } from "../util";

const size = config.tile.size;

const lineProps = {
  strokeWidth: 1,
  stroke: colors.black,
};

const Wall = ({}) => {
  const state = useAppStore();
  const { origin } = state;
  const { x, y, width, height } = wallRect(state);
  const ys = [];
  for (let y = 0; y <= height; y += size) {
    ys.push(y);
  }
  return (
    <Group x={halfPixel(origin.x + x)} y={halfPixel(origin.y + y)}>
      <Line x={0} y={0} points={[0, 0, 0, height]} {...lineProps} />
      <Line x={width} y={0} points={[0, 0, 0, height]} {...lineProps} />
      {ys.map((y) => (
        <Line key={y} x={0} y={y} points={[0, 0, width, 0]} {...lineProps} />
      ))}
    </Group>
  );
};

function wallRect(state) {
  const width = size * 16;
  const height = size * 9;
  return {
    x: -width / 2 + 0.5,
    y: -height / 2 + 0.5,
    width,
    height,
  };
}

export function magnetToWall(tile, state) {
  if (state.workspace != workspace.wall) return null;
  // const { width, height } = tile;
  // const { x, y } = lineZeroPos(state);
  // const { min, max, denominator } = state.elements.numberLine;
  // const range = max - min;
  // const iStep = 1 / denominator;

  // for (let i = 0; i < range + iStep / 2; i += iStep) {
  //   const points = [
  //     { x: x - 60 + notchX(i), y: y - height },
  //     { x: x - 60 + notchX(i), y: y },
  //     { x: x - 60 + notchX(i) - width, y: y - height },
  //     { x: x - 60 + notchX(i) - width, y: y },
  //   ];
  //   for (const p of points) {
  //     if (pointsIsClose(tile, p, 20)) return p;
  //   }
  // }
  return null;
}

export default Wall;
