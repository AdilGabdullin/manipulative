import { Group, Rect, Text } from "react-konva";
import { colors } from "../config";

const fontSize = 20;
export const baseSize = 50;

export const Tile = (props) => {
  const dynamic = dynamicProps(props);
  return (
    <Group id={props.id} {...dynamic.group}>
      <Rect {...dynamic.rect} />
      <Text {...dynamic.text} fontFamily="Calibri" fontSize={fontSize} align="center" fill={colors.white} />
    </Group>
  );
};

export function dynamicProps({ x, y, width, height, text, visible }) {
  const { blue, red, blueBorder, redBorder } = colors;
  const isPositive = text && text[0] != "-";
  const fill = isPositive ? blue : red;
  const stroke = isPositive ? blueBorder : redBorder;
  return {
    group: { x, y, visible },
    rect: { width, height, fill, stroke },
    text: {
      x: 0,
      y: (height - fontSize) / 2 || 0,
      width: width,
      text: text,
    },
  };
}
