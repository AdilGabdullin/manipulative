import { Circle, Group, Text } from "react-konva";
import { useAppStore } from "../state/store";

export const radius = 32;

const Disk = (props) => {
  const { origin, selectIds, relocateElement } = useAppStore();
  const { id, value, color, locked } = props;
  const x = origin.x + props.x;
  const y = origin.y + props.y;

  const onPointerClick = (e) => {
    selectIds([id], locked);
  };

  const onDragMove = (e) => {};
  const onDragEnd = (e) => {
    const group = e.target;
    relocateElement(id, group.x() - x, group.y() - y);
  };

  return (
    <Group x={x} y={y} onPointerClick={onPointerClick} draggable onDragMove={onDragMove} onDragEnd={onDragEnd}>
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

export function fontSize(value) {
  if (value == 1_000_000) return 15;
  if (value == 100_000) return 18;
  return 22;
}

export default Disk;
