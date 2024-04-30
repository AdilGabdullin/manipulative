import { Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { colors } from "../state/colors";
import { useRef, useState } from "react";
import { nlLineWidth, notchStep, notchX } from "./NumberLine";

const { round } = Math;

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

  const textSkipStep = textStep(range, workspace, denominator);
  const notchSkipStep = notchStep(range, workspace, denominator);

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

const NotchLine = ({ height, id, short }) => {
  const size = short ? height / 3 : height / 2;
  return (
    <Line
      name={`${id}-notch`}
      x={0}
      y={height / 2 - size / 2}
      points={[0, 0, 0, size]}
      strokeWidth={nlLineWidth / 2}
      stroke={colors.woodBrown}
      fill={colors.woodBrown}
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

  const minus = round(text) < 0 && workspace == "Fractions";

  if (workspace == "Decimals") {
    text = text.toFixed(1);
  }
  if (workspace == "Fractions") {
    if (denominator != 1) {
      if (Math.abs(text - Math.round(text)) < 0.0001) {
        denominator = 1;
        text = Math.round(text);
      } else {
        text = Math.round(text * denominator);
      }
    }
    text = Math.abs(text);
  }

  const textWidth = Math.max(text.toString().length * 12, denominator.toString().length * 12);

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
        y={round(height * 1.25 + 19)}
        points={[-textWidth * 0.6, 0, textWidth * 0.6, 0]}
        stroke={colors.black}
        strokeWidth={2}
        visible={textVisible && denominator != 1}
      />
      <Line
        ref={lineRef2}
        x={round(-textWidth * 0.6 + (denominator == 1 ? 5 : 0))}
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

function textStep(range, workspace, denominator) {
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
    const count = range * denominator;
    if (count < 20) return 1;
    else if (count < 40) return 2;
    else if (count < 60) return 5;
    else if (count < 100) return 10;
    else return 10;
  }
}

export default Notches;
