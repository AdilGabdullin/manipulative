import { Group, Line, Rect, Text } from "react-konva";
// import { allOptions, leftToolbarWidth } from "./LeftToolbar";
// import { Button, buttonHeight, buttonWidth, commonProps, margin, scrollSize, sumInRect } from "./Comparing";
import { useAppStore } from "../state/store";
import config from "../config";
// import { isPointInRect } from "../util";

// const subtractorSize = buttonHeight;

const margin = 10;
const buttonHeight = 64;
const buttonWidth = 140;
const scrollSize = 14;
const stroke = "grey";
const commonProps = {
  cornerRadius: 6,
  stroke: stroke,
  strokeWidth: 2,
};
const textProps = {
  stroke: "#299af3",
  fill: "#299af3",
  align: "center",
  fontFamily: "Calibri",
};

const PlaceValue = () => {
  const state = useAppStore();
  const { origin, width } = state;
  if (!width) return null;
  const totalWidth = getTotalWidth(state);
  const totalHeight = getTotalHeight(state);

  const mainHeight = totalHeight - buttonHeight - margin;
  const x = origin.x - (totalWidth + scrollSize) / 2;
  const y = origin.y - (totalHeight + scrollSize) / 2;
  const columns = 4;
  const columnWidth = totalWidth / columns;
  const allOptions = [
    { color: "purple", text: "Thousands" },
    { color: "purple", text: "Hundreds" },
    { color: "purple", text: "Tens" },
    { color: "purple", text: "Ones" },
  ];
  const heads = [];
  const lines = [];
  for (let x = 0, i = 0; i < 4; i += 1) {
    heads.push({ x, ...allOptions[i] });
    if (x > 0) lines.push(x);
    x += columnWidth;
  }

  return (
    <Group x={x} y={y}>
      <Rect x={0} y={0} width={totalWidth} height={mainHeight} {...commonProps} cornerRadius={0} />
      {lines.map((x) => (
        <Line key={x} x={x} y={0} points={[0, 0, 0, mainHeight]} {...commonProps} />
      ))}

      {heads.map((props, i) => (
        <Head key={i} {...props} width={columnWidth} height={buttonHeight + 2 * margin} />
      ))}
    </Group>
  );
};

const Head = ({ x, width, height, color, text }) => {
  const fontSize = 28;
  const shift = text.includes("\n") ? fontSize : fontSize / 2;
  return (
    <Group x={x} y={0}>
      <Rect {...commonProps} x={0} y={0} width={width} height={height} fill={color} cornerRadius={0} />
      <Rect {...commonProps} x={margin} y={margin} width={width - margin * 2} height={buttonHeight} fill="white" />
      <Text
        x={margin}
        y={margin + buttonHeight / 2 - shift}
        width={width - margin * 2}
        text={text}
        fontSize={fontSize}
        fill={"#333"}
        stroke={"#333"}
        align={"center"}
        fontFamily={"Calibri"}
      />
    </Group>
  );
};

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
  const headHeight = buttonHeight + 2 * margin;
  const mainHeight = totalHeight - buttonHeight - margin - headHeight;
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
