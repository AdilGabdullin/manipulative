import { Arc, Circle } from "react-konva";
import { gridStep, useAppStore } from "../state/store";
import { fractionMagnet, getStageXY, setVisibility } from "../util";
import FractionLabel from "./FractionLabel";

const Fraction = (props) => {
  const { id, x, y, angle, rotation, fill, fillColor, stroke, locked } = props;
  const state = useAppStore();
  const { origin, fdMode, elements } = state;

  const onDragStart = (e) => {
    state.clearSelect();
    setVisibility(e, false);
  };

  const onDragMove = (e) => {
    const node = e.target;
    let { x, y } = getStageXY(e.target.getStage(), state);
    let magnet = null;
    for (const id in state.elements) {
      const el = state.elements[id];
      if (el.id == node.id()) continue;
      magnet = fractionMagnet({ x, y }, el, angle, origin) || magnet;
    }
    e.target.setAttrs(magnet || { x: node.x(), y: node.y(), rotation });
  };
  const onDragEnd = (e) => {
    const node = e.target;
    setVisibility(e, true);
    state.updateElement(id, {
      x: node.x() - origin.x,
      y: node.y() - origin.y,
      rotation: node.rotation(),
    });
  };

  const onPointerClick = (e) => {
    if (fdMode) return;
    state.selectIds([id], elements[id].locked);
  };

  return angle < 360 ? (
    <>
      <Arc
        id={id}
        x={origin.x + x}
        y={origin.y + y}
        innerRadius={0}
        outerRadius={gridStep * 2}
        angle={angle}
        rotation={rotation}
        fill={fill ? fillColor : null}
        stroke={stroke}
        strokeWidth={2}
        draggable={!locked && !fdMode}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onPointerClick={onPointerClick}
        lineJoin="round"
        lineCap="round"
      />
      <FractionLabel {...props} onPointerClick={onPointerClick} fill={fill}/>
    </>
  ) : (
    <>
      <Circle
        id={id}
        x={origin.x + x}
        y={origin.y + y}
        radius={gridStep * 2}
        fill={fill ? fillColor : null}
        stroke={stroke}
        strokeWidth={2}
        draggable={!locked && !fdMode}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onPointerClick={onPointerClick}
      />
      <FractionLabel {...props} onPointerClick={onPointerClick} />
    </>
  );
};

export default Fraction;
