import { Circle, Group, Path, Rect, Text } from "react-konva";
import { colors } from "../state/colors";
import { useAppStore } from "../state/store";
import { cos, numberBetween, sin } from "../util";
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

  const angle = 60;
  const r1 = width / 2 - 5;
  const r2 = width / 2;
  const cx = width / 2;
  const cy = r2;
  const dx = r2 * cos(angle);
  const dy = r2 * sin(angle);

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
      <Circle x={cx} y={cy} radius={r2} fill={colors.purple} />
      <Circle x={cx} y={cy} radius={r1} fill={colors.white} />
      <Path
        stroke={colors.purple}
        fill={colors.purple}
        data={`
            M ${cx - dx} ${cy + dy}
            A ${r2} ${r2} 0 0 0 ${cx + dx} ${cy + dy}
            L ${cx} ${height}
            L ${cx - dx} ${cy + dy}
          `}
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
