import { Circle, Group, Line, Path, Rect, Text } from "react-konva";
import { colors } from "../state/colors";
import { useAppStore } from "../state/store";
import { cos, numberBetween, sin } from "../util";
import { mk, notchStep } from "./NumberLine";

export const mWidth = 70;
export const mHeight = 100;

const Marker = (props) => {
  const { id, x, y, width, height, visible, locked, text, lineHeight } = props;
  const state = useAppStore();
  const { origin, selectIds, updateElement, workspace } = state;

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
      draggable={!locked}
      onDragMove={(e) => {
        const dx = e.target.x() - pos.x;
        const dy = e.target.y() - pos.y;
        const newProps = markerMagnet({ ...props, x: x + dx, y: y + dy }, state);
        e.target.setAttrs({ x: origin.x + newProps.x, y: origin.y + newProps.y });
        e.target.children[3].setAttrs({
          text: newProps.text,
          visible: newProps.text !== "",
        });
        e.target.children[4].setAttrs({
          height: newProps.lineHeight,
          visible: !!newProps.lineHeight,
        });
      }}
      onDragEnd={(e) => {
        const dx = e.target.x() - pos.x;
        const dy = e.target.y() - pos.y;
        const newProps = markerMagnet({ ...props, x: x + dx, y: y + dy }, state);
        updateElement(id, newProps);
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
        x={0}
        y={cy - 28 / 2}
        width={width}
        text={workspace == "Dicimals" ? text.toFixed(1) : text}
        fill={colors.purple}
        fontFamily="Calibri"
        fontSize={28}
        align="center"
      />
      <Rect visible={!!lineHeight} x={cx - 1} y={height} width={2} height={lineHeight || 0} fill={colors.purple} />
    </Group>
  );
};

export function markerMagnet(props, state) {
  const { x, y, width, height } = props;
  const sens = 200;
  const lines = Object.values(state.elements).filter((e) => e.type == "number-line");
  for (const line of lines) {
    const { k } = mk(state, line.denominator || 1);
    if (
      numberBetween(x + width / 2, line.x + line.height * 2, line.x - line.height * 2 + line.width) &&
      numberBetween(y + height - line.height / 2, line.y - sens, line.y)
    ) {
      const firstNotch = line.x + line.height * 2;
      const range = line.max - line.min;
      const step = (((line.width - line.height * 4) / range) * notchStep(range)) / k;
      const text = (Math.round((x + width / 2 - firstNotch) / step) * notchStep(range)) / 10;
      const newX = firstNotch - width / 2 + Math.round((x + width / 2 - firstNotch) / step) * step;
      return { ...props, x: newX, y, lineHeight: line.y + line.height / 2 - y - height, text };
    }
  }
  return { ...props, lineHeight: 0, text: "" };
}

export default Marker;
