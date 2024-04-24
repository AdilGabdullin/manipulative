import { Line } from "react-konva";
import { useAppStore } from "../state/store";
import Beads from "./Beads";
import BeadGroups from "./BeadGroups";
import { numbersClose, setVisibility } from "../util";

export const rekenrekWidth = 900;
export const rekenrekHeight = 80;
export const strokeWidth1 = 8;
export const strokeWidth2 = 4;
export const blue = "green";
export const colors = {
  line: "#892201",
  red: { main: "#eb3424", highlight: "#fca8a4", shadow: "#d32f2f" },
  white: { main: "#ededed", highlight: "#d3d3d3", shadow: "#cdd4da" },
};

const Rekenrek = (props) => {
  const state = useAppStore();
  const { origin, beadNumber } = state;
  const beadRadius = 200 / beadNumber;
  const x = Math.round(props.x + origin.x);
  const y = Math.round(props.y + origin.y);
  const xMin = x + beadRadius + strokeWidth1;
  const xMax = x + rekenrekWidth - beadRadius - strokeWidth1;

  return (
    <>
      <Lines {...props} />
      <Beads {...props} xMin={xMin} xMax={xMax} x={x} y={y + props.height / 2} />
      <BeadGroups {...props} xMin={xMin} xMax={xMax} x={x} y={y - 8} />
    </>
  );
};

const Lines = (props) => {
  const state = useAppStore();
  const { origin, beadNumber } = state;
  const { id, width, height, locked } = props;

  const x = props.x + origin.x;
  const y = props.y + origin.y;

  let dragTargets = null;
  const getDragTargets = (e) => {
    if (dragTargets) return dragTargets;
    const stage = e.target.getStage();
    dragTargets = rekenrekTargets(id, beadNumber)
      .map((id) => {
        const node = stage.findOne("#" + id);
        if (!node) return null;
        return {
          node,
          x: node.x(),
          y: node.y(),
        };
      })
      .filter((t) => t !== null);
    return dragTargets;
  };

  const getDelta = (e) => {
    let dx = e.target.x() - x;
    let dy = e.target.y() - y;
    const shift = rekenrekHeight - 4;
    for (const element of Object.values(state.elements)) {
      if (element.type != "rekenrek" || element.id == id) continue;
      if (numbersClose(element.x, x + dx - origin.x) && numbersClose(element.y - shift, y + dy - origin.y)) {
        dx = element.x - x + origin.x;
        dy = element.y - y + origin.y - shift;
      }
      if (numbersClose(element.x, x + dx - origin.x) && numbersClose(element.y + shift, y + dy - origin.y)) {
        dx = element.x - x + origin.x;
        dy = element.y - y + origin.y + shift;
      }
    }
    return { dx, dy };
  };

  const onDragStart = (e) => {
    setVisibility(e, false);
  };

  const onDragMove = (e) => {
    const { dx, dy } = getDelta(e);
    for (const { node, x, y } of getDragTargets(e)) {
      if (node !== e.target) node.setAttrs({ x: x + dx, y: y + dy });
    }
  };

  const onDragEnd = (e) => {
    const { dx, dy } = getDelta(e);
    setVisibility(e, true);
    state.relocateElement(id, dx, dy);
  };

  const setLineStroke = (e, color) => {
    getDragTargets(e)
      .slice(0, 3)
      .forEach((target) => target.node.setAttr("stroke", color));
  };

  const onMouseEnter = (e) => {
    setLineStroke(e, blue);
  };

  const onMouseLeave = (e) => {
    setLineStroke(e, colors.line);
  };

  const onPointerClick = (e) => {
    state.selectIds([id], locked);
  };

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

      <Line
        x={x}
        y={y}
        points={[strokeWidth1 / 2, strokeWidth1 / 2, strokeWidth1 / 2, height - strokeWidth1 / 2]}
        strokeWidth={strokeWidth1 * 3}
        stroke={"#00000000"}
        draggable
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerClick={onPointerClick}
      />
      <Line
        x={x}
        y={y}
        points={[width - strokeWidth1 / 2, strokeWidth1 / 2, width - strokeWidth1 / 2, height - strokeWidth1 / 2]}
        strokeWidth={strokeWidth1 * 3}
        stroke={"#00000000"}
        draggable
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerClick={onPointerClick}
      />
      <Line
        x={x}
        y={y}
        points={[strokeWidth1 / 2, height / 2, width - strokeWidth1 / 2, height / 2]}
        strokeWidth={strokeWidth2 * 3}
        stroke={"#00000000"}
        draggable
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerClick={onPointerClick}
      />
    </>
  );
};

export function rekenrekTargets(id, beadNumber) {
  const ids = [`${id}-left-line`, `${id}-mid-line`, `${id}-right-line`];
  for (let i = 0; i < beadNumber; i += 1) {
    ids.push(`${id}-label-${i}`);
    for (let k = 0; k < 4; k += 1) {
      ids.push(`${id}-${i}-${k}`);
    }
  }
  return ids;
}

export default Rekenrek;
