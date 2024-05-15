import { Circle, Group, Line, Rect } from "react-konva";
import { useAppStore } from "../state/store";
import config from "../config";
import { AdditionSummary } from "./Summary";
import { center, pointInRect } from "../util";

const baseSize = config.block.size;

const commonProps = {
  strokeWidth: 2,
  cornerRadius: 8,
  stroke: config.colors.black,
  fill: config.colors.white,
};
const margin = 10;
export const summarySection = 130;

const Addition = () => {
  const state = useAppStore();
  const { origin, blockSet } = state;
  if (!state.width) return null;
  const rect = rectProps(state);
  const totalWidth = rect.width;
  const mainHeight = rect.height + config.summary.height;
  const x = Math.round(origin.x + rect.x);
  const y = Math.round(origin.y + rect.y - config.summary.height - margin);
  const r = 20;
  const l = r * 0.4;

  const zone0 = { ...rect, y: rect.y - config.summary.height - margin, height: mainHeight / 3 };
  const zones = [zone0, { ...zone0, y: zone0.y + mainHeight / 3 }, { ...zone0, y: zone0.y + (mainHeight * 2) / 3 }];
  const sums = zones.map((zone) =>
    Object.values(state.elements)
      .filter((e) => e.type == "block" && !e.visibleAfterMove && pointInRect(center(e), zone))
      .reduce((sum, e) => sum + parseInt(e.label), 0)
  );

  const { cubes, flats } = config.blockSet;
  const sections = blockSet == cubes ? 4 : blockSet == flats ? 3 : 2;
  const sectionSeparators = [];
  const step = (totalWidth - (state.showSummary ? summarySection : 0)) / sections;
  for (let x = step; x < totalWidth; x += step) {
    sectionSeparators.push(Math.round(x));
  }

  return (
    <Group x={x} y={y}>
      <Rect x={0} y={0} width={totalWidth} height={mainHeight} {...commonProps} />
      <Line x={0} y={Math.round(mainHeight / 3)} points={[0, 0, totalWidth, 0]} {...commonProps} />
      <Line x={0} y={Math.round((mainHeight / 3) * 2)} points={[0, 0, totalWidth, 0]} {...commonProps} />
      {sectionSeparators.map((x) => (
        <Line key={x} x={x} y={0} points={[0, 0, 0, mainHeight]} {...commonProps} />
      ))}

      <Circle x={0} y={mainHeight / 2} radius={r} {...commonProps} />
      <Line x={0} y={mainHeight / 2} points={[-l, 0, l, 0]} {...commonProps} strokeWidth={4} />
      {state.workspace == config.workspace.addition && (
        <Line x={0} y={mainHeight / 2} points={[0, -l, 0, l]} {...commonProps} strokeWidth={4} />
      )}

      {state.showSummary && (
        <>
          <AdditionSummary y={mainHeight / 6} right={totalWidth} sum={sums[0]} />
          <AdditionSummary y={mainHeight / 2} right={totalWidth} sum={sums[1]} />
          <AdditionSummary y={(mainHeight * 5) / 6} right={totalWidth} sum={sums[2]} />
        </>
      )}
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
