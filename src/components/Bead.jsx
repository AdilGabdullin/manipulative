import { Circle, Path } from "react-konva";
import { cos, sin } from "../util";
import { beadRadius, blue } from "./Rekenrek";

const Bead = (props) => {
  const { id, x, y, color, onDragStart, onDragMove, onDragEnd, stop, scale } = props;
  const d = (beadRadius / Math.SQRT2) * 2;
  const r1 = beadRadius;
  const r2 = beadRadius * 1.15;
  const r3 = beadRadius * 0.6;
  const r4 = beadRadius * 0.4;
  const r5 = (r3 - r4) / 2;
  const commonProps = {
    x,
    y,
    draggable: !!onDragMove,
    onDragStart,
    onDragMove,
    onDragEnd,
    scaleX: scale,
    scaleY: scale,
  };
  return (
    <>
      <Circle
        id={`${id}-0`}
        fill={blue}
        stroke={blue}
        radius={beadRadius + 2}
        visible={x < stop}
        {...commonProps}
      />
      <Circle
        id={`${id}-1`}
        fill={color.main}
        stroke={color.shadow}
        radius={beadRadius - 0.9}
        scaleX={scale}
        scaleY={scale}
        {...commonProps}
      />
      <Path
        id={`${id}-2`}
        fill={color.shadow}
        data={`
          m ${-d / 2} ${-d / 2}
          a ${r1} ${r1} 0 0 0 ${d} ${d}
          a ${r2} ${r1} ${45} 0 1 ${-d} ${-d}
        `}
        scaleX={scale}
        scaleY={scale}
        {...commonProps}
      />
      <Path
        id={`${id}-3`}
        fill={color.highlight}
        data={`
          m ${0} ${-r3}
          a ${r3} ${r3} 0 0 1 ${r3 * cos(30)} ${r3 * sin(30)}
          a ${r5} ${r5} 0 0 1 ${-r5} ${r5}
          A ${r4} ${r4} 0 0 0 ${0} ${-r4 * 1.2}
          A ${r5} ${r5} 0 0 1 ${0} ${-r3}
        `}
        {...commonProps}
      />
    </>
  );
};

export default Bead;
