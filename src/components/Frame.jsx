import { Group, Rect, Line } from "react-konva";
import { useAppStore } from "../state/store";
import { colors, config } from "../config";

const size = config.frame.size;

const Frame = ({ id, x, y, width, height, resizable, visible, locked }) => {
  const { origin, fdMode, selectIds, clearSelect, relocateElement } = useAppStore();
  x = Math.round(origin.x + (x || 0));
  y = Math.round(origin.y + (y || 0));

  const { xs, ys } = xy(width, height);

  const events = {
    onPointerClick: (e) => {
      if (fdMode) return;
      selectIds([id], locked);
    },
    onDragStart: (e) => {
      clearSelect();
    },
    onDragEnd: (e) => {
      relocateElement(id, e.target.x() - x, e.target.y() - y);
    },
  };

  return (
    <Group id={id} x={x} y={y} visible={visible} draggable={true} {...events}>
      <Rect x={0} y={0} width={width} height={height} strokeWidth={2} stroke={colors.black} />
      {xs.map((x) => (
        <Line key={x} points={[x, 0, x, height]} strokeWidth={2} stroke={colors.black} />
      ))}
      {ys.map((y) => (
        <Line key={y} points={[0, y, width, y]} strokeWidth={2} stroke={colors.black} />
      ))}
    </Group>
  );
};

function xy(width, height) {
  const xs = [];
  for (let x = size; x < width; x += size) {
    xs.push(x);
  }
  const ys = [];
  for (let y = size; y < height; y += size) {
    ys.push(y);
  }
  return { xs, ys };
}

export default Frame;
