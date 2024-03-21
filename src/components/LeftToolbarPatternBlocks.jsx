import { Line, Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { cos, sin } from "../util";
import { leftToolbarWidth } from "./LeftToolbar";

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

  deci: [
    {
      fill: "#4caf50",
      stroke: "#388e3c",
      points: [1, 0, 2, h, 0, h],
      height: h,
      width: 2,
    },
    {
      fill: "#2196f3",
      stroke: "#1976d2",
      points: [1, 0, 2, h, 1, 2 * h, 0, h],
      height: 2 * h,
      width: 2,
    },
    {
      fill: "#f44336",
      stroke: "#d32f2f",
      points: [1, 0, 3, 0, 4, h, 0, h],
      height: h,
      width: 4,
    },

    {
      fill: "#9c27b0",
      stroke: "#8822a7",
      points: [2, 0, 4, 2 * h, 0, 2 * h],
      height: 2 * h,
      width: 4,
    },

    {
      fill: "#f06292",
      stroke: "#e91e63",
      points: [0, 0, 6, 0, 5, h, 1, h],
      height: h,
      width: 6,
    },
    {
      fill: "#ffeb3b",
      stroke: "#fdd93a",
      points: [1, 0, 3, 0, 4, h, 3, h + h, 1, h + h, 0, h],
      height: 2 * h,
      width: 4,
    },

    {
      fill: "#eceff1",
      stroke: "#a3a3a4",
      points: [1, 0, 3, 0, 5, h + h, 1, h + h, 0, h],
      height: 2 * h,
      width: 5,
    },

    {
      fill: "#9e9e9e",
      stroke: "#455a64",
      points: [2, 0, 4, 0, 6, 2 * h, 0, 2 * h],
      height: 2 * h,
      width: 6,
    },
    {
      fill: "#8bc34a",
      stroke: "#6aa03b",
      points: [3, 0, 6, 3 * h, 0, 3 * h],
      height: 3 * h,
      width: 6,
    },

    {
      fill: "#795548",
      stroke: "#5d4037",
      points: [3, 0, 5, 0, 6, h, 8, h, 7, 2 * h, 1, 2 * h, 0, h, 2, h],
      height: 2 * h,
      width: 8,
    },
  ],
};

const LeftToolbarPatternBlocks = ({ findOne }) => {
  const state = useAppStore();
  const { workspace, fullscreen } = state;
  const patterns = blocks[workspace];

  const sumHeight = patterns.reduce((sum, block) => sum + block.height, 0);
  const maxWidth = Math.max(...patterns.map((b) => b.width));
  const leftMargin = workspace == "deci" && !fullscreen ? 60 : 20;
  const scale = (leftToolbarWidth - leftMargin) / maxWidth;
  const topMargin = (state.height - sumHeight * scale) / (patterns.length + 1);
  let top = topMargin;
  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={state.height} />

      {patterns.map((block, i) => {
        const result = <Block key={i} y={top} {...block} scale={scale} />;
        top += block.height * scale + topMargin;
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
