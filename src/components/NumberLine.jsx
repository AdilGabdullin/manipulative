import { Circle, Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { colors } from "../state/colors";
import { useRef, useState } from "react";

export const nlWidth = 900;
export const nlHeight = 26;
export const nlLineWidth = 4;
const nlMinWidth = 100;

const NumberLine = (props) => {
  const state = useAppStore();
  const { workspace, origin, relocateElement, updateElement, selectIds, selected } = state;
  const { id, x, y, width, height, visible, locked, min, max, denominator } = props;
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

    const iStep = {
      Integers: 1,
      Decimals: 0.1,
      Fractions: 1 / denominator,
    }[workspace];
    for (let index = 0, i = 0; i < max - min + iStep / 2; i += iStep, index++) {
      notchGroups.push(stage.findOne(`#${id}-notch-${index}`));
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

  const k = mk(state, denominator).k;

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
            notchGroup.x(notchX(i, { ...props, width: width - dx, shift: dx }, k));
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
            notchGroup.x(notchX(i, { ...props, width: width + dx }, k));
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
      {showNotches && selected.length == 1 && selected[0] == id && <RangeSelector {...props} />}
    </Group>
  );
};

const Notches = (props) => {
  const { workspace } = useAppStore();
  const { id, min, max, denominator } = props;
  const xs = [];
  const range = max - min;
  const iStep = {
    Integers: 1,
    Decimals: 0.1,
    Fractions: 1 / denominator,
  }[workspace];
  for (let i = 0; i < range + iStep / 2; i += iStep) {
    xs.push({ x: notchX(i, props), text: min + i });
  }

  const textSkipStep = textStep(range, workspace);
  const notchSkipStep = notchStep(range, workspace);

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
  if (workspace == "Fractions") {
    return 1;
  }
}

export function notchStep(range, workspace = "Integers") {
  if (workspace == "Decimals" && range > 15 && range <= 20) return 2;
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

const NotchText = ({ height, text, denominator }) => {
  const { workspace } = useAppStore();
  const [textVisible, setTextVisible] = useState(true);

  const textRef = useRef();
  const lineRef = useRef();
  const lineRef2 = useRef();
  const textRef2 = useRef();
  const rectRef = useRef();

  const minus = text < 0;

  if (workspace == "Decimals") {
    text = text.toFixed(1);
  }
  if (workspace == "Fractions") {
    if (denominator != 1) {
      if (text % 1 == 0) {
        denominator = 1;
      } else {
        text = Math.round(text * denominator);
      }
    }
    text = Math.abs(text);
  }

  const textWidth = text.toString().length * 12;

  const events = {
    onPointerEnter: (e) => {
      textRef.current.setAttrs({ fill: colors.blue });
      textRef2.current.setAttrs({ fill: colors.blue });
      lineRef.current.setAttrs({ stroke: colors.blue });
      lineRef2.current.setAttrs({ stroke: colors.blue });
      if (!textVisible) {
        rectRef.current.setAttr("stroke", colors.blue);
      }
    },
    onPointerLeave: (e) => {
      textRef.current.setAttrs({ fill: colors.black });
      textRef2.current.setAttrs({ fill: colors.black });
      lineRef.current.setAttrs({ stroke: colors.black });
      lineRef2.current.setAttrs({ stroke: colors.black });
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
        y={height * 1.25 + (denominator == 1 && workspace == "Fractions" ? 9 : 0)}
        width={textWidth}
        align="center"
        fontFamily="Calibri"
        fontSize={20}
      />
      <Line
        ref={lineRef}
        x={0}
        y={height * 1.25 + 19}
        points={[-textWidth * 0.6, 0, textWidth * 0.6, 0]}
        stroke="black"
        strokeWidth={2}
        visible={textVisible && denominator != 1}
      />
      <Line
        ref={lineRef2}
        x={-textWidth * 0.6 + (denominator == 1 ? 5 : 0)}
        y={height * 1.25 + 19}
        points={[-10, 0, -5, 0]}
        stroke="black"
        strokeWidth={2}
        visible={textVisible && minus}
      />
      <Text
        ref={textRef2}
        text={denominator}
        visible={textVisible && denominator != 1}
        x={-textWidth / 2}
        y={height * 1.25 + 20}
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
      {/* <Rect x={-textWidth / 2} y={height * 1.25} width={textWidth} height={40} stroke={"black"} /> */}
    </Group>
  );
};

export function notchX(i, { width, height, min, max, shift }, k = 1) {
  const step = (width - 4 * height) / (max - min) / k;
  const start = height * 2 + (shift || 0);
  return start + i * step + width * 0.000001;
}

const RangeSelector = (props) => {
  const { setMinMax, workspace } = useAppStore();
  const r = 12;

  const values = {
    Integers: [-1000, -500, -100, -20, -10, 0, 10, 20, 100, 500, 1000],
    Decimals: [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    Fractions: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
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

export function mk(state, denominator = 1) {
  return {
    Integers: { m: 10, k: 1 },
    Decimals: { m: 0.5, k: 10 },
    Open: { m: 1, k: 1 },
    Fractions: { m: 0.5, k: denominator },
  }[state.workspace];
}

export function defaultMinMax(workspace) {
  switch (workspace) {
    case "Integers":
      return { min: 0, max: 20, denominator: 1 };
      break;
    case "Decimals":
      return { min: 0, max: 1, denominator: 1 };
      break;
    case "Fractions":
      return { min: 0, max: 1, denominator: 8 };
      break;
    case "Open":
      return { min: null, max: null, denominator: 1 };
      break;
  }
}

export default NumberLine;
