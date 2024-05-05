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
        const target = e.target;
        const children = target.children;
        const dx = target.x() - pos.x;
        const dy = target.y() - pos.y;
        const newProps = markerMagnet({ ...props, x: x + dx, y: y + dy }, state);
        target.setAttrs({ x: origin.x + newProps.x, y: origin.y + newProps.y });
        if (workspace == "Fractions") {
          const { number, wholePart, nominator, denominator, width } = newProps.text;
          children[3].setAttrs({ text: number });
          children[5].setAttrs({ text: nominator && Math.abs(nominator) });
          children[6].setAttrs({ text: denominator });
          children[7].setAttrs({ text: wholePart });
          children[8].setAttrs({ visible: true, points: [-(width || 0) * 0.6, 0, (width || 0) * 0.6, 0] });
        } else {
          children[3].setAttrs({
            text: newProps.text.number,
            visible: newProps.text !== "",
          });
        }
        children[4].setAttrs({
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
      <Circle x={cx} y={cy} radius={r2} fill={colors.yellow} />
      <Circle x={cx} y={cy} radius={r1} fill={colors.white} />
      <Path
        stroke={colors.yellow}
        fill={colors.yellow}
        data={`
            M ${cx - dx} ${cy + dy}
            A ${r2} ${r2} 0 0 0 ${cx + dx} ${cy + dy}
            L ${cx} ${height}
            L ${cx - dx} ${cy + dy}
          `}
      />
      <Text
        x={-width}
        y={cy - 28 / 2}
        width={width * 3}
        text={text.number}
        fill={colors.black}
        fontFamily="Calibri"
        fontSize={28}
        align="center"
      />
      <Rect visible={!!lineHeight} x={cx - 1} y={height} width={2} height={lineHeight || 0} fill={colors.yellow} />
      <Text
        x={-width}
        y={cy - 20}
        width={width * 3}
        text={text.nominator}
        fill={colors.black}
        fontFamily="Calibri"
        fontSize={20}
        align="center"
        visible={workspace == "Fractions"}
      />
      <Text
        x={-width}
        y={cy + 4}
        width={width * 3}
        text={text.denominator}
        fill={colors.black}
        fontFamily="Calibri"
        fontSize={20}
        align="center"
        visible={workspace == "Fractions"}
      />
      <Text
        x={-width * 2 + 50}
        y={cy - 10}
        width={width * 3}
        text={text.wholePart}
        fill={colors.black}
        fontFamily="Calibri"
        fontSize={20}
        align="center"
        visible={workspace == "Fractions" && text.wholePart != 0}
      />
      <Line
        x={cx}
        y={cy}
        points={[-(text.width || 0) * 0.6, 0, (text.width || 0) * 0.6, 0]}
        stroke={colors.black}
        strokeWidth={2}
        visible={workspace == "Fractions"}
      />
      {/* <Line
        ref={lineRef2}
        x={round(-textWidth * 0.6 + (denominator == 1 ? 5 : 0) + (wholePart != 0 ? -textWidth * 0.3 : 0))}
        y={round(height * 1.25 + 19)}
        points={[-10, 0, -5, 0]}
        stroke={colors.black}
        strokeWidth={2}
        visible={textVisible && minus}
      /> */}
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
      const x0 = firstNotch - width / 2;
      let step = (((line.width - line.height * 4) / range) * notchStep(range)) / k;
      let text = (line.min * k + Math.round((x - x0) / step) * notchStep(range)) / k;
      if (state.workspace == "Integers") {
        text = { number: line.min + Math.round((((x - x0) / step) * notchStep(range)) / k) };
        step = (line.width - line.height * 4) / range / k;
      } else if (state.workspace == "Fractions") {
        if (Math.round(text * k) == 0) {
          text = { number: 0 };
        } else if (Math.round(text * k) / k == Math.round(text)) {
          text = { number: Math.round(text) };
        } else {
          text = {
            nominator: Math.abs(Math.round(text * k)),
            wholePart: 0,
            denominator: k,
            negative: Math.round(text * k) < 0,
          };
          if (state.mixedNumbers) {
            text.wholePart = Math.floor(Math.abs(text.nominator / text.denominator));
            text.nominator = text.nominator % text.denominator;
          }
          text.width = Math.max(text.nominator.toString().length * 12, text.denominator.toString().length * 12);
        }
      } else {
        text = { number: text };
      }
      const newX = x0 + Math.round((x - x0) / step) * step;
      return { ...props, x: newX, y, lineHeight: line.y + line.height / 2 - y - height, text };
    }
  }
  return { ...props, lineHeight: 0, text: "" };
}

export default Marker;
