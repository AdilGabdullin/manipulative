import { Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { colors } from "../config";
import { useRef, useState } from "react";
import { nlLineWidth, notchX } from "./NumberLine";

const { round } = Math;

const Notches = (props) => {
  const { id, min, max, denominator } = props;
  const xs = [];
  const range = max - min;
  const iStep = 1 / denominator;
  for (let i = 0; i < range + iStep / 2; i += iStep) {
    xs.push({ x: notchX(i, props), text: min + i });
  }

  return xs.map(({ x, text }, i) => {
    return (
      <Group key={i} x={x} id={`${id}-notch-${i}`}>
        <NotchLine {...props} short={text != Math.round(text)} />
        <NotchText {...props} text={text} />
      </Group>
    );
  });
};

const NotchLine = ({ height, id, short }) => {
  const size = short ? 8 : 14;
  return (
    <Line
      name={`${id}-notch`}
      x={0}
      y={height / 2 - size / 2}
      points={[0, 0, 0, size]}
      strokeWidth={nlLineWidth / 2}
      stroke={colors.black}
      fill={colors.black}
      lineCap="round"
    />
  );
};

export const NotchText = ({ height, text, denominator }) => {
  const { workspace, mixedNumbers } = useAppStore();
  const [textVisible, setTextVisible] = useState(true);

  const textRef = useRef();
  const lineRef = useRef();
  const lineRef2 = useRef();
  const textRef2 = useRef();
  const textRef3 = useRef();
  const rectRef = useRef();

  const minus = text < 0 && workspace == "Fractions";
  let wholePart = 0;

  if (denominator != 1) {
    if (Math.abs(text - Math.round(text)) < 0.0001) {
      denominator = 1;
      text = Math.round(text);
    } else {
      text = Math.round(text * denominator);
      if (mixedNumbers) {
        wholePart = Math.floor(Math.abs(text / denominator));
        text = text % denominator;
      }
    }
  }
  text = Math.abs(text);

  const textWidth = Math.max(text.toString().length * 12, denominator.toString().length * 12);

  const events = {
    onPointerEnter: (e) => {
      textRef.current.setAttrs({ fill: colors.blue });
      textRef2.current.setAttrs({ fill: colors.blue });
      textRef3.current.setAttrs({ fill: colors.blue });
      lineRef.current.setAttrs({ stroke: colors.blue });
      lineRef2.current.setAttrs({ stroke: colors.blue });
      if (!textVisible) {
        rectRef.current.setAttr("stroke", colors.blue);
      }
    },
    onPointerLeave: (e) => {
      textRef.current.setAttrs({ fill: colors.black });
      textRef2.current.setAttrs({ fill: colors.black });
      textRef3.current.setAttrs({ fill: colors.black });
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
        y={round(height * 1.25 + 19)}
        points={[-textWidth * 0.6, 0, textWidth * 0.6, 0]}
        stroke={colors.black}
        strokeWidth={2}
        visible={textVisible && denominator != 1}
      />
      <Line
        ref={lineRef2}
        x={round(-textWidth * 0.6 + (denominator == 1 ? 5 : 0) + (wholePart != 0 ? -textWidth * 0.3 : 0))}
        y={round(height * 1.25 + 19)}
        points={[-10, 0, -5, 0]}
        stroke={colors.black}
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
      <Text
        ref={textRef3}
        text={wholePart}
        visible={textVisible && wholePart != 0}
        x={-textWidth * 2.4}
        y={height * 1.25 + 10}
        width={textWidth * 3}
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
    </Group>
  );
};

export default Notches;
