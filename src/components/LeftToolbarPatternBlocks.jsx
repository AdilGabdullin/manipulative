import { Line, Rect } from "react-konva";
import { gridStep, useAppStore } from "../state/store";
import { arrayChunk, cos, getStageXY, sin, sum } from "../util";
import { leftToolbarWidth } from "./LeftToolbar";
import { patternMagnet } from "./Pattern";
import { Fragment } from "react";

const h = sin(60) * 2;

// prettier-ignore
const blocks = {
  basic: [
    { fill: "#e7cc98", stroke: "#c4af83", points: [cos(30) * 2, 0, cos(30) * 2 + 2, 0, 2, sin(30) * 2, 0, sin(30) * 2],  height: sin(30) * 2,  width: cos(30) * 2 + 2,  },
    { fill: "#4caf50", stroke: "#388e3c", points: [1, 0, 2, h, 0, h], height: h, width: 2 },
    { fill: "#2196f3", stroke: "#1976d2", points: [1, 0, 3, 0, 2, h, 0, h], height: h, width: 3 },
    { fill: "#ff9800", stroke: "#f57f06", points: [0, 0, 2, 0, 2, 2, 0, 2], height: 2, width: 2 },
    { fill: "#f44336", stroke: "#d32f2f", points: [1, 0, 3, 0, 4, h, 0, h], height: h, width: 4 },
    { fill: "#ffeb3b", stroke: "#fdd93a", points: [1, 0, 3, 0, 4, h, 3, h + h, 1, h + h, 0, h], height: 2 * h, width: 4 },
  ],

  fractions: [
    { fill: "#9c27b0", stroke: "#7e24a5", points: [1, 0, 1, h, 0, h], height: h, width: 1 },
    { fill: "#4caf50", stroke: "#388e3c", points: [1, 0, 2, h, 0, h], height: h, width: 2 },
    { fill: "#795548", stroke: "#604339", points: [1, 0, 2, 0, 2, h, 0, h], height: h, width: 2 },
    { fill: "#2196f3", stroke: "#1976d2", points: [1, 0, 3, 0, 2, h, 0, h], height: h, width: 3 },
    { fill: "#f44336", stroke: "#d32f2f", points: [1, 0, 3, 0, 4, h, 0, h], height: h, width: 4 },
    { fill: "#ffeb3b", stroke: "#fdd93a", points: [1, 0, 3, 0, 4, h, 3, h + h, 1, h + h, 0, h], height: 2 * h, width: 4 },
  ],

  deci: [
    { fill: "#f06292", stroke: "#e91e63", points: [0, 0, 6, 0, 5, h, 1, h], height: h, width: 6 },
    { fill: "#4caf50", stroke: "#388e3c", points: [1, 0, 2, h, 0, h], height: h, width: 2 },
    { fill: "#9c27b0", stroke: "#8822a7", points: [2, 0, 4, 2 * h, 0, 2 * h], height: 2 * h, width: 4 },
    { fill: "#eceff1", stroke: "#a3a3a4", points: [1, 0, 3, 0, 5, h + h, 1, h + h, 0, h], height: 2 * h, width: 5 },
    { fill: "#9e9e9e", stroke: "#455a64", points: [2, 0, 4, 0, 6, 2 * h, 0, 2 * h], height: 2 * h, width: 6 },
    { fill: "#2196f3", stroke: "#1976d2", points: [1, 0, 2, h, 1, 2 * h, 0, h], height: 2 * h, width: 2 },
    { fill: "#ffeb3b", stroke: "#fdd93a", points: [1, 0, 3, 0, 4, h, 3, h + h, 1, h + h, 0, h], height: 2 * h, width: 4 },
    { fill: "#f44336", stroke: "#d32f2f", points: [1, 0, 3, 0, 4, h, 0, h], height: h, width: 4 },
    { fill: "#795548", stroke: "#5d4037", points: [3, 0, 5, 0, 6, h, 8, h, 7, 2 * h, 1, 2 * h, 0, h, 2, h], height: 2 * h, width: 8 },
    { points: [], height: 0, width: 0 },
    { fill: "#8bc34a", stroke: "#6aa03b", points: [3, 0, 6, 3 * h, 0, 3 * h], height: 3 * h, width: 6 },
    { points: [], height: 0, width: 0 },
  ],
};

