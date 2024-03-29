import { Circle, Group, Label, Rect, Text } from "react-konva";
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
  const { mode } = state;
  const [min, max] = mode == "Whole Numbers" ? [1, 1000000] : [0.001, 10];
  const options = allOptions.filter(({ value }) => value >= min && value <= max);
  const top = (state.height - radius * 2 * options.length) / (options.length + 1);
  const left = (leftToolbarWidth - 2 * radius) / 2;

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={state.height} />
      {options.map(({ value, color }, i) => (
        <Fragment key={value}>
          <Disk
            value={value}
            x={left + radius}
            y={top + i * (top + radius * 2) + radius}
            color={color}
          />
          <Group draggable>
            <Disk
              key={value}
              value={value}
              x={left + radius}
              y={top + i * (top + radius * 2) + radius}
              color={color}
            />
          </Group>
        </Fragment>
      ))}
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
