import { Circle, Group, Label, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { fontSize, format, radius } from "./Disk";
import { Fragment } from "react";
import ToolbarArrow from "./ToolbarArrow";
import OpenMarker from "./OpenMarker";
import NumberLine from "./NumberLine";

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
  const { height } = useAppStore();
  if (!height) return null;

  const left = 25;
  const width = leftToolbarWidth - 2 * left;
  const shapes = [];
  const heightTotal = width + width * 0.9 + width / 10;
  let top = (height - heightTotal) / 5;
  let y = top;
  shapes.push(<ToolbarArrow key={0} x={left} y={y} width={width} height={width / 2} isBlue />);
  y += width / 2 + top;
  shapes.push(<ToolbarArrow key={1} x={left} y={y} width={width} height={width / 2} />);
  y += width / 2 + top;
  shapes.push(<OpenMarker key={2} x={left + width / 4} y={y} width={width / 2} height={width * 0.9} />);
  y += width + top;
  shapes.push(<NumberLine key={3} x={left} y={y} width={width} height={width / 10} />);

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={height} />
      {shapes}
    </>
  );
};

export default LeftToolbar;
