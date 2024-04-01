import { Group, Rect } from "react-konva";
import { colors } from "../../state/colors";

const OpenMarker = ({ x, y, width, height, draggable }) => {
  const top = {
    width: width / 20,
    height: width * 0.4,
  };
  const window = {
    width: width * 0.8,
    height: width * 0.8,
    margin: width * 0.1,
  };
  const onDragMove = (e) => {
    const target = e.target;
    const stage = target.getStage();
    const {x,y} = stage.getPointerPosition();
  };

  const onDragEnd = (e) => {

  };

  return (
    <Group x={x} y={y} draggable={draggable} onDragMove={onDragMove} onDragEnd={onDragEnd}>
      {draggable && <Rect width={width} height={height} />}
      <Rect
        x={width / 2 - top.width / 2}
        y={0}
        width={top.width}
        height={top.height}
        stroke={colors.yellow}
        fill={colors.yellow}
      />
      <Rect
        x={0}
        y={top.height}
        width={width}
        height={height - top.height}
        stroke={colors.yellow}
        fill={colors.yellow}
        cornerRadius={8}
      />
      <Rect
        x={window.margin}
        y={top.height + window.margin}
        width={window.width}
        height={window.height}
        fill={"white"}
      />
    </Group>
  );
};

export default OpenMarker;
