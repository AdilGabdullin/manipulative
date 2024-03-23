import { Circle, Line, Rect } from "react-konva";
import { useAppStore } from "../state/store";

export const rekenrekWidth = 900;
export const rekenrekHeight = 80;
const strokeWidth1 = 8;
const strokeWidth2 = 4;
const ballRadius = 20;

const colors = {
  line: "#54575a",
  red: { main: "#f44336", highlight: "#ffffff", shadow: "#d32f2f" },
  white: { main: "#fafafa", highlight: "#bdbdbd", shadow: "#cdd4da" },
  blue: "#3296f3",
};

const Rekenrek = (props) => {
  const state = useAppStore();
  const { origin, fdMode } = state;
  const { id, width, height, locked } = props;

  const x = props.x + origin.x;
  const y = props.y + origin.y;

  return (
    <>
      {/* <Rect id={id} x={origin.x + x} y={origin.y + y} width={width} height={height} stroke={lineColor} /> */}
      <Lines {...props} />
      <Ball x={x + ballRadius + strokeWidth1} y={y + height / 2} color={colors.red} />
      <Ball x={x + width / 2} y={y + height / 2} color={colors.red} />
      <Ball x={x + width - ballRadius - strokeWidth1} y={y + height / 2} color={colors.white} />
    </>
  );
};

const Lines = (props) => {
  const state = useAppStore();
  const { origin, fdMode } = state;
  const { id, width, height, locked } = props;

  const x = props.x + origin.x;
  const y = props.y + origin.y;

  return (
    <>
      <Line
        id={id + "leftline"}
        x={x}
        y={y}
        points={[strokeWidth1 / 2, strokeWidth1 / 2, strokeWidth1 / 2, height - strokeWidth1 / 2]}
        lineCap="round"
        lineJoin="round"
        stroke={colors.line}
        strokeWidth={strokeWidth1}
      />
      <Line
        id={id + "midline"}
        x={x}
        y={y}
        points={[width - strokeWidth1 / 2, strokeWidth1 / 2, width - strokeWidth1 / 2, height - strokeWidth1 / 2]}
        lineCap="round"
        lineJoin="round"
        stroke={colors.line}
        strokeWidth={strokeWidth1}
      />
      <Line
        id={id + "rightline"}
        x={x}
        y={y}
        points={[strokeWidth1 / 2, height / 2, width - strokeWidth1 / 2, height / 2]}
        stroke={colors.line}
        strokeWidth={strokeWidth2}
      />
    </>
  );
};

const Ball = (props) => {
  const { x, y, color } = props;

  const onDragStart = (e) => {};
  const onDragMove = (e) => {};
  const onDragEnd = (e) => {};

  return (
    <>
      <Circle
        x={x}
        y={y}
        fill={color.main}
        stroke={color.shadow}
        radius={ballRadius}
        draggable
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      />
    </>
  );
};

export default Rekenrek;
