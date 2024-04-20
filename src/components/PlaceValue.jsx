import { Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import config from "../config";
import { BasicSummary } from "./Summary";
import { Fragment } from "react";

const margin = 10;
const summaryHeight = config.summary.height;
const scrollSize = 14;
const stroke = config.colors.darkGrey;
const commonProps = {
  cornerRadius: 6,
  stroke: stroke,
  strokeWidth: 2,
};

const PlaceValue = () => {
  const state = useAppStore();
  const { origin, width } = state;
  if (!width) return null;
  const totalWidth = getTotalWidth(state);
  const totalHeight = getTotalHeight(state);

  const mainHeight = totalHeight - summaryHeight - margin;
  const x = origin.x - (totalWidth + scrollSize) / 2;
  const y = origin.y - (totalHeight + scrollSize) / 2;
  const columns = getColumns(state);
  const columnWidth = totalWidth / Object.values(columns).length;

  return (
    <Group x={x} y={y}>
      <Rect x={0} y={0} width={totalWidth} height={mainHeight} {...commonProps} cornerRadius={0} />
      {columns.map((column, i) => (
        <Fragment key={i}>
          {i > 0 && <Line key={x} x={i * columnWidth} y={0} points={[0, 0, 0, mainHeight]} {...commonProps} />}
          <Head key={i} x={i * columnWidth} column={column} width={columnWidth} height={summaryHeight + 2 * margin} />
        </Fragment>
      ))}

      <BasicSummary x={totalWidth / 2} y={mainHeight + margin} text={"111"} />
    </Group>
  );
};

const Head = ({ x, width, height, column }) => {
  const color = "purple";
  const fontSize = 28;
  const shift = column.includes("\n") ? fontSize : fontSize / 2;
  return (
    <Group x={x} y={0}>
      <Rect {...commonProps} x={0} y={0} width={width} height={height} fill={color} cornerRadius={0} />
      <Rect {...commonProps} x={margin} y={margin} width={width - margin * 2} height={summaryHeight} fill="white" />
      <Text
        x={margin}
        y={margin + summaryHeight / 2 - shift}
        width={width - margin * 2}
        text={column}
        fontSize={fontSize}
        fill={"#333"}
        stroke={"#333"}
        align={"center"}
        fontFamily={"Calibri"}
      />
    </Group>
  );
};

function getColumns(state) {
  const options = { ...config.block.options };
  if (state.blockSet == config.blockSet.flats) {
    delete options[1000];
  }
  if (state.blockSet == config.blockSet.rods) {
    delete options[1000];
    delete options[100];
  }
  return Object.values(options)
    .map((op) => op.column)
    .toReversed();
}

function getTotalWidth(state) {
  return Math.min(state.width - config.leftToolbar.width - 45, 1200);
}

function getTotalHeight(state) {
  let totalHeight = state.height - margin * 2 - config.menu.height - scrollSize;
  if (state.fullscreen) {
    totalHeight = Math.min(totalHeight, 600);
  }
  return totalHeight;
}

export function getValueRects(state) {
  const { minValue, maxValue } = state;
  const totalWidth = getTotalWidth(state);
  const totalHeight = getTotalHeight(state);
  const headHeight = summaryHeight + 2 * margin;
  const mainHeight = totalHeight - summaryHeight - margin - headHeight;
  const x0 = -(totalWidth + scrollSize) / 2;
  const y0 = -(totalHeight + scrollSize) / 2 + headHeight;
  const columns = Math.log10(maxValue / minValue) + 1;
  const columnWidth = totalWidth / columns;
  const rects = {};
  for (let x = 0, value = maxValue; value >= minValue; x += columnWidth, value /= 10) {
    rects[value] = { x: x0 + x, y: y0, width: columnWidth, height: mainHeight };
  }
  rects.all = {
    x: x0,
    y: y0,
    width: totalWidth,
    height: mainHeight,
  };
  return rects;
}

export function diskInWrongColumn(state, e) {
  const rects = getValueRects(state);
  return (
    ["Place Value", "Subtraction"].includes(state.workspace) &&
    e.type == "disk" &&
    isPointInRect(e, rects.all) &&
    !isPointInRect(e, rects[e.value])
  );
}

export function diskInBreakColumn(state, e) {
  const rects = getValueRects(state);
  return (
    ["Place Value", "Subtraction"].includes(state.workspace) &&
    e.type == "disk" &&
    isPointInRect(e, rects.all) &&
    isPointInRect(e, rects[e.value / 10])
  );
}

export default PlaceValue;