const LeftToolbarPatternBlocks = ({ findOne }) => {
  const state = useAppStore();
  const { height, workspace, fullscreen } = state;
  const patterns = blocks[workspace];
  const maxWidth = Math.max(...patterns.map((b) => b.width));
  const leftMargin = workspace == "deci" && !fullscreen ? 60 : 25;
  const scale = (leftToolbarWidth - leftMargin) / maxWidth;
  const sumHeight = sum(patterns.map((p) => p.height));
  let topMargin = (height - sumHeight * scale) / (patterns.length + 1);

  if (workspace == "deci") {
    const sumHeight = sum(arrayChunk(patterns, 2).map(([p1, p2]) => Math.max(p1.height, p2.height)));
    topMargin = (height - sumHeight * scale) / (patterns.length / 2 + 1);
  }
  let top = topMargin;

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={height} />
      {workspace != "deci" &&
        patterns.map((pattern, i) => {
          const result = (
            <ToolbarPattern
              key={i}
              x={(leftToolbarWidth - pattern.width * scale) / 2}
              y={top}
              {...pattern}
              scale={scale}
              findOne={findOne}
            />
          );
          top += pattern.height * scale + topMargin;
          return result;
        })}
      {workspace == "deci" &&
        arrayChunk(patterns, 2).map(([pattern1, pattern2], i) => {
          const width1 = pattern1.width * scale;
          const height1 = pattern1.height * scale;
          const width2 = pattern2.width * scale;
          const height2 = pattern2.height * scale;
          const xMargin = (leftToolbarWidth - width1 - width2) / (width1 * width2 == 0 ? 2 : 3);
          const result = (
            <Fragment key={i}>
              <ToolbarPattern x={xMargin} y={top} {...pattern1} scale={scale} findOne={findOne} />
              <ToolbarPattern x={xMargin * 2 + width1} y={top + (height1 - height2) / 2} {...pattern2} scale={scale} findOne={findOne} />
            </Fragment>
          );
          top += Math.max(height1, height2) + topMargin;
          return result;
        })}
    </>
  );
};

const ToolbarPattern = (props) => {
  const state = useAppStore();
  const { origin, elements, showGrid } = state;
  const { x, y, width, height, fill, stroke, points, scale, findOne } = props;

  const step = gridStep / 2;
  const shadowPoints = points.map((x) => x * step);

  let shadow = null;
  const getShadow = () => shadow || (shadow = findOne("shadow-line"));

  const onDragStart = (e) => {
    state.clearSelect();
    getShadow().setAttrs({
      visible: true,
      points: shadowPoints,
      fill,
      stroke: stroke,
      closed: true,
    });
  };

  const magnet = ({ x, y }) => {
    return patternMagnet(null, x - (width / 2) * step, y - (height / 2) * step, shadowPoints, elements, showGrid);
  };

  const onDragMove = (e) => {
    e.target.setAttrs({ x: props.x, y: props.y });
    const { x, y } = magnet(getStageXY(e.target.getStage(), state));
    getShadow().setAttrs({
      x: x + origin.x,
      y: y + origin.y,
    });
  };

  const onDragEnd = (e) => {
    const { x, y } = magnet(getStageXY(e.target.getStage(), state));
    getShadow().setAttrs({ visible: false });
    state.addElement({
      type: "pattern",
      x: x,
      y: y,
      points: points.map((x) => x * step),
      width: width * step,
      height: height * step,
      fill: true,
      fillColor: fill,
      stroke,
    });
  };

  return (
    <Line
      x={x}
      y={y}
      points={points.map((x) => x * scale)}
      fill={fill}
      stroke={stroke}
      closed
      draggable
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    />
  );
};

export default LeftToolbarPatternBlocks;
