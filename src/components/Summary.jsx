import { Rect, Text } from "react-konva";
import { colors, workspace } from "../config";
import { useAppStore } from "../state/store";
import { leftToolbarWidth } from "./LeftToolbar";
import { tileType } from "./Tile";

const fontSize = 36;

const Summary = () => {
  const state = useAppStore();
  if (state.workspace != workspace.basic) return null;
  const text = generateSum(countParts(state.elements));
  if (text == "") return null;
  const width = text.length * 15 + 32;
  const height = 56;
  const x = (state.width + leftToolbarWidth) / 2 - width / 2;
  const y = state.height - 80;
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
        y={y + height / 2 - fontSize / 2}
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

function countParts(elements) {
  const counts = {};
  Object.values(elements)
    .filter((e) => e.type == tileType)
    .forEach((e) => {
      const key = e.text.replace("-", "");
      counts[key] = (counts[key] || 0) + (e.text.includes("-") ? -1 : 1);
    });
  return counts;
}

function generateSum(counts) {
  let text = "";
  for (const key of ["x²", "y²", "xy", "x", "y", "1"]) {
    const count = counts[key];
    if (!count) {
      continue;
    } else if (count == 1) {
      text += " + " + key;
    } else if (count == -1) {
      text += " - " + key;
    } else {
      text += (count > 0 ? " + " : " - ") + Math.abs(count) + (key == 1 ? "" : key);
    }
  }
  return text.slice(3);
}

export default Summary;
