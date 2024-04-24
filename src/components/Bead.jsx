import { Circle, Group } from "react-konva";
import { blue } from "./Rekenrek";
import { useAppStore } from "../state/store";

const Bead = (props) => {
  const { showBeadGroups } = useAppStore();
  const { id, beadRadius, x, y, color, onDragMove, onDragEnd, stop, scale } = props;
  const commonProps = {
    x,
    y,
    draggable: !!onDragMove,
    onDragMove,
    onDragEnd,
    scaleX: scale,
    scaleY: scale,
  };
  return (
    <Group id={`${id}`} {...commonProps}>
      <Circle
        fill={blue}
        stroke={blue}
        radius={beadRadius + 2}
        visible={x < stop - 1 && showBeadGroups}
      />
      <Circle
        fill={color.main}
        stroke={color.main}
        radius={beadRadius - 0.9}
      />
      <Circle
        fill={color.highlight}
        stroke={color.highlight}
        radius={beadRadius * 0.2}
        x={-beadRadius * 0.4}
        y={-beadRadius * 0.4}
      />
    </Group>
  );
};

export default Bead;
