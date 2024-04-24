import { Group, Line, Rect, Text } from "react-konva";
import { allOptions, leftToolbarWidth } from "./LeftToolbar";
import { Button, buttonHeight, buttonWidth, commonProps, margin, scrollSize, sumInRect } from "./Comparing";
import { menuHeight } from "./Menu";
import { useAppStore } from "../state/store";
import { isPointInRect } from "../util";

const subtractorSize = buttonHeight;

const PlaceValue = () => {
  const state = useAppStore();
  const { origin, width, minValue, maxValue, workspace } = state;
  if (!width || !(workspace == "Place Value" || workspace == "Subtraction")) return null;
  const totalWidth = getTotalWidth(state);
  const totalHeight = getTotalHeight(state);
  const mainHeight = totalHeight - buttonHeight - margin;
  const x = origin.x - (totalWidth + scrollSize) / 2;
  const y = origin.y - (totalHeight + scrollSize) / 2;
  const columns = Math.log10(maxValue / minValue) + 1;
  const columnWidth = totalWidth / columns;
  const heads = [];
  const lines = [];
  for (let x = 0, value = maxValue; value >= minValue; x += columnWidth, value /= 10) {
    heads.push({ x, ...allOptions[value] });
    if (x > 0) lines.push(x);
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

      {workspace == "Subtraction" &&
        Object.values(getSubtractors(state, true)).map((props, i) => <Subtractor key={i} {...props} />)}

      <Button
        x={totalWidth / 2 - buttonWidth / 2}
        y={mainHeight + margin}
        value={sumInRect(state, x, y, totalWidth, mainHeight)}
      />
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

const Subtractor = ({ x, y, count }) => {
  const fontSize = 28;

  const cx = subtractorSize / 2;
  const d = 5;
  const m = 5;
  return (
    <Group x={x} y={y}>
      <Line
        x={0}
        y={0}
        points={[cx - d, -m - d, cx, -m, cx + d, -m - d, cx, -m, cx, -d * 3 - m]}
        lineCap="round"
        lineJoin="round"
        {...commonProps}
      />

      <Rect x={0} y={0} width={subtractorSize} height={subtractorSize} {...commonProps} />
      <Text
        x={0}
        y={subtractorSize / 2 - fontSize / 2}
        text={count}
        width={subtractorSize}
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
  return Math.min(state.width - leftToolbarWidth - 45, 1200);
}

function getTotalHeight(state) {
  let totalHeight = state.height - margin * 2 - menuHeight - scrollSize;
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
  const y0 = -(totalHeight + scrollSize) / 2 ;
  const columns = Math.log10(maxValue / minValue) + 1;
  const columnWidth = totalWidth / columns;
  const rects = {};
  for (let x = 0, value = maxValue; value >= minValue; x += columnWidth, value /= 10) {
    rects[value] = { x: x0 + x, y: y0, width: columnWidth, height: mainHeight + headHeight };
  }
  rects.all = {
    x: x0,
    y: y0,
    width: totalWidth,
    height: mainHeight + headHeight,
  };
  return rects;
}

export function getSubtractors(state, relative = false) {
  const { minValue, maxValue, subtractorCounts } = state;
  const totalWidth = getTotalWidth(state);
  const totalHeight = getTotalHeight(state);
  const mainHeight = totalHeight - buttonHeight - margin;
  const x0 = relative ? 0 : -(totalWidth + scrollSize) / 2;
  const y0 = relative ? 0 : -(totalHeight + scrollSize) / 2;
  const columns = Math.log10(maxValue / minValue) + 1;
  const columnWidth = totalWidth / columns;
  const subtractors = {};
  for (let x = 0, value = maxValue; value >= minValue; x += columnWidth, value /= 10) {
    subtractors[value] = {
      x: x0 + x + columnWidth / 2 - subtractorSize / 2,
      y: y0 + mainHeight - subtractorSize - margin,
      width: subtractorSize,
      height: subtractorSize,
      count: subtractorCounts[value],
    };
  }
  return subtractors;
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

export function diskInRegroupColumn(state, e) {
  const rects = getValueRects(state);
  return (
    ["Place Value", "Subtraction"].includes(state.workspace) &&
    e.type == "disk" &&
    isPointInRect(e, rects.all) &&
    isPointInRect(e, rects[e.value * 10])
  );
}

export default PlaceValue;
