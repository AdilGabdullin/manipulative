import { Group, Rect, Text } from "react-konva";
import { colors, config, workspace } from "../config";
import { useAppStore } from "../state/store";

const margin = 16;
const fontSize = 36;
const height = config.summary.height;

const Summary = () => {
  const state = useAppStore();
  if (!state.showSummary || !state.width || state.workspace == workspace.ppw) {
    return null;
  }
  const text = getSummary(state.elements);
  const width = text.length * 14 + margin * 2;
  return (
    <Group x={(state.width + config.leftToolbar.width - width) / 2} y={state.height - 86} visible={text != ""}>
      <Rect width={width} height={height} strokeWidth={4} cornerRadius={8} stroke={colors.grey} fill={colors.white} />
      <Text
        text={text}
        y={height / 2 - fontSize / 2}
        width={width}
        fontFamily="Calibri"
        fontSize={fontSize}
        align="center"
        fill={colors.blue}
        stroke={colors.blue}
      />
    </Group>
  );
};

function getSummary(elements) {
  const counts = {};
  for (const { text } of config.tile.options) {
    counts[text] = 0;
  }
  for (const tile of Object.values(elements)) {
    if (tile.type == "tile") {
      counts[tile.text] += 1;
    }
  }
  const plus = counts["+"];
  const minus = counts["-"];

  if (plus == 0 && minus == 0) {
    return "";
  }
  if (plus > 0 && minus == 0) {
    return `${plus}`;
  }
  if (plus == 0 && minus > 0) {
    return `(${-minus})`;
  }
  if (plus > 0 && minus > 0) {
    return `${plus} + (${-minus})`;
  }
  console.error("unreachable");
}

export default Summary;
