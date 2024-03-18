import { Ellipse } from "react-konva";
import { useAppStore } from "../state/store";

const EllipseElement = (props) => {
  const state = useAppStore();
  const { origin, elements, fdMode } = state;
  const { id, x, y, radiusX, radiusY, fill } = props;

  const onPointerClick = (e) => {
    if (fdMode) return;
    state.selectIds([id], elements[id].locked);
  };

  return (
    <Ellipse
      id={id}
      x={origin.x + x}
      y={origin.y + y}
      radiusX={radiusX}
      radiusY={radiusY}
      stroke={"black"}
      fill={fill ? "#56d2f5" : null}
      onPointerClick={onPointerClick}
    />
  );
};

export default EllipseElement;
