import { Circle, Group, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { colors } from "../config";
import { useRef } from "react";

export const DenominatorSelector = (props) => {
  const { updateElement, labels } = useAppStore();
  const r = 12;
  const values = [1, 2, 3, 4, 5, 6, 8, 10];
  if (labels != "Decimals" && labels != "Percents") {
    values.push(12);
  }
  const start = props.width / 4;
  const end = (props.width * 3) / 4;
  const y = 100;
  const step = (end - start) / (values.length - 1);

  const index = values.findIndex((v) => v == props.denominator);

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
      updateElement(props.id, { denominator: values[getIndex()] });
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
        text="Denominator"
        x={start - r}
        y={y - rectHeight / 2 + 40}
        width={end - start + 2 * r}
        align="center"
        fontFamily="Calibri"
        fontSize={28}
      />
      <Group ref={circle} x={start + index * step} y={y} draggable {...events}>
        <Circle radius={r} fill={colors.blue} />
        <Text y={16} text={props.denominator} x={-50} width={100} align="center" fontSize={20} fontFamily="Calibri" />
      </Group>
    </>
  );
};
