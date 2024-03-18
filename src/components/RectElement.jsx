import { Rect } from "react-konva";
import { useAppStore } from "../state/store";

const RectElement = (props) => {
  const state = useAppStore();
  const { origin } = state;
  const { id, x, y, width, height } = props;
  return <Rect id={id} x={origin.x + x} y={origin.y + y} width={width} height={height} stroke={"black"} />;
};

export default RectElement;
