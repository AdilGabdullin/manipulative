import { Circle, Group, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { fontSize, format, magnet, radius } from "./Disk";
import { Fragment } from "react";
import { fromStageXY, toStageXY } from "../util";

export const leftToolbarWidth = 180;

const allOptions = [
  { value: 1_000_000, color: "#c2185b" },
  { value: 100_000, color: "#afb42b" },
  { value: 10_000, color: "#3f51b5" },
  { value: 1000, color: "#9c27b0" },
  { value: 100, color: "#8bc34a" },
  { value: 10, color: "#e91e63" },
  { value: 1, color: "#2196f3" },
  { value: 0.1, color: "#795548" },
  { value: 0.01, color: "#009688" },
  { value: 0.001, color: "#ffa000" },
];

export function getColor(value) {
  return allOptions.find((option) => option.value == value)?.color;
}

const LeftToolbar = () => {
  const state = useAppStore();
  const { mode, origin, offset, scale, addElement, height, lastActiveElement, elements } = state;
  const [min, max] = mode == "Whole Numbers" ? [1, 1_000_000] : [0.001, 10];
  const options = allOptions.filter(({ value }) => value >= min && value <= max);
  const top = (height - radius * 2 * options.length) / (options.length + 1);
  const left = (leftToolbarWidth - 2 * radius) / 2;

  const onDragMove = (e) => {
    const s = e.target.x() > leftToolbarWidth ? scale : 1.0;
    const targetPos = { x: e.target.x(), y: e.target.y() };
    const pos = magnet(null, toStageXY(targetPos, state), elements);
    e.target.setAttrs({ scaleX: s, scaleY: s, ...(pos ? fromStageXY(pos, state) : {}) });
  };

  const onDragEnd = (value, color, pos) => (e) => {
    const element = {
      type: "disk",
      x: e.target.x() / scale + offset.x - origin.x,
      y: e.target.y() / scale + offset.y - origin.y,
      color,
      value,
    };
    e.target.setAttrs({ ...pos, scaleX: 1.0, scaleY: 1.0 });
    addElement(element);
  };

  const onPointerClick = (value, color) => (e) => {
    const last = elements[lastActiveElement];
    const pos = last ? { x: last.x + radius * 2, y: last.y } : { x: 0, y: 0 };
    addElement({
      type: "disk",
      color,
      value,
      ...pos,
    });
  };

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={height} />
      {options.map(({ value, color }, i) => {
        const x = left + radius;
        const y = top + i * (top + radius * 2) + radius;
        return (
          <Fragment key={value}>
            <Disk value={value} x={x} y={y} color={color} />
            <Group
              x={x}
              y={y}
              draggable
              onDragMove={onDragMove}
              onDragEnd={onDragEnd(value, color, { x, y })}
              onPointerClick={onPointerClick(value, color)}
            >
              <Disk value={value} x={0} y={0} color={color} />
            </Group>
          </Fragment>
        );
      })}
    </>
  );
};

const Disk = ({ value, x, y, color }) => {
  return (
    <>
      <Circle x={x} y={y} fill={color} radius={radius} />
      <Text
        x={x - radius}
        y={y - fontSize(value) / 2}
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
    </>
  );
};

export default LeftToolbar;
