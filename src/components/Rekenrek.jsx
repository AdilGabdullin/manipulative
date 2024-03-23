import { Circle, Line, Rect } from "react-konva";
import { useAppStore } from "../state/store";

export const rekenrekWidth = 900;
export const rekenrekHeight = 80;
export const strokeWidth1 = 8;
export const strokeWidth2 = 4;
export const ballRadius = 20;
const beadNumber = 10;

const colors = {
  line: "#54575a",
  red: { main: "#f44336", highlight: "#ffffff", shadow: "#d32f2f" },
  white: { main: "#fafafa", highlight: "#bdbdbd", shadow: "#cdd4da" },
  blue: "#3296f3",
};

const Rekenrek = (props) => {
  const state = useAppStore();
  const { origin, fdMode } = state;
  const { id, width, height, locked, positions } = props;

  const x = props.x + origin.x;
  const y = props.y + origin.y;

  return (
    <>
      {/* <Rect id={id} x={origin.x + x} y={origin.y + y} width={width} height={height} stroke={lineColor} /> */}
      <Lines id={id} {...props} />
      <Beads id={id} xMin={xMin(x)} xMax={xMax(x)} y={y + height / 2} positions={positions.map((x) => x)} />
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

const Beads = (props) => {
  const state = useAppStore();
  const { origin, fdMode } = state;
  const { id, xMin, xMax, y, positions } = props;

  const d = ballRadius * 2;

  let nodes = null;
  const getNodes = (e) => {
    if (!nodes) {
      const stage = e.target.getStage();
      nodes = [];
      for (let i = 0; i < beadNumber; i += 1) {
        nodes.push(stage.findOne(`#${id}-bead-${i}`));
      }
    }
    return nodes;
  };

  const detectCollisions = (nodes, i) => {
    nodes[i].setAttrs({
      x: Math.min(Math.max(nodes[i].x(), xMin + i * d), xMax - (beadNumber - 1 - i) * d),
      y: y,
    });
    for (let k = i - 1; k >= 0; k -= 1) {
      nodes[k].x(Math.min(nodes[k].x(), nodes[k + 1].x() - d));
    }
    for (let k = i + 1; k < beadNumber; k += 1) {
      nodes[k].x(Math.max(nodes[k].x(), nodes[k - 1].x() + d));
    }
  };

  const onDragStart = (i) => (e) => {};
  const onDragMove = (i) => (e) => {
    const nodes = getNodes(e);
    detectCollisions(nodes, i);
  };
  const onDragEnd = (i) => (e) => {};

  return (
    <>
      {positions.map((x, i) => (
        <Bead
          id={`${id}-bead-${i}`}
          key={i}
          x={origin.x + x}
          y={y}
          color={i < 5 ? colors.red : colors.white}
          onDragStart={onDragStart(i)}
          onDragMove={onDragMove(i)}
          onDragEnd={onDragEnd(i)}
        />
      ))}
    </>
  );
};

const Bead = (props) => {
  const { id, x, y, color, onDragStart, onDragMove, onDragEnd } = props;
  return (
    <>
      <Circle
        id={id}
        x={x}
        y={y}
        fill={color.main}
        stroke={color.shadow}
        radius={ballRadius - 0.9}
        draggable
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      />
    </>
  );
};

function xMin(x) {
  return x + ballRadius + strokeWidth1;
}

function xMax(x) {
  return x + rekenrekWidth - ballRadius - strokeWidth1;
}

export function initialPositions(x) {
  if (beadNumber == 10) return [-9, -8, -7, -6, -5, -4, -3, -2, -1, 0].map((shift) => xMax(x) + shift * ballRadius * 2);
}
export default Rekenrek;
