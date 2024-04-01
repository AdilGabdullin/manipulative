import { Group, Line, Rect } from "react-konva";

const lineWidth = 10;
const headSize = 15;

const NumberLine = ({ x, y, width, height }) => {
  return (
    <Group x={x} y={y}>
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

      {/* <Rect width={width} height={height} stroke={"red"} /> */}
    </Group>
  );
};

export default NumberLine;
