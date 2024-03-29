import { Circle, Text } from "react-konva";
import { useAppStore } from "../state/store";

export const radius = 32;

const Disk = (props) => {
  const state = useAppStore();
  const { origin, selectIds } = state;
  const { id, value, color, locked } = props;
  const x = origin.x + props.x;
  const y = origin.y + props.y;

  const onPointerClick = (e) => {
    selectIds([id], locked);
  };
  return (
    <>
      <Circle x={x} y={y} fill={color} radius={radius} onPointerClick={onPointerClick} />
      <Text
        x={x - radius}
        y={y - fontSize(value) / 2}
        width={radius * 2}
        text={format(value)}
        fontFamily={"Calibri"}
        fontSize={fontSize(value)}
        wrap="char"
        align="center"
        verticalAlign="center"
        fill={"white"}
        color={"white"}
        onPointerClick={onPointerClick}
      />
    </>
  );
};

const intl = new Intl.NumberFormat("en-US");

export function format(value) {
  return intl.format(value);
}

export function fontSize(value) {
  if (value == 1_000_000) return 15;
  if (value == 100_000) return 18;
  return 22;
}

export default Disk;
