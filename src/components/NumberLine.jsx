import { Group, Line, Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { colors } from "../state/colors";
import { useRef } from "react";
import { DenominatorSelector, RangeSelector } from "./RangeSelector";
import Notches from "./Notches";

export const nlWidth = 900;
export const nlHeight = 26;
export const nlLineWidth = 4;
const nlMinWidth = 100;

const NumberLine = (props) => {
  const state = useAppStore();
  const { workspace, origin, relocateElement, updateElement, selectIds, selected, removeElements } = state;
  const { id, x, y, width, height, visible, locked, min, max, denominator } = props;
  const showNotches = workspace != "Open";
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

    const iStep = {
      Integers: 1,
      Decimals: 0.1,
      Fractions: 1 / denominator,
    }[workspace];
    for (let index = 0, i = 0; i < max - min + iStep / 2; i += iStep, index++) {
      notchGroups.push(stage.findOne(`#${id}-notch-${index}`));
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

  const k = mk(state, denominator).k;

  return (
    <Group
      ref={group}
      id={id}
      {...groupPos}
      visible={visible !== undefined ? visible : true}
      draggable={!locked}
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
        draggable={!locked}
        onPointerEnter={(e) => setColor([e.target], colors.blue)}
        onPointerLeave={(e) => setColor([e.target], colors.black)}
        onDragMove={(e) => {
          const dx = Math.min(e.target.x() - 0, width - nlMinWidth);
          e.target.setAttrs({ x: dx, y: height / 2 });
          line.current.setAttrs({ x: linePos.x + dx, points: [0, 0, width - headSize * 2 - dx, 0] });
          getNotchGroups(e).forEach((notchGroup, i) => {
            notchGroup.x(notchX(i, { ...props, width: width - dx, shift: dx }, k));
          });
          removeElements();
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
        draggable={!locked}
        onPointerEnter={(e) => setColor([e.target], colors.blue)}
        onPointerLeave={(e) => setColor([e.target], colors.black)}
        onDragMove={(e) => {
          const dx = Math.max(e.target.x() - width, nlMinWidth - width);
          e.target.setAttrs({ x: width + dx, y: height / 2 });
          line.current.setAttrs({ points: [0, 0, width - headSize * 2 + dx, 0] });
          getNotchGroups(e).forEach((notchGroup, i) => {
            notchGroup.x(notchX(i, { ...props, width: width + dx }, k));
          });
          removeElements();
        }}
        onDragEnd={(e) => {
          const dx = Math.max(e.target.x() - width, nlMinWidth - width);
          e.target.setAttrs({ x: width, y: height / 2 });
          line.current.setAttrs(linePos);
          updateElement(id, { width: width + dx });
        }}
      />
      {showNotches && <Notches {...props} />}
      {showNotches && selected.length == 1 && selected[0] == id && (
        <>
          <RangeSelector {...props} />
          {workspace == "Fractions" && <DenominatorSelector {...props} />}
        </>
      )}
    </Group>
  );
};

export function notchStep(range, workspace = "Integers", denominator = 1) {
  if (workspace == "Decimals" && range > 15 && range <= 20) return 2;
  if (range * denominator < 50) return 1;
  if (range * denominator < 200) return 2;
  if (range * denominator < 1000) return 10;
  if (range * denominator < 1500) return 20;
  return 100;
}

export function notchX(i, { width, height, min, max, shift }, k = 1) {
  const step = (width - 4 * height) / (max - min) / k;
  const start = height * 2 + (shift || 0);
  return start + i * step + width * 0.000001;
}

export function mk(state, denominator = 1) {
  return {
    Integers: { m: 10, k: 1 },
    Decimals: { m: 0.5, k: 10 },
    Open: { m: 1, k: 1 },
    Fractions: { m: 0.5, k: denominator },
  }[state.workspace];
}

export function defaultMinMax(workspace) {
  switch (workspace) {
    case "Integers":
      return { min: 0, max: 20, denominator: 1 };
      break;
    case "Decimals":
      return { min: 0, max: 1, denominator: 1 };
      break;
    case "Fractions":
      return { min: 0, max: 1, denominator: 7 };
      break;
    case "Open":
      return { min: 0, max: 1, denominator: 1 };
      break;
  }
}

export default NumberLine;
