import { Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { colors, config } from "../config";
import { Fragment, useRef } from "react";

const size = config.tile.size;
const headSize = 13;
const notchSize = 7;

const Graph = () => {
  const { origin, showGrid } = useAppStore();

  const x = origin.x - 9 * size;
  const y = origin.y - 6 * size;
  const width = 17 * size;
  const height = 11 * size;

  const topHead = useRef();

  const notches = [...Array(height / size - 1).keys()].map((i) => ({
    y: height - (i + 1) * size,
    text: (i + 1).toString(),
  }));
  const color = colors.black;
  return (
    <Group x={x} y={y}>
      <Line points={[0, 0, 0, height, width, height]} stroke={color} strokeWidth={4} />

      <Line ref={topHead} points={[0, 0, -headSize, headSize, headSize, headSize]} stroke={color} fill={color} closed />

      {notches.map(({ y, text }, i) => (
        <Fragment key={i}>
          {!showGrid && <Line y={y} points={[0, 0, width, 0]} stroke="#ecf5ff" />}
          <Line x={-notchSize} y={y} points={[0, 0, 2 * notchSize, 0]} stroke={color} />
          <Text
            text={text}
            x={-notchSize - 28}
            y={y - 10}
            width={30}
            align="center"
            fontFamily="Calibri"
            fontSize={20}
          />
        </Fragment>
      ))}
    </Group>
  );
};

export default Graph;
