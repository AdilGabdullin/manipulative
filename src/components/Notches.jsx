import { Group, Line, Rect, Text } from "react-konva";
import { colors } from "../config";
import { useRef, useState } from "react";

const Notches = (props) => {
  const { id, min, max } = props;
  const xs = [];
  const range = max - min;
  const iStep = 1;
  for (let i = 0; i < range + iStep / 2; i += iStep) {
    xs.push({ x: notchX(i, props), text: min + i });
  }

  const textSkipStep = 1;
  const notchSkipStep = 1;

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
  const size = 14;
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
  const [textVisible, setTextVisible] = useState(true);

  const textRef = useRef();
  const lineRef = useRef();
  const textRef2 = useRef();
  const rectRef = useRef();

  const textWidth = Math.max(text.toString().length * 12, denominator.toString().length * 12);

  const events = {
    onPointerEnter: (e) => {
      textRef.current.setAttrs({ fill: colors.blue });
      textRef2.current.setAttrs({ fill: colors.blue });
      lineRef.current.setAttrs({ stroke: colors.blue });
      if (!textVisible) {
        rectRef.current.setAttr("stroke", colors.blue);
      }
    },
    onPointerLeave: (e) => {
      textRef.current.setAttrs({ fill: colors.black });
      textRef2.current.setAttrs({ fill: colors.black });
      lineRef.current.setAttrs({ stroke: colors.black });
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
      <Line
        ref={lineRef}
        x={0}
        y={height * 1.25 + 19}
        points={[-textWidth * 0.6, 0, textWidth * 0.6, 0]}
        stroke="black"
        strokeWidth={2}
        visible={textVisible && denominator != 1}
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

export default Notches;
