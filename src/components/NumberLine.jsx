import { Group, Line, Rect } from "react-konva";

const lineWidth = 10;
const headSize = 15;

export const defaultWidth = 900;
export const defaultHeight = 13;

const NumberLine = ({ id, x, y, width, height, visible }) => {
  return (
    <Group id={id} x={x} y={y} visible={visible}>
      <Line
        x={headSize / 2}
        y={height / 2}
        points={[0, 0, width - headSize, 0]}
        strokeWidth={lineWidth}
        stroke={"black"}
      />
      <Line
        x={0}
        y={height / 2}
        points={[0, 0, headSize, headSize, headSize, -headSize, 0, 0]}
        stroke={"black"}
        fill="black"
        closed
      />
      <Line
        x={width}
        y={height / 2}
        points={[0, 0, -headSize, -headSize, -headSize, headSize, 0, 0]}
        stroke={"black"}
        fill="black"
        closed
      />
    </Group>
  );
};

export default NumberLine;
