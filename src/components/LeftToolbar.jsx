import { Circle, Group, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { fontSize, format, magnet, radius } from "./Disk";
import { Fragment } from "react";
import { darkenColor, fromStageXY, toStageXY } from "../util";
import { getValueRects } from "./PlaceValue";

export const leftToolbarWidth = 180;

export const allOptions = {
  1_000_000: { value: 1_000_000, color: darkenColor("#c2185b"), text: "Millions" },
  100_000: { value: 100_000, color: darkenColor("#afb42b"), text: "Hundred\nThousands" },
  10_000: { value: 10_000, color: darkenColor("#3f51b5"), text: "Ten\nThousands" },
  1000: { value: 1000, color: darkenColor("#9c27b0"), text: "Thousands" },
  100: { value: 100, color: darkenColor("#8bc34a"), text: "Hundreds" },
  10: { value: 10, color: darkenColor("#e91e63"), text: "Tens" },
  1: { value: 1, color: darkenColor("#2196f3"), text: "Ones" },
  0.1: { value: 0.1, color: darkenColor("#795548"), text: "Tenths" },
  0.01: { value: 0.01, color: darkenColor("#009688"), text: "Hundredths" },
  0.001: { value: 0.001, color: darkenColor("#ffa000"), text: "Thousandths" },
};

export function getColor(value) {
  return allOptions[value]?.color;
}

const LeftToolbar = () => {
  const state = useAppStore();
  const { workspace, origin, offset, scale, addElement, height, lastActiveElement, elements, minValue, maxValue } =
    state;
  const options = Object.values(allOptions)
    .toSorted((a, b) => b.value - a.value)
    .filter(({ value }) => value >= minValue && value <= maxValue);

  const optionPairs = options.reduce((pairs, option) => {
    const lastIndex = pairs.length - 1;
    const last = pairs[lastIndex] || [];
    if (last.length == 2 || (last.length == 1 && options.length % 2 == 1 && pairs.length == 1)) {
      return [...pairs, [option]];
    } else {
      return pairs.toSpliced(lastIndex, 1, [...last, option]);
    }
  }, []);
  const top = (height - radius * 2 * optionPairs.length) / (optionPairs.length + 1);
  const left1 = (leftToolbarWidth - 2 * radius) / 2;
  const left2 = (leftToolbarWidth - 4 * radius) / 3;

  const onDragMove = (e) => {
    const s = e.target.x() > leftToolbarWidth ? scale : 1.0;
    const targetPos = { x: e.target.x(), y: e.target.y() };
    const pos = magnet(null, toStageXY(targetPos, state), elements);
    e.target.setAttrs({ scaleX: s, scaleY: s, ...(pos ? fromStageXY(pos, state) : {}) });
  };

  const onDragEnd = (value, color, pos) => (e) => {
    const element = {
      type: "disk",
      x: e.target.x() / scale + offset.x - origin.x,
      y: e.target.y() / scale + offset.y - origin.y,
      color,
      value,
    };
    e.target.setAttrs({ ...pos, scaleX: 1.0, scaleY: 1.0 });
    addElement(element);
  };

  const onPointerClick = (value, color) => (e) => {
    let pos;

    if (["Place Value", "Subtraction"].includes(workspace)) {
      const exist = Object.values(elements).filter((e) => e.value == value).length;
      if (exist >= 10) return;
      const { x, y, width } = getValueRects(state)[value];
      const left = (width - radius * 4) / 2;
      pos = {
        x: x + left + (1 + (exist % 2) * 2) * radius,
        y: y + left * state.fullscreen + (1 + Math.floor(exist / 2) * 2) * radius,
      };
    } else {
      const last = elements[lastActiveElement];
      pos = last ? { x: last.x + radius * 2, y: last.y } : { x: 0, y: 0 };
    }

    addElement({
      type: "disk",
      color,
      value,
      ...pos,
    });
  };

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={height} />
      {optionPairs.map(([option1, option2], i) => {
        const left = option2 ? left2 : left1;
        const x = left + radius;
        const x2 = x + left + radius * 2;
        const y = top + i * (top + radius * 2) + radius;
        const value1 = option1?.value;
        const value2 = option2?.value;
        const color1 = option1?.color;
        const color2 = option2?.color;

        return (
          <Fragment key={i}>
            <Disk value={value1} x={x} y={y} color={color1} />
            <Group
              x={x}
              y={y}
              draggable
              onDragMove={onDragMove}
              onDragEnd={onDragEnd(value1, color1, { x, y })}
              onPointerClick={onPointerClick(value1, color1)}
            >
              <Disk value={value1} x={0} y={0} color={color1} />
            </Group>

            {option2 && <Disk value={value2} x={x2} y={y} color={color2} />}
            {option2 && (
              <Group
                x={x2}
                y={y}
                draggable
                onDragMove={onDragMove}
                onDragEnd={onDragEnd(value2, color2, { x: x2, y })}
                onPointerClick={onPointerClick(value2, color2)}
              >
                <Disk value={value2} x={0} y={0} color={color2} />
              </Group>
            )}
          </Fragment>
        );
      })}
    </>
  );
};

const Disk = ({ value, x, y, color }) => {
  return (
    <>
      <Circle x={x} y={y} fill={color} radius={radius} />
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
      />
    </>
  );
};

export default LeftToolbar;
