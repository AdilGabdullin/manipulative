import { Group, Line, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { colors } from "../config";

const TileLabel = ({ x, y, width, height, denominator, fill, boardTile }) => {
  const state = useAppStore();
  const { labels } = state;
  const color = labelColor(denominator, !!fill);

  const fVisible = fractionsVisible(denominator, labels);
  const dVisible = decimalsVisible(denominator, labels);

  const fontSize = boardTile && height > width ? labelFontSize(denominator, labels) : 25;
  const textProps = {
    fontFamily: "Calibri",
    fontSize: fontSize,
    align: "center",
  };

  return (
    <Group x={width / 2} y={height / 2}>
      <Text x={-50} width={100} y={-fontSize + 1} text={"1"} fill={color} visible={fVisible} {...textProps} />
      <Line points={[-13, 0, 13, 0]} stroke={color} visible={fVisible} />
      <Text x={-50} width={100} y={1} text={denominator} fill={color} visible={fVisible} {...textProps} />

      <Text
        x={-50}
        width={100}
        y={-fontSize / 2}
        text={labelText(denominator, labels)}
        fill={color}
        {...textProps}
        visible={dVisible}
      />
      <Text
        x={-50}
        width={100}
        y={-fontSize / 2}
        text={overlineText(denominator, labels)}
        fill={color}
        {...textProps}
        visible={dVisible}
      />
    </Group>
  );
};

export function labelColor(denominator, isFilled = true) {
  return !isFilled || denominator == 4 ? colors.black : colors.white;
}

export function labelText(denominator, labels) {
  if (labels == "Fractions" && denominator == 1) {
    return "1";
  }
  if (labels == "Decimals") {
    return {
      1: "1",
      2: "0.5",
      3: "0.3",
      4: "0.25",
      5: "0.2",
      6: "0.16",
      8: "0.125",
      10: "0.1",
      12: "0.083",
    }[denominator];
  }
  if (labels == "Percents") {
    return {
      1: "100%",
      2: "50%",
      3: "33.3%",
      4: "25%",
      5: "20%",
      6: "16.6%",
      8: "12.5%",
      10: "10%",
      12: "8.3%",
    }[denominator];
  }
  if (labels == "Blank") {
    return "";
  }
}

export function overlineText(denominator, labels) {
  if (labels == "Decimals") {
    return (
      {
        3: "   \u203E",
        6: "      \u203E",
        12: "        \u203E",
      }[denominator] || ""
    );
  }
  if (labels == "Percents") {
    return (
      {
        3: "   \u203E",
        6: "   \u203E",
        12: "\u203E",
      }[denominator] || ""
    );
  }
  return "";
}

export function fractionsVisible(denominator, labels) {
  return denominator != 1 && labels == "Fractions";
}

export function decimalsVisible(denominator, labels) {
  return denominator == 1 || labels == "Decimals" || labels == "Percents";
}

export function labelFontSize(denominator, labels) {
  return denominator == 12 && labels == "Decimals" ? 16 : 25;
}

export default TileLabel;
