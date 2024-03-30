import { Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { leftToolbarWidth } from "./LeftToolbar";
import BrushMenu from "./BrushMenu";
import { Fragment } from "react";
import MinMaxDropdown from "./MinMaxDropdown";

export const menuHeight = 50;

const Menu = () => {
  const state = useAppStore();
  const { width, fdMode, minValue, maxValue, maxValueDropdown, minValueDropdown } = state;
  const x = leftToolbarWidth;
  const y = 0;
  return (
    <>
      <Line id="bottom-menu-line" points={[x, y + menuHeight, width, y + menuHeight]} stroke="#c0c0c0" />
      <Rect id="bottom-menu-rect" fill="#ffffff" x={x} y={y} width={width} height={menuHeight} />
      {fdMode ? (
        <BrushMenu x={x} y={y} height={menuHeight} />
      ) : (
        <>
          <DefaultMenu x={x} y={y} height={menuHeight} width={width - leftToolbarWidth} />
          <MinMaxDropdown
            options={[1_000_000, 100_000, 10_000, 1000, 100, 10]}
            active={maxValue}
            visible={maxValueDropdown}
            onSelect={(value) => {
              state.selectMinMax("maxValue", value);
            }}
          />
          <MinMaxDropdown
            options={[0.1, 0.01, 0.001]}
            active={minValue}
            visible={minValueDropdown}
            onSelect={(value) => {
              state.selectMinMax("minValue", value);
            }}
          />
        </>
      )}
    </>
  );
};

const DefaultMenu = (props) => {
  const state = useAppStore();
  const { x, y } = props;

  let buttons = [
    {
      text: "Whole Numbers",
      fill: state.mode == "Whole Numbers",
      width: 118,
      shift: 0,
      show: true,
      onPointerClick: () => state.setMode("Whole Numbers"),
    },
    {
      text: "Decimals",
      fill: state.mode == "Decimals",
      width: 65,
      shift: 35,
      show: true,
      onPointerClick: () => state.setMode("Decimals"),
    },
    {
      text: "Maximum",
      fill: false,
      width: 60,
      shift: 10,
      show: state.mode == "Whole Numbers",
      onPointerClick: (e) => state.toggle("maxValueDropdown"),
    },
    {
      text: "Minimum",
      fill: false,
      width: 65,
      shift: -100,
      show: state.mode == "Decimals",
      onPointerClick: () => state.toggle("minValueDropdown"),
    },
  ];
  const padding = 8;
  const buttonHeight = 20;
  const buttonWidth = 110;

  return (
    <>
      {buttons.map(({ text, show, width, shift, fill, onPointerClick }, i) => {
        return (
          show && (
            <Fragment key={text}>
              <Rect
                x={x + padding + buttonWidth * i + shift}
                y={y + padding}
                width={width + padding * 2}
                height={buttonHeight + padding * 2}
                cornerRadius={5}
                fill={fill ? "#e8f4fe" : "#ffffff"}
                onPointerClick={onPointerClick}
              />
              <Text
                x={x + padding * 2 + buttonWidth * i + shift}
                y={y + padding * 2}
                text={text}
                fill={"black"}
                fontSize={18}
                fontFamily="Calibri"
                onPointerClick={onPointerClick}
              />
            </Fragment>
          )
        );
      })}
    </>
  );
};

export default Menu;
