import { Circle, Group, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { colors } from "../config";
import { useRef } from "react";

const RangeSelector = (props) => {
  const { setValue, fullscreen, fdMode } = useAppStore();
  const r = 12;

  const values = [1, 2, 5, 10, 20, 50, 100];
  const start = 10;
  const end = props.width / 4 + 10;
  const y = props.height + 20;
  const step = (end - start) / (values.length - 1);

  const index = values.findIndex((v) => v == props.multiplier);

  const circle = useRef();

  const getIndex = () => {
    let index = Math.round((circle.current.x() - start) / step);
    index = Math.max(index, 0);
    index = Math.min(index, values.length - 1);
    return index;
  };

  const events = {
    onDragMove: (e) => {
      circle.current.setAttrs({ x: start + getIndex() * step, y });
      setValue("graphMultiplier", values[getIndex()]);
    },
    onDragEnd: (e) => {},
  };

  const rectHeight = r * 0.7;

  return (
    <>
      <Rect
        x={start - r}
        y={y - rectHeight / 2}
        width={end - start + 2 * r}
        height={rectHeight}
        fill={colors.grey}
        cornerRadius={rectHeight / 2}
      />
      <Text
        text="Step"
        x={start - r}
        y={y - rectHeight / 2 + 30}
        width={end - start + 2 * r}
        align="center"
        fontFamily="Calibri"
        fontSize={28}
        visible={fullscreen}
      />
      <Group ref={circle} x={start + index * step} y={y} draggable={!fdMode} {...events}>
        <Circle radius={r} fill={colors.blue} />
        <Text y={16} text={props.multiplier} x={-50} width={100} align="center" fontSize={20} fontFamily="Calibri" />
      </Group>
    </>
  );
};

export default RangeSelector;
