import { Rect } from "react-konva";
import { useAppStore } from "../state/store";

const RectElement = (props) => {
  const state = useAppStore();
  const { origin, elements, fdMode } = state;
  const { id, x, y, width, height, fill } = props;

  const onPointerClick = (e) => {
    if (fdMode) return;
    state.selectIds([id], elements[id].locked);
  };

  return (
    <Rect
      id={id}
      x={origin.x + x}
      y={origin.y + y}
      width={width}
      height={height}
      stroke={"black"}
      fill={fill ? "#56d2f5" : null}
      onPointerClick={onPointerClick}
    />
  );
};

export default RectElement;
