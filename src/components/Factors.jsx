import { Group, Line } from "react-konva";
import { useAppStore } from "../state/store";
import config from "../config";
import { BasicSummary } from "./Summary";
import { center, pointInRect } from "../util";

const baseSize = config.block.size;
const factorsSize = Math.round(baseSize * 2);

const fontSize = 36;
const commonProps = {
  strokeWidth: 2,
  cornerRadius: 8,
  stroke: config.colors.black,
  fill: config.colors.white,
};
const margin = 10;

const Factors = () => {
  const state = useAppStore();
  const { origin, showSummary } = state;
  if (!state.width || state.workspace != config.workspace.factors) return null;
  const rect = rectProps(state);
  const { x, y, width, height } = rect;
  const sums = generateSums(rect, state.elements, state.numberSet == config.numberSet.whole);

  return (
    <Group x={Math.round(origin.x + x)} y={Math.round(origin.y + y)}>
      <Line x={0} y={0} points={[-1, 0, width, 0]} {...commonProps} />
      <Line x={0} y={factorsSize} points={[0, 0, width, 0]} {...commonProps} />
      <Line x={0} y={0} points={[0, -1, 0, height]} {...commonProps} />
      <Line x={factorsSize} y={0} points={[0, 0, 0, height]} {...commonProps} />
      {showSummary && +sums.left != 0 && (
        <BasicSummary text={sums.left} x={-margin} align={true} y={(height - fontSize) / 2} />
      )}
      {showSummary && +sums.top != 0 && <BasicSummary text={sums.top} x={width / 2} y={-56 - margin} />}
      {showSummary && +sums.main != 0 && <BasicSummary text={sums.main} x={width / 2} y={height - 56 - margin} />}
    </Group>
  );
};

function generateSums(rect, elements, whole) {
  const blocks = Object.values(elements).filter((e) => e.type == "block" && !e.visibleAfterMove);
  const { x, y, width, height } = rect;
  const leftArea = {
    x: x,
    y: y + 2 * baseSize,
    width: 2 * baseSize,
    height: height - 2 * baseSize,
  };
  const topArea = {
    x: x + 2 * baseSize,
    y: y,
    width: width - 2 * baseSize,
    height: 2 * baseSize,
  };
  const mainArea = {
    x: x + 2 * baseSize,
    y: y + 2 * baseSize,
    width: width - 2 * baseSize,
    height: height - 2 * baseSize,
  };
  let left = 0;
  let top = 0;
  let main = 0;
  for (const block of blocks) {
    if (pointInRect(center(block), leftArea)) left += parseInt(block.label);
    if (pointInRect(center(block), topArea)) top += parseInt(block.label);
    if (pointInRect(center(block), mainArea)) main += parseInt(block.label);
  }
  if (whole) {
    return { left, top, main };
  } else {
    return { left: (left / 100).toFixed(2), top: (top / 100).toFixed(2), main: (main / 100).toFixed(2) };
  }
}

export function rectProps(state) {
  const { width, height, fullscreen } = state;
  const scrollSize = 14;
  const rectWidth = Math.min(width - config.leftToolbar.width - 45, 750);
  let totalHeight = height - margin * 2 - config.summary.height - config.menu.height - scrollSize;
  if (fullscreen) {
    totalHeight = Math.min(totalHeight, 600);
  }
  const rectHeight = totalHeight - margin;
  const x = -rectWidth / 2;
  const y = -(totalHeight + scrollSize) / 2 + baseSize * 2;
  return { x, y, width: rectWidth, height: rectHeight };
}

export default Factors;
