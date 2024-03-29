import { Circle, Group, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { fromStageXY, pointsIsClose, toStageXY } from "../util";

export const radius = 32;

const Disk = (props) => {
  const state = useAppStore();
  const { origin, selectIds, elements, relocateElement, scale, offset } = state;
  const { id, value, color, locked } = props;
  const x = origin.x + props.x;
  const y = origin.y + props.y;

  const onPointerClick = (e) => {
    selectIds([id], locked);
  };

  const onDragMove = (e) => {
    const targetPos = { x: e.target.x(), y: e.target.y() };
    const pos = magnet(id, toStageXY(targetPos, state), elements);
    if (pos) {
      e.target.setAttrs(fromStageXY(pos, state));
    }
  };
  const onDragEnd = (e) => {
    const group = e.target;
    relocateElement(id, group.x() - x, group.y() - y);
  };

  return (
    <Group id={id} x={x} y={y} onPointerClick={onPointerClick} draggable onDragMove={onDragMove} onDragEnd={onDragEnd}>
      <Circle x={0} y={0} fill={color} radius={radius} />
      <Text
        x={-radius}
        y={-fontSize(value) / 2}
        width={radius * 2}
        text={format(value)}
        fontFamily={"Calibri"}
        fontSize={fontSize(value)}
        wrap="char"
        align="center"
        verticalAlign="center"
        fill={"white"}
        color={"white"}
      />
    </Group>
  );
};

const intl = new Intl.NumberFormat("en-US");

export function format(value) {
  return intl.format(value);
}

export function magnet(id, pos, elements) {
  for (const [elementId, element] of Object.entries(elements)) {
    if (elementId == id || element.type != "disk") continue;
    for (const [dx, dy] of [
      [-radius, -radius],
      [-radius, 0],
      [-radius, radius],
      [0, -radius],
      [0, radius],
      [radius, -radius],
      [radius, 0],
      [radius, radius],
      [0, -radius * 2],
      [0, radius * 2],
      [-radius * 2, 0],
      [radius * 2, 0],
    ]) {
      const point = { x: element.x + dx, y: element.y + dy };
      if (pointsIsClose(pos, point, 16)) {
        return point;
      }
    }
  }
  return null;
}

export function fontSize(value) {
  if (value == 1_000_000) return 15;
  if (value == 100_000) return 18;
  return 22;
}

export default Disk;
