import { Group, Line, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { colors } from "../config";

const fontSize = 25;
const textProps = {
  fontFamily: "Calibri",
  fontSize: fontSize,
  align: "center",
};

const TileLabel = ({ x, y, width, height, denominator, fill }) => {
  const state = useAppStore();
  const { labels } = state;
  const color = labelColor(denominator, !!fill);

  if (labels == "Blank") {
    return null;
  }

  if (labels == "Fractions") {
    return (
      <Group x={width / 2} y={height / 2}>
        <Text x={-50} width={100} y={-fontSize + 1} text={"1"} fill={color} {...textProps} />
        <Line points={[-13, 0, 13, 0]} stroke={color} />
        <Text x={-50} width={100} y={1} text={denominator} fill={color} {...textProps} />
      </Group>
    );
  }

  return null;
};

export function labelColor(denominator, isFilled = true) {
  return !isFilled || denominator == 4 ? colors.black : colors.white;
}

export default TileLabel;
