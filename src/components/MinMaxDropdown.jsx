import { Group, Rect, Text } from "react-konva";
import { menuHeight } from "./Menu";
import { useRef } from "react";

const width = 120;
const fontSize = 22;
const margin = 5;
const padding = 2;

const MinMaxDropdown = (props) => {
  const { options, onSelect, visible, active } = props;
  const buttonHeight = fontSize + padding * 2 + margin;
  return (
    <Group x={463 - 120 / 2} y={menuHeight + 8} visible={visible}>
      <Rect
        x={0}
        y={0}
        width={width}
        height={buttonHeight * options.length + margin}
        stroke="grey"
        strokeWidth={1}
        cornerRadius={12}
        fill="#ffffff"
        shadowColor="grey"
        shadowBlur={5}
        shadowOffset={{ x: 3, y: 3 }}
        shadowOpacity={0.5}
      />

      {options.map((option, i) => (
        <Option
          key={option}
          x={margin}
          y={margin + i * buttonHeight}
          text={option}
          active={option == active}
          onSelect={onSelect}
        />
      ))}
    </Group>
  );
};

const Option = ({ x, y, text, active, onSelect }) => {
  const rectRef = useRef(null);

  const onPointerEnter = () => {
    if (!active) {
      rectRef.current.fill("#e8f4fe");
    }
  };
  const onPointerLeave = () => {
    if (!active) {
      rectRef.current.fill("white");
    }
  };
  return (
    <Group onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onPointerClick={() => onSelect(text)}>
      <Rect
        ref={rectRef}
        x={x}
        y={y}
        width={width - 2 * margin}
        height={fontSize + padding * 2}
        fill={active ? "#e8f4fe" : "white"}
        cornerRadius={6}
      />
      <Text
        x={x}
        y={y + padding}
        width={width}
        text={text}
        align="center"
        fill={"black"}
        fontSize={fontSize}
        fontFamily="Calibri"
      />
    </Group>
  );
};

export default MinMaxDropdown;
