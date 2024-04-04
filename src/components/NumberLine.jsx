import { Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { colors } from "../state/colors";
import { Fragment, useRef } from "react";

export const nlWidth = 900;
export const nlHeight = 26;
export const nlLineWidth = 5;
const nlMinWidth = 100;

const NumberLine = (props) => {
  const { origin, relocateElement, updateElement, selectIds } = useAppStore();
  const { id, x, y, width, height, visible, locked, haveNotches, min, max } = props;
  const headSize = height / 2;
  const groupPos = { x: origin.x + x, y: origin.y + y };
  const rectPos = { x: headSize, y: 0 };
  const linePos = { x: headSize, y: height / 2 };

  const group = useRef();
  const line = useRef();
  const leftHead = useRef();
  const rightHead = useRef();

  let notchGroups = null;
  const getNotchGroups = (e) => {
    if (notchGroups) return notchGroups;
    notchGroups = [];
    const stage = e.target.getStage();
    for (let i = 0; i < max - min + 1; i += 1) {
      notchGroups.push(stage.findOne(`#${id}-notch-${i}`));
    }
    return notchGroups;
  };

  const setColor = (targets, color) => {
    for (const target of targets) {
      target.setAttrs({
        stroke: color,
        fill: color,
      });
    }
  };

  return (
    <Group
      ref={group}
      id={id}
      {...groupPos}
      visible={visible !== undefined ? visible : true}
      draggable
      onDragEnd={(e) => {
        if (e.target === group.current) {
          relocateElement(id, e.target.x() - groupPos.x, e.target.y() - groupPos.y);
        }
      }}
      onPointerClick={() => selectIds([id], locked)}
    >
      <Line
        ref={line}
        {...linePos}
        points={[0, 0, width - headSize * 2, 0]}
        strokeWidth={nlLineWidth}
        stroke={"black"}
      />
      <Rect
        {...rectPos}
        width={width - 2 * headSize}
        height={height}
        onPointerEnter={(e) => {
          const notches = e.target.getStage().find(`.${id}-notch`);
          setColor([...notches, line.current, leftHead.current, rightHead.current], colors.blue);
        }}
        onPointerLeave={(e) => {
          const notches = e.target.getStage().find(`.${id}-notch`);
          setColor([...notches, line.current, leftHead.current, rightHead.current], colors.black);
        }}
      />
      <Line
        ref={leftHead}
        x={0}
        y={height / 2}
        points={[0, 0, headSize, headSize, headSize, -headSize, 0, 0]}
        stroke={"black"}
        fill="black"
        closed
        draggable
        onPointerEnter={(e) => setColor([e.target], colors.blue)}
        onPointerLeave={(e) => setColor([e.target], colors.black)}
        onDragMove={(e) => {
          const dx = Math.min(e.target.x() - 0, width - nlMinWidth);
          e.target.setAttrs({ x: dx, y: height / 2 });
          line.current.setAttrs({ x: linePos.x + dx, points: [0, 0, width - headSize * 2 - dx, 0] });
          getNotchGroups(e).forEach((notchGroup, i) => {
            notchGroup.x(notchX(i, { ...props, width: width - dx, shift: dx }));
          });
        }}
        onDragEnd={(e) => {
          const dx = Math.min(e.target.x() - 0, width - nlMinWidth);
          e.target.setAttrs({ x: 0, y: height / 2 });
          line.current.setAttrs(linePos);
          updateElement(id, { x: x + dx, width: width - dx });
        }}
      />
      <Line
        ref={rightHead}
        x={width}
        y={height / 2}
        points={[0, 0, -headSize, -headSize, -headSize, headSize, 0, 0]}
        stroke={"black"}
        fill="black"
        closed
        draggable
        onPointerEnter={(e) => setColor([e.target], colors.blue)}
        onPointerLeave={(e) => setColor([e.target], colors.black)}
        onDragMove={(e) => {
          const dx = Math.max(e.target.x() - width, nlMinWidth - width);
          e.target.setAttrs({ x: width + dx, y: height / 2 });
          line.current.setAttrs({ points: [0, 0, width - headSize * 2 + dx, 0] });
          getNotchGroups(e).forEach((notchGroup, i) => {
            notchGroup.x(notchX(i, { ...props, width: width + dx }));
          });
        }}
        onDragEnd={(e) => {
          const dx = Math.max(e.target.x() - width, nlMinWidth - width);
          e.target.setAttrs({ x: width, y: height / 2 });
          line.current.setAttrs(linePos);
          updateElement(id, { width: width + dx });
        }}
      />
      {haveNotches && <Notches {...{ id, width, height, min, max }} />}
    </Group>
  );
};

const Notches = (props) => {
  const { id, height, min, max } = props;
  const xs = [];
  for (let i = 0; i < max - min + 1; i += 1) {
    xs.push({ x: notchX(i, props), text: min + i });
  }

  return xs.map(({ x, text }, i) => (
    <Group key={i} x={x} id={`${id}-notch-${i}`}>
      <Line
        name={`${id}-notch`}
        x={0}
        y={height / 4}
        points={[0, 0, 0, height / 2]}
        strokeWidth={nlLineWidth / 2}
        stroke={"black"}
        fill="black"
        lineCap="round"
      />
      <Text
        text={text}
        x={-50}
        y={height * 1.25}
        width={100}
        align="center"
        stroke={"black"}
        fill="black"
        fontFamily="Calibri"
        fontStyle="200"
        fontSize={20}
      />
    </Group>
  ));
};

function notchX(i, { width, height, min, max, shift }) {
  const step = (width - 4 * height) / (max - min);
  const start = height * 2 + (shift || 0);
  return start + i * step + width / 100000;
}

export default NumberLine;
