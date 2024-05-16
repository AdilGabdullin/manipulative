import { Group, Line } from "react-konva";
import { colors, config, workspace } from "../config";
import { useAppStore } from "../state/store";
import { halfPixel, pointsIsClose } from "../util";

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

export function wallRect(state) {
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
  const rect = wallRect(state);
  const { x, width, height } = rect;
  for (let y = rect.y; y < rect.y + height; y += size) {
    const left = { x, y };
    if (pointsIsClose(tile, left, 20)) return left;
    const right = { x: x + width - tile.width, y };
    if (pointsIsClose(tile, right, 20)) return right;
  }
  return null;
}

export default Wall;
