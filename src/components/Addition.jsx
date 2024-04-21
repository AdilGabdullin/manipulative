import { Group, Line, Rect } from "react-konva";
import { useAppStore } from "../state/store";
import config from "../config";
import { BasicSummary } from "./Summary";
import { center, pointInRect } from "../util";

const baseSize = config.block.size;
const factorsSize = Math.round(baseSize * 2);

const commonProps = {
  strokeWidth: 2,
  cornerRadius: 8,
  stroke: config.colors.black,
  fill: config.colors.white,
};
const margin = 10;

const Addition = () => {
  const state = useAppStore();
  const { origin, showSummary } = state;
  if (!state.width) return null;
  const rect = rectProps(state);
  const totalWidth = rect.width;
  const mainHeight = rect.height + config.summary.height;
  const x = Math.round(origin.x + rect.x);
  const y = Math.round(origin.y + rect.y - config.summary.height - margin);

  return (
    <Group x={x} y={y}>
      <Rect x={0} y={0} width={totalWidth} height={mainHeight} {...commonProps} />
      <Line x={0} y={Math.round(mainHeight / 3)} points={[0, 0, totalWidth, 0]} {...commonProps} />
      <Line x={0} y={Math.round((mainHeight / 3) * 2)} points={[0, 0, totalWidth, 0]} {...commonProps} />
    </Group>
  );
};

function rectProps(state) {
  const { width, height, fullscreen } = state;
  const scrollSize = 14;
  const rectWidth = Math.min(width - config.leftToolbar.width - 45, 1200);
  let totalHeight = height - margin * 2 - config.summary.height - config.menu.height - scrollSize;
  if (fullscreen) {
    totalHeight = Math.min(totalHeight, 600);
  }
  const rectHeight = totalHeight - margin;
  const x = -rectWidth / 2;
  const y = -(totalHeight + scrollSize) / 2 + baseSize * 2;
  return { x, y, width: rectWidth, height: rectHeight };
}

export default Addition;
