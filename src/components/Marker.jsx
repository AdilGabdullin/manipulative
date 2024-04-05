import { Group, Rect, Text } from "react-konva";
import { colors } from "../state/colors";
import { useAppStore } from "../state/store";
import { numberBetween } from "../util";
import { nlLineWidth } from "./NumberLine";

export const mWidth = 70;
export const mHeight = 100;

const Marker = ({ id, x, y, width, height, visible, locked, text }) => {
  const state = useAppStore();
  const { origin, selectIds, relocateElement } = state;

  const top = {
    width: width / 20,
    height: width * 0.4,
  };
  const window = {
    width: width * 0.8,
    height: width * 0.8,
    margin: width * 0.1,
  };

  const pos = {
    x: origin.x + x,
    y: origin.y + y,
  };

  return (
    <Group
      id={id}
      x={pos.x}
      y={pos.y}
      visible={visible !== undefined ? visible : true}
      draggable
      onDragMove={(e) => {
        const dx = e.target.x() - pos.x;
        const dy = e.target.y() - pos.y;
        const newPos = openMarkerMagnet({ x: x + dx, y: y + dy }, state);
        e.target.setAttrs({ x: origin.x + newPos.x, y: origin.y + newPos.y });
      }}
      onDragEnd={(e) => {
        relocateElement(id, e.target.x() - pos.x, e.target.y() - pos.y);
      }}
      onPointerClick={() => selectIds([id], locked)}
    >
      <Rect width={width} height={height} />
      <Rect
        x={width / 2 - top.width / 2}
        y={0}
        width={top.width}
        height={top.height}
        stroke={colors.yellow}
        fill={colors.yellow}
      />
      <Rect
        x={0}
        y={top.height}
        width={width}
        height={height - top.height}
        stroke={colors.yellow}
        fill={colors.yellow}
        cornerRadius={8}
      />
      <Rect
        x={window.margin}
        y={top.height + window.margin}
        width={window.width}
        height={window.height}
        fill={"white"}
      />
      <Text
        x={window.margin}
        y={top.height + window.margin + window.height / 2 - 24 / 2}
        width={window.width}
        text={text}
        fontFamily="Calibri"
        fontSize={24}
        align="center"
      />
    </Group>
  );
};

export function openMarkerMagnet({ x, y }, state) {
  const sens = 80;
  const lines = Object.values(state.elements).filter((e) => e.type == "number-line");
  for (const line of lines) {
    if (
      numberBetween(x, line.x, line.x + line.width) &&
      numberBetween(y, line.y + line.height / 2 - sens, line.y + line.height / 2 + sens)
    ) {
      return { x, y: line.y + (line.height + nlLineWidth) / 2 + 1 };
    }
  }
  return { x, y };
}

export default Marker;
