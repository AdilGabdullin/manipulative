import { Group, Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { colors, rekenrekHeight, rekenrekWidth, strokeWidth1 } from "./Rekenrek";
import Bead from "./Bead";
import { menuHeight } from "./Menu";
import { useRef } from "react";
import { getStageXY } from "../util";

export const leftToolbarWidth = 180;

const LeftToolbarRekenreks = () => {
  const state = useAppStore();
  const beadRadius = 20;

  const left = 10;
  const scale = (leftToolbarWidth - left * 2) / 200;
  const d = beadRadius * 2 * scale;
  const top = (state.height - (d * 13) / 2) / 4;

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={state.height} />
      <BeadRect id={0} x={left} y={top} rows={1} scale={scale} />
      <BeadRect id={1} x={left} y={top * 2 + 1 * d} rows={2} scale={scale} />
      <BeadRect id={2} x={left} y={top * 3 + 2 * d} rows={10} scale={scale} />
    </>
  );
};

const BeadRect = ({ id, x, y, rows, scale }) => {
  const state = useAppStore();
  const beadRadius = 20;
  const r = beadRadius * scale;
  const propss = [];
  for (let i = 0; i < rows; i += 1) {
    propss.push({
      y: y + r * i,
      swapColors: i > 4,
    });
  }

  const groupRef = useRef(null);
  const rectRef = useRef(null);

  const initialBeads = (x) => {
    const beadRadius = 200 / state.beadNumber;
    const xMax = x + rekenrekWidth - beadRadius - strokeWidth1;
    const result = [];
    for (let i = 1 - state.beadNumber; i <= 0; i += 1) {
      result.push(xMax + i * beadRadius * 2);
    }
    return result;
  };

  const place = (x, y) => {
    const toAdd = [];
    for (let i = 0; i < rows; i += 1) {
      toAdd.push({
        type: "rekenrek",
        x,
        y: y + (rekenrekHeight - 4) * i,
        width: rekenrekWidth,
        height: rekenrekHeight,
        beads: initialBeads(x),
        swap: i < 5,
      });
    }
    state.addElements(toAdd);
  };

  const onPointerClick = () => {
    let x, y;
    const { elements, lastActiveElement, offset, scale, height } = state;
    const el = elements[lastActiveElement];
    if (el) {
      x = el.x;
      y = el.y + rekenrekHeight - 4;
    } else {
      x = -rekenrekWidth / 2 + offset.x;
      y = (-height / 2 + menuHeight + 20) / scale + offset.y;
    }
    place(x, y);
  };

  const onDragMove = (e) => {
    const group = groupRef.current;
    const dx = e.target.x() - x;
    const dy = e.target.y() - y;
    group.setAttrs({
      x: dx,
      y: dy,
      scaleX: 1.0,
      scaleY: 1.0,
    });
  };

  const onDragEnd = (e) => {
    const stage = e.target.getStage();
    groupRef.current.setAttrs({ x: 0, y: 0 });
    rectRef.current.setAttrs({ x, y });
    const pos = getStageXY(stage, state);
    place(pos.x - rekenrekWidth / 2, pos.y - (rekenrekHeight * rows) / 2);
  };

  return (
    <>
      {propss.map(({ y, swapColors }, i) => (
        <BeadRow id={id + i} key={i} x={x} y={y} scale={scale} swapColors={swapColors} />
      ))}
      <Group ref={groupRef}>
        {propss.map(({ y, swapColors }, i) => (
          <BeadRow id={"shadow" + id + i} key={i} x={x} y={y} scale={scale} swapColors={swapColors} />
        ))}
      </Group>
      <Rect
        ref={rectRef}
        x={x}
        y={y}
        width={10 * r}
        height={rows * r}
        draggable
        onPointerClick={onPointerClick}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      />
    </>
  );
};

const BeadRow = ({ id, x, y, scale, swapColors }) => {
  const beadRadius = 10;
  const propss = [];
  const r = beadRadius * scale;
  for (let i = 0; i < 10; i += 1) {
    propss.push({
      x: x + 2 * r * i + r,
      color: (i < 5 && !swapColors) || (!(i < 5) && swapColors) ? colors.red : colors.white,
    });
  }
  return (
    <>
      {propss.map(({ x, color }, i) => (
        <Bead beadRadius={10} id={id + i} key={i} x={x} y={y + r} scale={scale} color={color} />
      ))}
    </>
  );
};

export default LeftToolbarRekenreks;
