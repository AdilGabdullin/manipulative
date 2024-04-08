import { Circle, Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { colors } from "../state/colors";
import { useRef, useState } from "react";

export const nlWidth = 900;
export const nlHeight = 26;
export const nlLineWidth = 4;
const nlMinWidth = 100;

const NumberLine = (props) => {
  const { workspace, origin, relocateElement, updateElement, selectIds, selected } = useAppStore();
  const { id, x, y, width, height, visible, locked, min, max } = props;
  const showNotches = workspace != "Open";
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
      {showNotches && <Notches {...props} />}
      {
        // showNotches && selected.length == 1 && selected[0] == id &&
        <RangeSelector {...props} />
      }
    </Group>
  );
};

const Notches = (props) => {
  const { workspace } = useAppStore();
  const { id, min, max } = props;
  const xs = [];
  const range = max - min;
  const iStep = {
    Integers: 1,
    Decimals: 0.1,
  }[workspace];
  for (let i = 0; i < range + iStep / 2; i += iStep) {
    xs.push({ x: notchX(i, props), text: min + i });
  }

  const textSkipStep = textStep(range, workspace);
  const notchSkipStep = notchStep(range);

  return xs.map(({ x, text }, i) => {
    const skipNotch = i % notchSkipStep == 0;
    const showText = i % textSkipStep == 0;

    return (
      <Group key={i} x={x} id={`${id}-notch-${i}`}>
        {skipNotch && <NotchLine {...props} short={!showText} />}
        {showText && <NotchText {...props} text={text} />}
      </Group>
    );
  });
};

function textStep(range, workspace) {
  if (workspace == "Decimals") {
    if (range < 3) return 1;
    else if (range <= 10) return 5;
    else if (range <= 15) return 10;
    else return 20;
  }
  if (workspace == "Integers") {
    if (range < 30) return 1;
    else if (range < 80) return 2;
    else if (range < 200) return 10;
    else if (range < 400) return 20;
    else if (range < 600) return 50;
    else if (range < 1500) return 100;
    else return 200;
  }
}

export function notchStep(range) {
  if (range > 15 && range <= 20) return 2;
  if (range < 200) return 1;
  if (range < 1000) return 10;
  if (range < 1500) return 20;
  return 100;
}

const NotchLine = ({ height, id, short }) => {
  const size = short ? height / 3 : height / 2;
  return (
    <Line
      name={`${id}-notch`}
      x={0}
      y={height / 2 - size / 2}
      points={[0, 0, 0, size]}
      strokeWidth={nlLineWidth / 2}
      stroke={"black"}
      fill="black"
      lineCap="round"
    />
  );
};

const NotchText = ({ width, height, min, max, text }) => {
  const { workspace } = useAppStore();
  const [textVisible, setTextVisible] = useState(true);

  const textRef = useRef();
  const rectRef = useRef();
  if (workspace == "Decimals") {
    text = text.toFixed(1);
  }
  const textWidth = text.toString().length * 12;

  const events = {
    onPointerEnter: (e) => {
      textRef.current.setAttrs({
        fill: colors.blue,
      });
      if (!textVisible) {
        rectRef.current.setAttr("stroke", colors.blue);
      }
    },
    onPointerLeave: (e) => {
      textRef.current.setAttrs({
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
        x={-textWidth / 2}
        y={height * 1.25}
        width={textWidth}
        align="center"
        fontFamily="Calibri"
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
      <Rect x={-textWidth / 2} y={height * 1.25} width={textWidth} height={20} stroke={"black"} />
    </Group>
  );
};

export function notchX(i, { width, height, min, max, shift }) {
  const step = (width - 4 * height) / (max - min);
  const start = height * 2 + (shift || 0);
  return start + i * step + width * 0.000001;
}

const RangeSelector = (props) => {
  const { updateElement, workspace } = useAppStore();
  const r = 12;

  const values = {
    Integers: [-1000, -500, -100, -20, -10, 0, 10, 20, 100, 500, 1000],
    Decimals: [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  }[workspace];
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
        updateElement(props.id, { min: values[getLeftIndex()] }, false);
      },
      onDragEnd: (e) => {
        updateElement(props.id, { min: values[getLeftIndex()] });
      },
    },
    right: {
      onDragMove: (e) => {
        rightCircle.current.setAttrs({ x: start + getRightIndex() * step, y });
        updateElement(props.id, { max: values[getRightIndex()] }, false);
      },
      onDragEnd: (e) => {
        updateElement(props.id, { max: values[getRightIndex()] });
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

export function mk(state) {
  return {
    Integers: { m: 10, k: 1 },
    Decimals: { m: 0.5, k: 10 },
  }[state.workspace];
}

export default NumberLine;
