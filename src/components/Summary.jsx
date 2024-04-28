import { Group, Rect, Text } from "react-konva";
import { config, workspace } from "../config";
import { useAppStore } from "../state/store";

const margin = 16;
const squareWidth = 20;
const fontSize = 36;
const height = config.summary.height;

const Summary = () => {
  const state = useAppStore();
  if (!state.showSummary || !state.width || state.workspace == workspace.ppw) {
    return null;
  }
  const sums = getSums(state.elements);
  const colors = config.colors;
  const widths = sums.map((s) => (s.count < 10 ? 40 : 60));
  const width = (sums.length + 1) * margin + widths.reduce((sum, w) => sum + w, 0);
  const xs = [margin];
  for (let i = 1; i < sums.length; i += 1) {
    xs.push(xs[i - 1] + widths[i - 1] + margin);
  }
  const y = (height - squareWidth) / 2;
  return (
    <Group x={(state.width + config.leftToolbar.width - width) / 2} y={state.height - 86} visible={sums.length > 0}>
      <Rect width={width} height={height} strokeWidth={4} cornerRadius={8} stroke={colors.grey} fill={colors.white} />
      {sums.map(({ color, count }, i) => (
        <Item key={color} color={color} count={count} x={xs[i]} y={y} />
      ))}
    </Group>
  );
};

const Item = ({ x, y, color, count }) => {
  return (
    <>
      <Rect x={x} y={y} fill={color} width={squareWidth} height={squareWidth} />
      <Text
        x={x + 25}
        y={(height - fontSize) / 2 + 2}
        text={count.toString()}
        fontFamily="Calibri"
        fontSize={fontSize}
        fill={color}
        stroke={color}
      />
    </>
  );
};

function getSums(elements) {
  const sums = {};
  for (const { fill } of config.tile.options) {
    sums[fill] = { color: fill, count: 0 };
  }
  for (const tile of Object.values(elements)) {
    if (tile.type == "tile") {
      sums[tile.fillColor].count += 1;
    }
  }
  for (const key in sums) {
    if (sums[key].count == 0) delete sums[key];
  }
  return Object.values(sums);
}

export default Summary;
