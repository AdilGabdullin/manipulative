import { Circle } from "react-konva";
import { useAppStore } from "../state/store";
import { useRef } from "react";
import { getStageXY, setVisibilityFrame } from "../util";

const RotateHandle = ({ x, y }) => {
  const state = useAppStore();
  const { selected, mode, elements } = state;
  const ref = useRef(null);
  if (
    selected.length != 1 ||
    mode != "fractions" ||
    elements[selected[0]].angle == 360 ||
    elements[selected[0]].type != "fraction"
  ) {
    return null;
  }

  const onDragStart = (e) => {
    setVisibilityFrame(e, false);
  };
  const onDragMove = (e) => {
    const stage = e.target.getStage();
    const { x, y } = getStageXY(e.target.getStage(), state);
    const element = selected.length == 1 && elements[selected[0]];
    const rotation = (Math.atan2(y - element.y, x - element.x) / Math.PI) * 180 - element.angle / 2;
    const node = stage.findOne("#" + selected[0]);
    node.setAttrs({ rotation: rotation });
  };
  const onDragEnd = (e) => {
    setVisibilityFrame(e, true);
    const { x, y } = getStageXY(e.target.getStage(), state);
    const element = selected.length == 1 && elements[selected[0]];
    const rotation = (Math.atan2(y - element.y, x - element.x) / Math.PI) * 180 - element.angle / 2;
    ref.current.setAttrs({ x, y });
    state.updateElement(element.id, { rotation });
  };

  return (
    <Circle
      ref={ref}
      name="popup-menu"
      x={x}
      y={y}
      radius={10}
      fill="#2196f3"
      draggable
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    />
  );
};

export default RotateHandle;
