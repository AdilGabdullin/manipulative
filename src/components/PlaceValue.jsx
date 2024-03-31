import { Group, Line, Rect, Text } from "react-konva";
import { allOptions, leftToolbarWidth } from "./LeftToolbar";
import { Button, buttonHeight, buttonWidth, commonProps, margin, scrollSize, sumInRect, textProps } from "./Comparing";
import { menuHeight } from "./Menu";
import { useAppStore } from "../state/store";
import { isPointInRect } from "../util";

const getTotalWidth = (state) => {
  return Math.min(state.width - leftToolbarWidth - 45, 1200);
};

const getTotalHeight = (state) => {
  let totalHeight = state.height - margin * 2 - menuHeight - scrollSize;
  if (state.fullscreen) {
    totalHeight = Math.min(totalHeight, 600);
  }
  return totalHeight;
};

const getValueRects = (state) => {
  const { minValue, maxValue } = state;
  const totalWidth = getTotalWidth(state);
  const totalHeight = getTotalHeight(state);
  const mainHeight = totalHeight - buttonHeight - margin;
  const x0 = -(totalWidth + scrollSize) / 2;
  const y0 = -(totalHeight + scrollSize) / 2;
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
};

export function diskInWrongColumn(state, e) {
  const rects = getValueRects(state);
  return (
    ["Place Value", "Subtraction"].includes(state.workspace) &&
    e.type == "disk" &&
    isPointInRect(e, rects.all) &&
    !isPointInRect(e, rects[e.value])
  );
}

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
        {...textProps}
        x={margin}
        y={margin + buttonHeight / 2 - shift}
        width={width - margin * 2}
        text={text}
        fontSize={fontSize}
        fill={"#333"}
        stroke={"#333"}
      />
    </Group>
  );
};

export default PlaceValue;
