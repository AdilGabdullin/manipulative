import { Circle, Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { boxesIntersect } from "../util";
import { useRef, useState } from "react";
import { rectProps } from "./Factors";
import config from "../config";

export const margin = 10;
export const buttonHeight = 64;
export const buttonWidth = 140;
export const scrollSize = 14;
export const stroke = "grey";
export const commonProps = {
  cornerRadius: 6,
  stroke: stroke,
  strokeWidth: 2,
};
export const textProps = {
  stroke: "#299af3",
  fill: "#299af3",
  align: "center",
  fontFamily: "Calibri",
};

const Comparing = () => {
  const state = useAppStore();
  const { origin, width } = state;
  if (!width) return null;
  const rect = rectProps(state);

  const totalWidth = rect.width;
  const mainHeight = rect.height - margin;
  const x = origin.x + rect.x;
  const y = origin.y + rect.y - config.summary.height - margin;
  const left = sumInRect(state, x, y, totalWidth / 2, mainHeight);
  const right = sumInRect(state, x + totalWidth / 2, y, totalWidth / 2, mainHeight);
  const sign = left < right ? "<" : left > right ? ">" : "=";

  return (
    <Group x={x} y={y}>
      <Rect x={0} y={0} width={totalWidth} height={mainHeight} {...commonProps} />
      <Line x={totalWidth / 2} y={0} points={[0, 0, 0, mainHeight]} {...commonProps} />
      <Button x={totalWidth / 4 - buttonWidth / 2} y={mainHeight + margin} value={left} />
      <CenterCircle x={totalWidth / 2} y={mainHeight + margin + buttonHeight / 2} value={sign} />
      <Button x={(totalWidth * 3) / 4 - buttonWidth / 2} y={mainHeight + margin} value={right} />
    </Group>
  );
};

const CenterCircle = ({ x, y, value }) => {
  const [visible, setVisible] = useState(true);
  const r = buttonHeight / 2;
  const fontSize = 40;
  const rectRef = useRef();
  const onPointerEnter = (e) => {
    rectRef.current?.setAttr("stroke", textProps.stroke);
  };
  const onPointerLeave = (e) => {
    rectRef.current?.setAttr("stroke", commonProps.stroke);
  };
  const onPointerClick = (e) => {
    setVisible(!visible);
  };
  return (
    <Group x={x} y={y} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onPointerClick={onPointerClick}>
      <Circle ref={rectRef} x={0} y={0} radius={r} {...commonProps} />
      <Text visible={visible} x={-r} y={-fontSize / 2} width={2 * r} text={value} fontSize={fontSize} {...textProps} />
    </Group>
  );
};

export const Button = ({ x, y, value }) => {
  const [visible, setVisible] = useState(true);
  const fontSize = 32;
  const rectRef = useRef();
  const onPointerEnter = (e) => {
    rectRef.current?.setAttr("stroke", textProps.stroke);
  };
  const onPointerLeave = (e) => {
    rectRef.current?.setAttr("stroke", commonProps.stroke);
  };
  const onPointerClick = (e) => {
    setVisible(!visible);
  };
  return (
    <Group x={x} y={y} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onPointerClick={onPointerClick}>
      <Rect ref={rectRef} x={0} y={0} width={buttonWidth} height={buttonHeight} {...commonProps} />
      <Text
        visible={visible}
        x={0}
        y={(buttonHeight - fontSize) / 2}
        width={buttonWidth}
        text={value}
        fontSize={fontSize}
        {...textProps}
      />
    </Group>
  );
};

export function sumInRect(state, x, y, width, height) {
  const rect = {
    x: x - state.origin.x,
    y: y - state.origin.y,
    width,
    height,
  };
  const sum = Object.values(state.elements)
    .filter((block) => {
      return block.type == "block" && !block.visibleAfterMove && boxesIntersect(block, rect);
    })
    .reduce((sum, block) => sum + parseInt(block.label), 0);
  return state.numberSet == config.numberSet.decimal ? (sum / 100).toFixed(2) : sum.toString();
}

export default Comparing;
