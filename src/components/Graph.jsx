import { Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { colors, config } from "../config";
import { Fragment, useRef } from "react";

const size = config.tile.size;
const headSize = 13;
const notchSize = 7;

const Graph = () => {
  const state = useAppStore();
  const topHead = useRef();
  const { origin } = state;
  const { x, y, width, height } = graphProps(state);
  const color = colors.black;
  return (
    <Group x={origin.x + x} y={origin.y + y}>
      <Line points={[0, 0, 0, height, width, height]} stroke={color} strokeWidth={4} />
      <Line ref={topHead} points={[0, 0, -headSize, headSize, headSize, headSize]} stroke={color} fill={color} closed />
      {notches(height).map(({ y, text }, i) => (
        <Fragment key={i}>
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

export const GraphLines = () => {
  const state = useAppStore();
  const { origin, showGrid } = state;
  const { x, y, width, height } = graphProps(state);
  return (
    <Group x={origin.x + x} y={origin.y + y}>
      {!showGrid &&
        notches(height).map(({ y }, i) => (
          <Fragment key={i}>{<Line y={y} points={[0, 0, width, 0]} stroke="#ecf5ff" />}</Fragment>
        ))}
    </Group>
  );
};

function round(x) {
  return Math.floor(x / size) * size;
}

export function graphProps(state) {
  const scale = state.scale;
  const width = Math.min(round((state.width - config.leftToolbar.width) / scale - 60), 20 * size);
  const height = Math.min(round(state.height / scale - 100), 11 * size);
  return { x: round(-width / 2) + size, y: round(-height / 2), width, height };
}

export function graphZeroPos(state) {
  const { x, y, height } = graphProps(state);
  return { x: x, y: y + height - size };
}

function notches(height) {
  return [...Array(height / size - 1).keys()].map((i) => ({
    y: height - (i + 1) * size,
    text: (i + 1).toString(),
  }));
}

export default Graph;
