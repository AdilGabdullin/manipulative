import { Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { beadNumber, beadRadius, colors, initialBeads, rekenrekHeight, rekenrekWidth } from "./Rekenrek";
import Bead from "./Bead";
import { leftToolbarWidth } from "./LeftToolbar";
import { useEffect } from "react";

const LeftToolbarRekenreks = () => {
  const state = useAppStore();

  const left = 10;
  const scale = (leftToolbarWidth - left * 2) / 20 / beadRadius;
  const d = beadRadius * 2 * scale;
  const top = (state.height - d * 13) / 4;

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
  const r = beadRadius * scale;
  const propss = [];
  for (let i = 0; i < rows; i += 1) {
    propss.push({
      y: y + 2 * r * i,
      swapColors: i > 4,
    });
  }

  return (
    <>
      {propss.map(({ y, swapColors }, i) => (
        <BeadRow id={id + i} key={i} x={x} y={y} scale={scale} swapColors={swapColors} />
      ))}
      <Rect x={x} y={y} width={20 * r} height={2 * rows * r} stroke={"black"} />
    </>
  );
};

const BeadRow = ({ id, x, y, scale, swapColors }) => {
  const propss = [];
  const r = beadRadius * scale;
  for (let i = 0; i < beadNumber; i += 1) {
    propss.push({
      x: x + 2 * r * i + r,
      color: (i < 5 && !swapColors) || (!(i < 5) && swapColors) ? colors.red : colors.white,
    });
  }
  return (
    <>
      {propss.map(({ x, color }, i) => (
        <Bead id={id + i} key={i} x={x} y={y + r} scale={scale} color={color} />
      ))}
    </>
  );
};
export default LeftToolbarRekenreks;
