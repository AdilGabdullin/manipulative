import { Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { colors, config } from "../config";
import { center, pointInRect } from "../util";

const PartPartWhole = () => {
  const state = useAppStore();
  const { origin } = state;
  const { width, height } = getPPWSize(state);
  const round = Math.round;
  const color = colors.darkGrey;

  const tiles = Object.values(state.elements).filter((e) => e.type == "tile");
  const top = { x: -width / 2, y: -height / 2, width: width, height: height / 2 };
  const left = { x: -width / 2, y: 0, width: width / 2, height: height / 2 };
  const right = { x: 0, y: 0, width: width / 2, height: height / 2 };

  const whole = tiles.filter((t) => pointInRect(center(t), top)).length;
  const part1 = tiles.filter((t) => pointInRect(center(t), left)).length;
  const part2 = tiles.filter((t) => pointInRect(center(t), right)).length;

  return (
    <Group x={round(origin.x - width / 2)} y={round(origin.y - height / 2)}>
      <Rect width={width} height={height} stroke={color} />
      <Line x={0} y={height / 2} points={[0, 0, width, 0]} stroke={color} />
      <Line x={width / 2} y={height / 2} points={[0, 0, 0, height / 2]} stroke={color} />
      {state.showSummary && (
        <>
          <Sum x={0} y={height / 2 - 46} text={whole.toString()} width={width} />
          <Sum x={0} y={height - 46} text={part1.toString()} width={width / 2} />
          <Sum x={width / 2} y={height - 46} text={part2.toString()} width={width / 2} />
        </>
      )}
    </Group>
  );
};

const Sum = (props) => {
  return <Text {...props} fontSize={44} fontFamily="Calibri" align="center" fill={colors.blue} />;
};

export function getPPWSize(state) {
  return {
    width: state.width * 0.6,
    height: state.height - config.menu.height - 50,
  };
}

export default PartPartWhole;
