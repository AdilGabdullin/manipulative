import { useAppStore } from "../state/store";
import Bead from "./Bead";
import { createBeadLabels } from "./BeadGroups";
import { colors } from "./Rekenrek";

const Beads = (props) => {
  const state = useAppStore();
  const { origin, beadNumber, showBeadGroups } = state;
  const beadRadius = 200 / beadNumber;
  const { id, xMin, xMax, y, beads, swap } = props;
  const d = beadRadius * 2;

  let nodes = null;
  const getNodes = (e) => {
    if (nodes) return nodes;
    const stage = e.target.getStage();
    nodes = [];
    for (let i = 0; i < beadNumber; i += 1) {
      nodes.push(stage.findOne(`#${id}-${i}`));
    }
    return nodes;
  };
  let labelNodes = null;
  const getLabelNodes = (e) => {
    if (labelNodes) return labelNodes;
    const stage = e.target.getStage();
    labelNodes = [];
    for (let i = 0; i < beadNumber; i += 1) {
      labelNodes.push(stage.findOne(`#${id}-label-${i}`));
    }
    return labelNodes;
  };

  const start = (i) => xMin + i * d;
  const stop = (i) => xMax - (beadNumber - 1 - i) * d;

  const onDragMove = (i) => (e) => {
    const nodes = getNodes(e);
    const x = Math.min(Math.max(e.target.x(), start(i)), stop(i));
    nodes[i].setAttrs({ x, y });
    for (let k = 0; k < i; k += 1) {
      nodes[k].setAttrs({ x: Math.min(nodes[k].x(), x - d * (i - k)) });
    }
    for (let k = i + 1; k < beadNumber; k += 1) {
      nodes[k].setAttrs({ x: Math.max(nodes[k].x(), x - d * (i - k)) });
    }
    if (showBeadGroups) {
      for (let k = 0; k < beadNumber; k += 1) {
        nodes[k].children[0].visible(nodes[k].x() < stop(k) - 2);
      }
      const labels = createBeadLabels(
        beadNumber,
        beadRadius,
        xMax,
        nodes.map((node) => node.x())
      );
      getLabelNodes(e).forEach((labelNode, i) => {
        labelNode.setAttrs(labels[i]);
      });
    }
  };
  const onDragEnd = (i) => (e) => {
    state.updateBeads(
      id,
      getNodes(e).map((node) => node.x() - origin.x)
    );
  };

  return (
    <>
      {beads.map((x, i) => {
        const isRed = i < 5 || (i >= 10 && i < 15);
        const color = (isRed && swap) || (!isRed && !swap) ? colors.red : colors.white;
        return (
          <Bead
            id={`${id}-${i}`}
            beadRadius={200 / beadNumber}
            name={`${id}-bead-${i}`}
            key={i}
            x={origin.x + x}
            y={y}
            color={color}
            onDragMove={onDragMove(i)}
            onDragEnd={onDragEnd(i)}
            stop={stop(i)}
          />
        );
      })}
    </>
  );
};

export default Beads;
