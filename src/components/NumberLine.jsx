import { Circle, Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { colors } from "../state/colors";
import { useRef, useState } from "react";

export const nlWidth = 900;
export const nlHeight = 26;
export const nlLineWidth = 4;
const nlMinWidth = 100;

const NumberLine = (props) => {
  const { origin, relocateElement, updateElement, selectIds } = useAppStore();
  const { id, x, y, width, height, visible, locked, haveNotches, min, max } = props;
  const headSize = height / 2;
  const groupPos = { x: origin.x + x, y: origin.y + y };
  const rectPos = { x: headSize, y: 0 };
  const linePos = { x: headSize, y: height / 2 };

  const group = useRef();
  const line = useRef();
  const leftHead = useRef();
  const rightHead = useRef();

  let notchGroups = null;
  const getNotchGroups = (e) => {
    if (notchGroups) return notchGroups;
    notchGroups = [];
    const stage = e.target.getStage();
    for (let i = 0; i < max - min + 1; i += 1) {
      notchGroups.push(stage.findOne(`#${id}-notch-${i}`));
    }
    return notchGroups;
  };

  const setColor = (targets, color) => {
    for (const target of targets) {
      target.setAttrs({
        stroke: color,
        fill: color,
      });
    }
  };

  return (
    <Group
      ref={group}
      id={id}
      {...groupPos}
      visible={visible !== undefined ? visible : true}
      draggable
      onDragEnd={(e) => {
        if (e.target === group.current) {
          relocateElement(id, e.target.x() - groupPos.x, e.target.y() - groupPos.y);
        }
      }}
      onPointerClick={() => selectIds([id], locked)}
    >
      <Line
        ref={line}
        {...linePos}
        points={[0, 0, width - headSize * 2, 0]}
        strokeWidth={nlLineWidth}
        stroke={"black"}
      />
      <Rect
        {...rectPos}
        width={width - 2 * headSize}
        height={height}
        onPointerEnter={(e) => {
          const notches = e.target.getStage().find(`.${id}-notch`);
          setColor([...notches, line.current, leftHead.current, rightHead.current], colors.blue);
        }}
        onPointerLeave={(e) => {
          const notches = e.target.getStage().find(`.${id}-notch`);
          setColor([...notches, line.current, leftHead.current, rightHead.current], colors.black);
        }}
      />
      <Line
        ref={leftHead}
        x={0}
        y={height / 2}
        points={[0, 0, headSize, headSize, headSize, -headSize, 0, 0]}
        stroke={"black"}
        fill="black"
        closed
        draggable
        onPointerEnter={(e) => setColor([e.target], colors.blue)}
        onPointerLeave={(e) => setColor([e.target], colors.black)}
        onDragMove={(e) => {
          const dx = Math.min(e.target.x() - 0, width - nlMinWidth);
          e.target.setAttrs({ x: dx, y: height / 2 });
          line.current.setAttrs({ x: linePos.x + dx, points: [0, 0, width - headSize * 2 - dx, 0] });
          getNotchGroups(e).forEach((notchGroup, i) => {
            notchGroup.x(notchX(i, { ...props, width: width - dx, shift: dx }));
          });
        }}
        onDragEnd={(e) => {
          const dx = Math.min(e.target.x() - 0, width - nlMinWidth);
          e.target.setAttrs({ x: 0, y: height / 2 });
          line.current.setAttrs(linePos);
          updateElement(id, { x: x + dx, width: width - dx });
        }}
      />
      <Line
        ref={rightHead}
        x={width}
        y={height / 2}
        points={[0, 0, -headSize, -headSize, -headSize, headSize, 0, 0]}
        stroke={"black"}
        fill="black"
        closed
        draggable
        onPointerEnter={(e) => setColor([e.target], colors.blue)}
        onPointerLeave={(e) => setColor([e.target], colors.black)}
        onDragMove={(e) => {
          const dx = Math.max(e.target.x() - width, nlMinWidth - width);
          e.target.setAttrs({ x: width + dx, y: height / 2 });
          line.current.setAttrs({ points: [0, 0, width - headSize * 2 + dx, 0] });
          getNotchGroups(e).forEach((notchGroup, i) => {
            notchGroup.x(notchX(i, { ...props, width: width + dx }));
          });
        }}
        onDragEnd={(e) => {
          const dx = Math.max(e.target.x() - width, nlMinWidth - width);
          e.target.setAttrs({ x: width, y: height / 2 });
          line.current.setAttrs(linePos);
          updateElement(id, { width: width + dx });
        }}
      />
      {haveNotches && (
        <>
          <Notches {...props} />
          <RangeSelector {...props} />
        </>
      )}
    </Group>
  );
};

const Notches = (props) => {
  const { id, min, max } = props;
  const xs = [];
  for (let i = 0; i < max - min + 1; i += 1) {
    xs.push({ x: notchX(i, props), text: min + i });
  }

  return xs.map(({ x, text }, i) => (
    <Group key={i} x={x} id={`${id}-notch-${i}`}>
      <NotchLine {...props} />
      <NotchText {...props} text={text} />
    </Group>
  ));
};

const NotchLine = ({ height, id }) => {
  return (
    <Line
      name={`${id}-notch`}
      x={0}
      y={height / 4}
      points={[0, 0, 0, height / 2]}
      strokeWidth={nlLineWidth / 2}
      stroke={"black"}
      fill="black"
      lineCap="round"
    />
  );
};

const NotchText = ({ width, height, min, max, text }) => {
  const [textVisible, setTextVisible] = useState(true);

  const step = (width - 4 * height) / (max - min);
  const textRef = useRef();
  const rectRef = useRef();

  const events = {
    onPointerEnter: (e) => {
      textRef.current.setAttrs({
        stroke: colors.blue,
        fill: colors.blue,
      });
      if (!textVisible) {
        rectRef.current.setAttr("stroke", colors.blue);
      }
    },
    onPointerLeave: (e) => {
      textRef.current.setAttrs({
        stroke: colors.black,
        fill: colors.black,
      });
      if (!textVisible) {
        rectRef.current.setAttr("stroke", null);
      }
    },
    onPointerClick: (e) => {
      e.cancelBubble = true;
      if (textVisible) {
        rectRef.current.setAttr("stroke", colors.blue);
      }
      setTextVisible(!textVisible);
    },
  };

  const rectSize = 18;

  return (
    <Group {...events}>
      <Text
        ref={textRef}
        text={text}
        visible={textVisible}
        x={-step / 2}
        y={height * 1.25}
        width={step}
        align="center"
        stroke={"black"}
        fill="black"
        fontFamily="Calibri"
        fontStyle="200"
        fontSize={20}
      />
      <Rect
        ref={rectRef}
        x={-rectSize / 2}
        y={height * 1.25 + 20 / 2 - rectSize / 2}
        width={rectSize}
        height={rectSize}
        strokeWidth={2}
        visible={!textVisible}
      />
    </Group>
  );
};

function notchX(i, { width, height, min, max, shift }) {
  const step = (width - 4 * height) / (max - min);
  const start = height * 2 + (shift || 0);
  return start + i * step + width / 100000;
}

const RangeSelector = (props) => {
  const { updateElement } = useAppStore();
  const r = 12;

  const values = [-1000, -500, -100, -20, -10, 0, 10, 20, 100, 500, 1000];
  const start = props.width / 4;
  const end = (props.width * 3) / 4;
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
        updateElement(props.id, { min: values[getLeftIndex()] });
      },
      onDragEnd: (e) => {
        updateElement(props.id, { min: values[getLeftIndex()] });
      },
    },
    right: {
      onDragMove: (e) => {
        rightCircle.current.setAttrs({ x: start + getRightIndex() * step, y });
        updateElement(props.id, { max: values[getRightIndex()] });
      },
      onDragEnd: (e) => {
        updateElement(props.id, { max: values[getRightIndex()] });
      },
    },
  };

  return (
    <>
      <Rect
        x={start - r}
        y={y - r / 2}
        width={end - start + 2 * r}
        height={r}
        fill={colors.grey}
        cornerRadius={r / 2}
      />
      <Group>
        <Circle
          ref={leftCircle}
          x={start + leftIndex * step}
          y={y}
          radius={r}
          fill={colors.blue}
          draggable
          {...events.left}
        />
      </Group>
      <Group>
        <Circle
          ref={rightCircle}
          x={start + rightIndex * step}
          y={y}
          radius={r}
          fill={colors.blue}
          draggable
          {...events.right}
        />
      </Group>
    </>
  );
};

export default NumberLine;
