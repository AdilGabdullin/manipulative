import { Text } from "react-konva";
import { useAppStore } from "../state/store";

const TextElement = (props) => {
  const state = useAppStore();
  const { origin } = state;
  const { x, y, text, fontSize } = props;
  return <Text x={origin.x + x} y={origin.y + y} text={text} fontSize={fontSize} fill={"black"} />;
};

export default TextElement;
