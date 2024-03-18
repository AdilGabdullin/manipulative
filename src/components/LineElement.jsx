import { Line } from "react-konva";
import { useAppStore } from "../state/store";

const LineElement = (props) => {
  const state = useAppStore();
  const { origin, elements, fdMode } = state;
  const { id, x, y, x2, y2, fill } = props;

  const onPointerClick = (e) => {
    if (fdMode) return;
    state.selectIds([id], elements[id].locked);
  };

  return (
    <Line
      id={id}
      x={origin.x + x}
      y={origin.y + y}
      points={[0, 0, x2, y2]}
      stroke={"black"}
      strokeWidth={2}
      fill={fill ? "#56d2f5" : null}
      onPointerClick={onPointerClick}
    />
  );
};

export default LineElement;
