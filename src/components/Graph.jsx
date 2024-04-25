import { Rect } from "react-konva";
import { useAppStore } from "../state/store";

const Graph = ({ x, y, width, height }) => {
  const { origin } = useAppStore();
  return <Rect x={origin.x + x} y={origin.y + y} width={width} height={height} stroke={"black"} />;
};

export default Graph;
