import { Circle, Group, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { fontSize, format, radius } from "./Disk";
import { Fragment } from "react";

export const leftToolbarWidth = 180;

const allOptions = [
  { value: 1000000, color: "#c2185b" },
  { value: 100000, color: "#afb42b" },
  { value: 10000, color: "#3f51b5" },
  { value: 1000, color: "#9c27b0" },
  { value: 100, color: "#8bc34a" },
  { value: 10, color: "#e91e63" },
  { value: 1, color: "#2196f3" },
  { value: 0.1, color: "#795548" },
  { value: 0.01, color: "#009688" },
  { value: 0.001, color: "#ffa000" },
];

const LeftToolbar = () => {
  const state = useAppStore();
  const { mode, origin, offset, scale } = state;
  const [min, max] = mode == "Whole Numbers" ? [1, 1000000] : [0.001, 10];
  const options = allOptions.filter(({ value }) => value >= min && value <= max);
  const top = (state.height - radius * 2 * options.length) / (options.length + 1);
  const left = (leftToolbarWidth - 2 * radius) / 2;

  const onDragMove = (e) => {
    const s = e.target.x() > leftToolbarWidth ? scale : 1.0;
    e.target.setAttrs({ scaleX: s, scaleY: s });
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
    state.addElement(element);
  };

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={state.height} />
      {options.map(({ value, color }, i) => {
        const x = left + radius;
        const y = top + i * (top + radius * 2) + radius;
        return (
          <Fragment key={value}>
            <Disk value={value} x={x} y={y} color={color} />
            <Group x={x} y={y} draggable onDragMove={onDragMove} onDragEnd={onDragEnd(value, color, { x, y })}>
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
