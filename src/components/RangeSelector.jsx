import { Circle, Group, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { colors } from "../state/colors";
import { useRef } from "react";

export const RangeSelector = (props) => {
  const { setMinMax, workspace } = useAppStore();
  const r = 12;

  const values = {
    Integers: [-1000, -500, -100, -20, -10, 0, 10, 20, 100, 500, 1000],
    Decimals: [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    Fractions: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
  }[workspace];
  const start = workspace == "Fractions" ? props.height : props.width / 4;
  const end = workspace == "Fractions" ? props.width / 2 - props.height : (props.width * 3) / 4;
  const y = 100;
  const step = (end - start) / (values.length - 1);

  const leftIndex = values.findIndex((v) => v == props.min);
  const rightIndex = values.findIndex((v) => v == props.max);

  const leftCircle = useRef();
  const rightCircle = useRef();

  const getLeftIndex = () => {
    let index = Math.round((leftCircle.current.x() - start) / step);
    index = Math.max(index, 0);
    index = Math.min(index, rightIndex - 1);
    return index;
  };

  const getRightIndex = () => {
    let index = Math.round((rightCircle.current.x() - start) / step);
    index = Math.min(index, values.length - 1);
    index = Math.max(index, leftIndex + 1);
    return index;
  };

  const events = {
    left: {
      onDragMove: (e) => {
        leftCircle.current.setAttrs({ x: start + getLeftIndex() * step, y });
        setMinMax(props.id, "min", values[getLeftIndex()], false);
      },
      onDragEnd: (e) => {
        setMinMax(props.id, "min", values[getLeftIndex()]);
      },
    },
    right: {
      onDragMove: (e) => {
        rightCircle.current.setAttrs({ x: start + getRightIndex() * step, y });
        setMinMax(props.id, "max", values[getRightIndex()], false);
      },
      onDragEnd: (e) => {
        setMinMax(props.id, "max", values[getRightIndex()]);
      },
    },
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
      <Rect
        x={start + leftIndex * step}
        y={y - rectHeight / 2}
        width={(rightIndex - leftIndex) * step}
        height={rectHeight}
        fill={colors.blue}
      />
      <Text
        text="Range"
        x={start - r}
        y={y - rectHeight / 2 + 40}
        width={end - start + 2 * r}
        align="center"
        fontFamily="Calibri"
        fontSize={28}
      />
      <Group ref={leftCircle} x={start + leftIndex * step} y={y} draggable {...events.left}>
        <Circle radius={r} fill={colors.blue} />
        <Text y={16} text={props.min} x={-50} width={100} align="center" fontSize={20} fontFamily="Calibri" />
      </Group>
      <Group ref={rightCircle} x={start + rightIndex * step} y={y} draggable {...events.right}>
        <Circle radius={r} fill={colors.blue} />
        <Text y={16} text={props.max} x={-50} width={100} align="center" fontSize={20} fontFamily="Calibri" />
      </Group>
    </>
  );
};

export const DenominatorSelector = (props) => {
  const { setMinMax } = useAppStore();
  const r = 12;

  const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const start = props.width / 2 + props.height;
  const end = props.width - props.height;
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
      setMinMax(props.id, "denominator", values[getIndex()], false);
    },
    onDragEnd: (e) => {
      setMinMax(props.id, "denominator", values[getIndex()]);
    },
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
