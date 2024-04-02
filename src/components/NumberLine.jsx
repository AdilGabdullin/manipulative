import { Group, Line } from "react-konva";
import { useAppStore } from "../state/store";

export const defaultWidth = 900;
export const defaultHeight = 26;
export const lineWidth = 5;

const NumberLine = ({ id, x, y, width, height, visible }) => {
  const { origin } = useAppStore();
  const headSize = height / 2;
  return (
    <Group id={id} x={origin.x + x} y={origin.y + y} visible={visible !== undefined ? visible : true}>
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
