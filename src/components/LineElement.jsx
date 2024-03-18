import { Line } from "react-konva";
import { useAppStore } from "../state/store";

const LineElement = (props) => {
  const state = useAppStore();
  const { origin } = state;
  const { id, x, y, x2, y2 } = props;

  return <Line id={id} x={origin.x + x} y={origin.y + y} points={[0, 0, x2, y2]} stroke={"black"} strokeWidth={2} />;
};

export default LineElement;
