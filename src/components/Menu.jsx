import { Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import BrushMenu from "./BrushMenu";
import config from "../config";
import { useRef, useState } from "react";

const Menu = () => {
  const width = useAppStore((s) => s.width);
  const fdMode = useAppStore((s) => s.fdMode);
  const x = config.leftToolbar.width;
  const y = 0;
  const menuHeight = config.menu.height;
  return (
    <>
      <Line id="bottom-menu-line" points={[x, y + menuHeight, width, y + menuHeight]} stroke="#c0c0c0" />
      <Rect id="bottom-menu-rect" fill="#ffffff" x={x} y={y} width={width} height={menuHeight} />
      {fdMode ? (
        <BrushMenu x={x} y={y} height={menuHeight} />
      ) : (
        <DefaultMenu x={x} y={y} height={menuHeight} width={width - config.leftToolbar.width} />
      )}
    </>
  );
};

const DefaultMenu = (props) => {
  const { x, y } = props;
  const { padding } = config.menu;

  const widths = [110, 90, 65, 86, 120];
  const xs = [];
  widths.forEach((w, i) => {
    let sumWidth = 0;
    for (let k = 0; k < i; k += 1) {
      sumWidth += widths[k];
    }
    xs.push(x + padding * (i + 1) + sumWidth);
  });

  return (
    <>
      <SelectButton x={xs[0]} y={y + padding} width={widths[0]} dropWidth={150} text="Number Set" field="numberSet" />
      <SelectButton x={xs[1]} y={y + padding} width={widths[1]} dropWidth={90} text="Block Set" field="blockSet" />
      <ToggleButton x={xs[2]} y={y + padding} width={widths[2]} text="Labels" field="showLabels" />
      <ToggleButton x={xs[3]} y={y + padding} width={widths[3]} text="Summary" field="showSummary" />
      <ToggleButton x={xs[4]} y={y + padding} width={widths[4]} text="Multi-colored" field="multiColored" />
    </>
  );
};

const ToggleButton = ({ x, y, text, width, field }) => {
  const state = useAppStore();
  const colors = config.colors;
  const { padding, height } = config.menu;
  const fill = state[field];

  return (
    <Group key={text} onPointerClick={() => state.toggle(field)}>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height - 2 * padding}
        cornerRadius={5}
        fill={fill ? colors.solitude : colors.white}
      />
      <Text
        width={width - 2 * padding}
        x={x + padding}
        y={y + padding}
        text={text}
        fill={"black"}
        fontSize={18}
        fontFamily="Calibri"
        align="center"
      />
    </Group>
  );
};

const SelectButton = ({ x, y, width, dropWidth, text, field }) => {
  const state = useAppStore();
  const [open, setOpen] = useState(false);
  const colors = config.colors;
  const { padding, height } = config.menu;

  const active = state[field];
  const options = config[field];
  const onSelect = (value) => {
    state.setValue(field, value);
  };

  return (
    <Group
      key={text}
      onPointerClick={(e) => {
        setOpen(!open);
      }}
    >
      <Rect
        x={x}
        y={y}
        width={width}
        height={height - 2 * padding}
        cornerRadius={5}
        fill={open ? colors.solitude : colors.white}
      />
      <Text
        width={width - 2 * padding}
        x={x + padding}
        y={y + padding}
        text={text}
        fill={"black"}
        fontSize={18}
        fontFamily="Calibri"
        align="center"
      />
      <SelectOptions
        x={x + (width - dropWidth) / 2}
        y={y + height}
        width={dropWidth}
        options={Object.values(options)}
        active={active}
        visible={open}
        onSelect={onSelect}
      />
    </Group>
  );
};

const SelectOptions = (props) => {
  const { x, y, width, options, onSelect, visible, active } = props;
  const { fontSize, padding, margin } = config.menu.dropdown;

  const buttonHeight = fontSize + padding * 2 + margin;
  return (
    <Group x={x} y={y} visible={visible}>
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
          width={width}
          text={option}
          active={option == active}
          onSelect={onSelect}
        />
      ))}
    </Group>
  );
};

const Option = ({ x, y, width, text, active, onSelect }) => {
  const rectRef = useRef(null);
  const { fontSize, padding, margin } = config.menu.dropdown;

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
        width={width - 2 * margin}
        text={text}
        align="center"
        fill={"black"}
        fontSize={fontSize}
        fontFamily="Calibri"
      />
    </Group>
  );
};

export default Menu;
