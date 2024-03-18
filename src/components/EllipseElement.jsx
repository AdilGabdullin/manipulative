import { Ellipse } from "react-konva";
import { useAppStore } from "../state/store";

const EllipseElement = (props) => {
  const state = useAppStore();
  const { origin } = state;
  const { id, x, y, radiusX, radiusY } = props;
  return <Ellipse id={id} x={origin.x + x} y={origin.y + y} radiusX={radiusX} radiusY={radiusY} stroke={"black"} />;
};

export default EllipseElement;
