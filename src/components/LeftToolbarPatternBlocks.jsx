import { Line, Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { cos, sin } from "../util";

export const leftToolbarWidth = 180;

const h = sin(60) * 2;

const blocks = {
  basic: [
    {
      fill: "#ffeb3b",
      stroke: "#fdd93a",
      points: [1, 0, 3, 0, 4, h, 3, h + h, 1, h + h, 0, h],
      height: 2 * h,
      width: 4,
    },
    {
      fill: "#f44336",
      stroke: "#d32f2f",
      points: [1, 0, 3, 0, 4, h, 0, h],
      height: h,
      width: 4,
    },
    {
      fill: "#2196f3",
      stroke: "#1976d2",
      points: [1, 0, 3, 0, 2, h, 0, h],
      height: h,
      width: 3,
    },
    {
      fill: "#4caf50",
      stroke: "#388e3c",
      points: [1, 0, 2, h, 0, h],
      height: h,
      width: 2,
    },
    {
      fill: "#ff9800",
      stroke: "#f57f06",
      points: [0, 0, 2, 0, 2, 2, 0, 2],
      height: 2,
      width: 2,
    },
    {
      fill: "#e7cc98",
      stroke: "#c4af83",
      points: [cos(30) * 2, 0, cos(30) * 2 + 2, 0, 2, sin(30) * 2, 0, sin(30) * 2],
      height: sin(30) * 2,
      width: cos(30) * 2 + 2,
    },
  ],

  fractions: [
    {
      fill: "#ffeb3b",
      stroke: "#fdd93a",
      points: [1, 0, 3, 0, 4, h, 3, h + h, 1, h + h, 0, h],
      height: 2 * h,
      width: 4,
    },
    {
      fill: "#f44336",
      stroke: "#d32f2f",
      points: [1, 0, 3, 0, 4, h, 0, h],
      height: h,
      width: 4,
    },
    {
      fill: "#2196f3",
      stroke: "#1976d2",
      points: [1, 0, 3, 0, 2, h, 0, h],
      height: h,
      width: 3,
    },
    {
      fill: "#795548",
      stroke: "#604339",
      points: [1, 0, 2, 0, 2, h, 0, h],
      height: h,
      width: 2,
    },
    {
      fill: "#4caf50",
      stroke: "#388e3c",
      points: [1, 0, 2, h, 0, h],
      height: h,
      width: 2,
    },
    {
      fill: "#9c27b0",
      stroke: "#7e24a5",
      points: [1, 0, 1, h, 0, h],
      height: h,
      width: 1,
    },
  ],
};

const LeftToolbarPatternBlocks = ({ findOne }) => {
  const state = useAppStore();
  const patterns = blocks.fractions;

  const scale = (leftToolbarWidth - 20) / Math.max(...patterns.map((b) => b.width));
  const sumHeight = patterns.reduce((sum, block) => sum + block.height, 0);
  const margin = (state.height - sumHeight * scale) / (patterns.length + 1);
  let top = margin;
  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={state.height} />

      {patterns.map((block, i) => {
        const result = <Block key={i} y={top} {...block} scale={scale} />;
        top += block.height * scale + margin;
        return result;
      })}
    </>
  );
};

const Block = ({ y, width, fill, stroke, points, scale }) => {
  return (
    <Line
      x={(leftToolbarWidth - width * scale) / 2}
      y={y}
      points={points.map((x) => x * scale)}
      fill={fill}
      stroke={stroke}
      closed
      draggable
    />
  );
};

export default LeftToolbarPatternBlocks;
