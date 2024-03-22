import { Circle } from "react-konva";
import { useAppStore } from "../state/store";
import { useRef } from "react";
import { atan2, getStageXY, rotateVector, setVisibilityFrame } from "../util";
import { unflattenPoints } from "./Pattern";

const RotateHandle = (props) => {
  const state = useAppStore();
  const { selected, elements } = state;
  const { x, y } = props;
  const ref = useRef(null);

  if (selected.length != 1) return null;
  const element = selected.length == 1 && elements[selected[0]];
  const angle = element?.angle;
  const type = element?.type;
  if (!(angle != 360 && type == "fraction") && !(type == "pattern")) {
    return null;
  }

  let target = null;
  const getTarget = (e) => {
    return target || (target = e.target.getStage().findOne("#" + selected[0]));
  };

  const getRotation = (e) => {
    const { x, y } = getStageXY(e.target.getStage(), state);
    switch (element.type) {
      case "fraction":
        return atan2(y - element.y, x - element.x) - element.angle / 2;
        break;
      case "pattern":
        return atan2(y - element.y - element.height / 2, x - element.x - element.width / 2) - 90;
        break;
    }
  };

  const onDragStart = (e) => {
    setVisibilityFrame(e, false);
  };

  const onDragMove = (e) => {
    switch (element.type) {
      case "fraction":
        getTarget(e).setAttrs({ rotation: getRotation(e) });
        break;
      case "pattern":
        rotatePattern(getTarget(e), element, getRotation(e));
        break;
    }
  };

  const onDragEnd = (e) => {
    setVisibilityFrame(e, true);
    ref.current.setAttrs(props);
    switch (element.type) {
      case "fraction":
        state.updateElement(element.id, { rotation: getRotation(e) });
        break;
      case "pattern":
        state.rotatePattern(element.id, getRotation(e));
        break;
    }
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

function rotatePattern(target, element, rotation) {
  const { width, height } = element;
  const cx = width / 2;
  const cy = height / 2;
  const points = [];
  unflattenPoints(element.points, -cx, -cy)
    .map((v) => rotateVector(v, rotation - ((rotation + 360) % 15)))
    .forEach((v) => {
      points.push(v.x + cx);
      points.push(v.y + cy);
    });
  target.setAttr("points", points);
}

export default RotateHandle;
