import { Group, Line, Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { colors, config, workspace } from "../config";
import { useRef } from "react";
import { DenominatorSelector, RangeSelector } from "./RangeSelector";
import Notches from "./Notches";
import { pointsIsClose } from "../util";

export const nlWidth = config.tile.size * 22;
export const nlHeight = 26;
export const nlLineWidth = 4;
const nlMinWidth = 100;

const NumberLine = (props) => {
  const state = useAppStore();
  const { origin, relocateElement, updateElement, selectIds, selected } = state;
  let { id, x, y, width, height, visible, locked, min, max, denominator } = props;
  x = Math.round(x);
  y = Math.round(y);
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

    const iStep = 1;
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
      onDragMove={(e) => {
        if (e.target === group.current) {
          const pos = lineMagnet(e.target.x() - origin.x, e.target.y() - origin.y, state);
          if (pos) {
            e.target.setAttrs({ x: origin.x + pos.x, y: origin.y + pos.y });
          }
        }
      }}
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
        }}
        onDragEnd={(e) => {
          const dx = Math.max(e.target.x() - width, nlMinWidth - width);
          e.target.setAttrs({ x: width, y: height / 2 });
          line.current.setAttrs(linePos);
          updateElement(id, { width: width + dx });
        }}
      />
      <Notches {...props} />
    </Group>
  );
};

export function notchStep(range, workspace = "Integers", denominator = 1) {
  return 1;
}

export function notchX(i, { width, height, min, max, shift }, k = 1) {
  const step = Math.floor((width - 4 * height) / (max - min) / k);
  return (1 + i) * step + width * 0.000001;
}

export function mk() {
  return { m: 10, k: 1 };
}

export function zeroPos(state) {
  const size = config.tile.size;
  const { x, y, height } = state.elements.numberLine;
  return { x: Math.round(x + size), y: Math.round(y + height / 2 - size) };
}

export function magnetToLine(tile, state) {
  if (state.workspace != workspace.numberLine) return null;
  const size = config.tile.size;
  const { x, y } = zeroPos(state);
  const { min, max } = state.elements.numberLine;
  for (let i = 0; i < max - min + 1; i++) {
    const topPoint = { x: x + i * size, y };
    const bottomPoint = { x: x + i * size, y: y + size };
    if (pointsIsClose(tile, topPoint, 20)) return topPoint;
    if (pointsIsClose(tile, bottomPoint, 20)) return bottomPoint;
  }
  return null;
}

function lineMagnet(x, y, state) {
  const size = config.tile.size;
  const elements = state.elements;
  const { min, max, height } = elements.numberLine;
  if (state.showGrid) {
    return { x: Math.round(x / size) * size, y: Math.round(y / size) * size - height / 2 };
  }
  const dxStop = (max - min + 2) * size;
  for (const tile of Object.values(elements)) {
    if (tile.type != "tile") continue;
    for (const dy of [height / 2 - size, height / 2]) {
      for (let dx = 0; dx < dxStop; dx += size) {
        if (pointsIsClose(tile, { x: x + dx, y: y + dy }, 20)) return { x: tile.x - dx, y: tile.y - dy };
      }
    }
  }
  return { x, y };
}

export default NumberLine;
