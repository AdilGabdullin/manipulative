import { Line } from "react-konva";
import { useAppStore } from "../state/store";

const LineElement = (props) => {
  const state = useAppStore();
  const { origin } = state;
  const { id } = props;
  const points = [...props.points];
  for (let i = 0; i < points.length; i += 1) {
    if (i % 2 == 0) {
      points[i] += origin.x;
    } else {
      points[i] += origin.y;
    }
  }

  return <Line id={id} points={points} stroke={"black"} strokeWidth={2} />;
};

export default LineElement;
