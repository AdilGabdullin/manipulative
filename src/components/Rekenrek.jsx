import { Line } from "react-konva";
import { useAppStore } from "../state/store";
import Beads from "./Beads";
import BeadGroups from "./BeadGroups";

export const rekenrekWidth = 900;
export const rekenrekHeight = 80;
export const strokeWidth1 = 8;
export const strokeWidth2 = 4;
export const beadRadius = 20;
export const beadNumber = 10;

export const blue = "#3296f3";
export const colors = {
  line: "#54575a",
  red: { main: "#f44336", highlight: "#ffffff", shadow: "#d32f2f" },
  white: { main: "#fafafa", highlight: "#bdbdbd", shadow: "#cdd4da" },
};

const Rekenrek = (props) => {
  const state = useAppStore();
  const { origin } = state;
  const { id, width, height, locked, beads } = props;

  const x = props.x + origin.x;
  const y = props.y + origin.y;

  return (
    <>
      <Lines {...props} />
      <Beads {...props} xMin={xMin(x)} xMax={xMax(x)} x={x} y={y + height / 2} />
      <BeadGroups {...props} xMin={xMin(x)} xMax={xMax(x)} x={x} y={y - 8} />
    </>
  );
};

const Lines = (props) => {
  const state = useAppStore();
  const { origin, fdMode } = state;
  const { id, width, height, locked } = props;

  const x = props.x + origin.x;
  const y = props.y + origin.y;

  return (
    <>
      <Line
        id={id + "-left-line"}
        x={x}
        y={y}
        points={[strokeWidth1 / 2, strokeWidth1 / 2, strokeWidth1 / 2, height - strokeWidth1 / 2]}
        lineCap="round"
        lineJoin="round"
        stroke={colors.line}
        strokeWidth={strokeWidth1}
      />
      <Line
        id={id + "-mid-line"}
        x={x}
        y={y}
        points={[width - strokeWidth1 / 2, strokeWidth1 / 2, width - strokeWidth1 / 2, height - strokeWidth1 / 2]}
        lineCap="round"
        lineJoin="round"
        stroke={colors.line}
        strokeWidth={strokeWidth1}
      />
      <Line
        id={id + "-right-line"}
        x={x}
        y={y}
        points={[strokeWidth1 / 2, height / 2, width - strokeWidth1 / 2, height / 2]}
        stroke={colors.line}
        strokeWidth={strokeWidth2}
      />
    </>
  );
};

function xMin(x) {
  return x + beadRadius + strokeWidth1;
}

function xMax(x) {
  return x + rekenrekWidth - beadRadius - strokeWidth1;
}

export function initialBeads(x) {
  if (beadNumber == 10) return [-9, -8, -7, -6, -5, -4, -3, -2, -1, 0].map((shift) => xMax(x) + shift * beadRadius * 2);
}

export function rekenrekTargets(id) {
  return [`${id}-left-line`, `${id}-mid-line`, `${id}-right-line`];
}

export default Rekenrek;
