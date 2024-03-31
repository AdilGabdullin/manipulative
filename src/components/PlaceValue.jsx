import { Group, Line, Rect, Text } from "react-konva";
import { allOptions, leftToolbarWidth } from "./LeftToolbar";
import { Button, buttonHeight, buttonWidth, commonProps, margin, scrollSize, sumInRect, textProps } from "./Comparing";
import { menuHeight } from "./Menu";
import { useAppStore } from "../state/store";

const PlaceValue = () => {
  const state = useAppStore();
  const { origin, width, height, fullscreen, minValue, maxValue } = state;
  if (!width) return null;
  const totalWidth = Math.min(width - leftToolbarWidth - 45, 1200);
  let totalHeight = height - margin * 2 - menuHeight - scrollSize;
  if (fullscreen) {
    totalHeight = Math.min(totalHeight, 600);
  }
  const mainHeight = totalHeight - buttonHeight - margin;
  const x = origin.x - (totalWidth + scrollSize) / 2;
  const y = origin.y - (totalHeight + scrollSize) / 2;

  const columns = 7;
  const columnWidth = totalWidth / columns;
  const lines = [];
  for (let x = columnWidth; x < columns * columnWidth; x += columnWidth) {
    lines.push(x);
  }

  const heads = [];

  for (let x = 0, value = maxValue; value >= minValue; x += columnWidth, value /= 10) {
    heads.push({ x, ...allOptions[value] });
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
      <Rect {...commonProps} x={margin} y={margin} width={buttonWidth} height={buttonHeight} fill="white" />
      <Text
        {...textProps}
        x={margin}
        y={margin + buttonHeight / 2 - shift}
        width={buttonWidth}
        text={text}
        fontSize={fontSize}
        fill={"#333"}
        stroke={"#333"}
      />
    </Group>
  );
};

export default PlaceValue;
