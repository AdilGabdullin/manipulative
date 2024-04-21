import { Rect, Text } from "react-konva";
import config from "../config";
import { useAppStore } from "../state/store";

export const BasicSummary = ({ text, x, y, align }) => {
  text = text.toString();
  const { fontSize, height } = config.summary;
  const colors = config.colors;
  const width = text.length * 15 + 32;
  x = align ? x - width : x - width / 2;
  return (
    <>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        strokeWidth={4}
        cornerRadius={8}
        stroke={colors.grey}
        fill={colors.white}
      />
      <Text
        x={x}
        y={y + height / 2 - fontSize / 2 + 2}
        text={text}
        fontSize={fontSize}
        stroke={colors.blue}
        fill={colors.blue}
        width={width}
        align="center"
      />
    </>
  );
};

const Summary = () => {
  const state = useAppStore();
  if (!state.showSummary || !state.width) {
    return null;
  }
  const { elements } = state;
  let sum = Object.values(elements)
    .filter((e) => e.type == "block" && !e.visibleAfterMove)
    .reduce((sum, e) => sum + parseInt(e.label), 0);
  if (state.numberSet == config.numberSet.decimal) sum = sum / 100;
  return (
    <BasicSummary
      text={config.intl.format(sum)}
      x={(state.width + config.leftToolbar.width) / 2}
      y={state.height - 80}
    />
  );
};

export default Summary;
