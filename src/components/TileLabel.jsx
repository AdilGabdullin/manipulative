import { Group, Line, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { colors } from "../config";

const TileLabel = ({ width, height, denominator }) => {
  const state = useAppStore();
  const { labels } = state;

  const fontSize = 25;
  const padding = (height - fontSize * 2) / 3;

  const textProps = {
    fill: colors.white,
    fontFamily: "Calibri",
    fontSize: 25,
    width,
    align: "center",
  };

  if (labels == "Blank") {
    return null;
  }

  if (labels == "Fractions") {
    return (
      <>
        <Text y={padding} text={"1"} {...textProps} />
        {/* <Line
      name="drag-hidden"
      points={[
        x0 + cos(alpha - 10) * r2,
        y0 + sin(alpha - 10) * r2,
        x0 + cos(alpha + 10) * r2,
        y0 + sin(alpha + 10) * r2,
      ]}
      stroke={color}
      lineJoin="round"
      lineCap="round"
    /> */}
        <Text y={height - padding - fontSize} text={denominator} {...textProps} />
      </>
    );
  }

  return null;
};

export default TileLabel;
