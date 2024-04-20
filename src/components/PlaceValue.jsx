import { Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import config from "../config";
import { BasicSummary } from "./Summary";
import { Fragment } from "react";
import { boxesIntersect, pointInRect } from "../util";

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
  if (!state.width) return null;
  const { x, y, totalWidth, mainHeight, columns, columnWidth, rects } = placeValueProps(state);

  const sum = Object.values(state.elements)
    .filter((block) => block.type == "block" && boxesIntersect(block, rects.all))
    .reduce((sum, block) => sum + parseInt(block.label), 0);

  return (
    <Group x={state.origin.x + x} y={state.origin.y + y}>
      <Rect x={0} y={0} width={totalWidth} height={mainHeight} {...commonProps} cornerRadius={0} />
      {columns.map((column, i) => (
        <Fragment key={i}>
          {i > 0 && <Line x={i * columnWidth} y={0} points={[0, 0, 0, mainHeight]} {...commonProps} />}
          <Head x={i * columnWidth} column={column.name} width={columnWidth} height={summaryHeight + 2 * margin} />
        </Fragment>
      ))}

      <BasicSummary x={totalWidth / 2} y={mainHeight + margin} text={sum} />
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

export function placeValueProps(state) {
  const totalWidth = Math.min(state.width - config.leftToolbar.width - 45, 1200);
  const totalHeight = getTotalHeight(state);
  const mainHeight = totalHeight - summaryHeight - margin;
  const x = -(totalWidth + scrollSize) / 2;
  const y = -(totalHeight + scrollSize) / 2;
  const columns = Object.values(getColumns(state)).toReversed();
  const columnWidth = totalWidth / columns.length;
  const rects = {};
  columns.forEach((column, i) => {
    rects[column.label] = {
      x: x + columnWidth * i,
      y: y,
      width: columnWidth,
      height: mainHeight,
    };
  });
  rects.all = {
    x,
    y,
    width: totalWidth,
    height: mainHeight,
  };
  return { x, y, totalWidth, mainHeight, columns, columnWidth, rects };
}

function getColumns(state) {
  const options = { ...config.block.options };
  if (state.blockSet == config.blockSet.flats) {
    delete options[1000];
  }
  if (state.blockSet == config.blockSet.rods) {
    delete options[1000];
    delete options[100];
  }
  return options;
}

function getTotalHeight(state) {
  let totalHeight = state.height - margin * 2 - config.menu.height - scrollSize;
  if (state.fullscreen) {
    totalHeight = Math.min(totalHeight, 600);
  }
  return totalHeight;
}

function center({ x, y, width, height }) {
  return { x: x + width / 2, y: y + height / 2 };
}

export function elementInWrongColumn(state, element) {
  if (state.workspace == config.workspace.placeValue && element.type == "block") {
    const { rects } = placeValueProps(state);
    return boxesIntersect(element, rects.all) && !pointInRect(center(element), rects[element.label]);
  }
}

export function elementInBreakColumn(state, element) {
  if (state.workspace == config.workspace.placeValue && element.type == "block") {
    const { rects } = placeValueProps(state);
    return element.label != "1" && pointInRect(center(element), rects[parseInt(element.label) / 10]);
  }
}

export default PlaceValue;
