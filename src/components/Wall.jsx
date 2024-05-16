import { Group, Line, Rect } from "react-konva";
import { colors, config, workspace } from "../config";
import { useAppStore } from "../state/store";
import { halfPixel, pointsIsClose } from "../util";

const size = config.tile.size;

const lineProps = {
  strokeWidth: 1,
  stroke: colors.black,
};

const lineProps2 = {
  strokeWidth: 2,
  stroke: colors.black,
};

const Wall = ({}) => {
  const state = useAppStore();
  const { origin, showWallLine } = state;
  const rect = wallRect(state);
  const { x, y, width, height } = rect;
  const ys = [];
  for (let y = 0; y <= height; y += size) {
    ys.push(y);
  }
  return (
    <>
      <Group x={halfPixel(origin.x + x)} y={halfPixel(origin.y + y)}>
        <Line x={0} y={0} points={[0, 0, 0, height]} {...lineProps} />
        <Line x={width} y={0} points={[0, 0, 0, height]} {...lineProps} />
        {ys.map((y) => (
          <Line key={y} x={0} y={y} points={[0, 0, width, 0]} {...lineProps} />
        ))}
      </Group>
      {showWallLine && <WallLine {...rect} />}
    </>
  );
};

const bigNotch = 10;
const smallNotch = 6;
const WallLine = ({ x, y, width, height }) => {
  const { origin } = useAppStore();
  x = Math.round(origin.x + x);
  y = Math.round(origin.y + y);
  const notches = [];
  const step = Math.round(width / 10);
  for (let x = step - 1; x < width - 1; x += step) {
    notches.push(x);
  }
  return (
    <Group x={x} y={y + height + size}>
      <Line points={[0, 0, width, 0]} {...lineProps2} />
      <Line x={0} points={[0, 0, width, 0]} {...lineProps2} />
      <Line points={[0, -bigNotch, 0, bigNotch]} {...lineProps2} />
      {notches.map((x) => (
        <Line key={x} points={[x, -smallNotch, x, smallNotch]} {...lineProps2} />
      ))}
      <Line points={[width - 1, -bigNotch, width - 1, bigNotch]} {...lineProps2} />
    </Group>
  );
};

export function wallRect(state) {
  const width = size * 16;
  const height = size * 9;
  return {
    x: -width / 2 + 0.5,
    y: -height / 2 - size + 0.5,
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
