import { Circle, Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { leftToolbarWidth } from "./LeftToolbar";
import { menuHeight } from "./Menu";
import { numberBetween, sum } from "../util";
import { useRef, useState } from "react";

export const margin = 10;
export const buttonHeight = 60;
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
  const { origin, width, height, fullscreen } = state;
  if (!width) return null;
  const totalWidth = Math.min(width - leftToolbarWidth - 45, 750);
  let totalHeight = height - margin * 2 - menuHeight - scrollSize;
  if (fullscreen) {
    totalHeight = Math.min(totalHeight, 600);
  }
  const mainHeight = totalHeight - buttonHeight - margin;
  const x = origin.x - (totalWidth + scrollSize) / 2;
  const y = origin.y - (totalHeight + scrollSize) / 2;
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
  return sum(
    Object.values(state.elements)
      .filter((e) => {
        return (
          !e.ignoreSum &&
          numberBetween(state.origin.x + e.x, x, x + width) &&
          numberBetween(state.origin.y + e.y, y, y + height)
        );
      })
      .map((e) => e.value)
  );
}

export default Comparing;
