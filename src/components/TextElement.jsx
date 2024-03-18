import { Text } from "react-konva";
import { useAppStore } from "../state/store";

const TextElement = (props) => {
  const state = useAppStore();
  const { origin, elements, fdMode } = state;
  const { id, x, y, text, fontSize, locked } = props;

  const onPointerClick = (e) => {
    if (fdMode) return;
    state.selectIds([id], locked);
  };

  const onDragStart = (e) => {
    state.clearSelect();
  };

  const onDragMove = (e) => {};

  const onDragEnd = (e) => {
    let dx = e.target.x() - x - origin.x;
    let dy = e.target.y() - y - origin.y;
    state.relocateElement(id, dx, dy);
  };

  return (
    <Text
      id={id}
      x={origin.x + x}
      y={origin.y + y}
      text={text}
      fontSize={fontSize}
      fill={"black"}
      onPointerClick={onPointerClick}
      draggable={!locked && !fdMode}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    />
  );
};

export default TextElement;
