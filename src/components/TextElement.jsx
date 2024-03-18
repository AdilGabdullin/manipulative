import { Text } from "react-konva";
import { useAppStore } from "../state/store";

const TextElement = (props) => {
  const state = useAppStore();
  const { origin, elements, fdMode } = state;
  const { id, x, y, text, fontSize } = props;

  const onPointerClick = (e) => {
    if (fdMode) return;
    state.selectIds([id], elements[id].locked);
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
    />
  );
};

export default TextElement;
