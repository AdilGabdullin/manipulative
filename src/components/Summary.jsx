import { Rect, Text } from "react-konva";
import { colors } from "../config";
import { tileType } from "./Tile";

const fontSize = 36;

const Summary = ({ text, x, y, visible }) => {
  if (!visible) return null;
  const width = text.length * 15 + 32;
  const height = 56;
  x = x - width / 2;
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

function signPrefix(count) {
  return count > 0 ? " + " : " - ";
}

export function generateSum(elements) {
  const counts = countParts(elements);
  let text = "";
  for (const key of ["x²", "y²", "xy", "x", "y", "1"]) {
    const count = counts[key];
    const absCount = Math.abs(count);
    if (!count) continue;
    text += signPrefix(count);
    if (absCount == 1) {
      text += key;
    } else {
      text += absCount + (key == 1 ? "" : key);
    }
  }
  if (text == "") return "0";
  if (text.slice(0, 3) == " + ") return text.slice(3);
  if (text.slice(0, 3) == " - ") return "-" + text.slice(3);
  return text;
}

export default Summary;
