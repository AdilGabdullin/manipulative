import { Circle, Group, Line } from "react-konva";
import { colors, config, workspace } from "../config";
import { useAppStore } from "../state/store";
import { halfPixel, numberBetween, pointsIsClose } from "../util";
import { NotchText } from "./Notches";

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
  const { origin } = state;
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
      {state.showWallLine && <WallLine {...rect} />}
      {state.showWallTracker && <Tracker {...rect} />}
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
      <Group x={-1}>
        <Line points={[0, -bigNotch, 0, bigNotch]} {...lineProps2} />
        <NotchText height={10} denominator={1} text={0} />
      </Group>
      {notches.map((x, i) => (
        <Group key={x} x={x}>
          <Line points={[0, -smallNotch, 0, smallNotch]} {...lineProps2} />
          <NotchText height={10} denominator={10} text={(i + 1) / 10} />
        </Group>
      ))}
      <Group x={width - 1}>
        <Line points={[0, -bigNotch, 0, bigNotch]} {...lineProps2} />
        <NotchText height={10} denominator={1} text={1} />
      </Group>
    </Group>
  );
};

const Tracker = ({ x, y, width, height }) => {
  const pos = width - 1;
  const { origin, fdMode, elements } = useAppStore();
  x = Math.round(origin.x + x);
  y = Math.round(origin.y + y);
  const minX = x;
  const maxX = x + width - 1;

  const color = colors.blue;
  const sens = 12;

  const events = {
    draggable: !fdMode,
    onDragMove: (e) => {
      let tx = e.target.x();
      tx = Math.min(maxX, tx);
      tx = Math.max(minX, tx);
      const step = Math.round(width / 10);
      for (let snap = x - 1; snap < x + width; snap += step) {
        if (numberBetween(tx, snap - sens, snap + sens)) {
          tx = snap;
          break;
        }
      }
      for (const tile of Object.values(elements)) {
        if (tile.type != "tile") continue;
        let snap = origin.x + tile.x;
        if (numberBetween(tx, snap - sens, snap + sens)) {
          tx = snap;
          break;
        }
        snap = origin.x + tile.x + tile.width - 1;
        if (numberBetween(tx, snap - sens, snap + sens)) {
          tx = snap;
          break;
        }
      }
      e.target.setAttrs({ x: Math.round(tx), y });
    },
  };
  return (
    <Group x={x + pos} y={y} {...events}>
      <Circle x={0} y={-size / 2} fill={color} radius={12} />
      <Line points={[0, -size / 2, 0, height]} strokeWidth={2} stroke={colors.blue} />
      <Line points={[0, height + size - bigNotch, 0, height + size + bigNotch]} strokeWidth={2} stroke={colors.white} />
      <Circle x={0} y={height + size} fill={color} radius={8} strokeWidth={2} stroke={colors.white} />
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
