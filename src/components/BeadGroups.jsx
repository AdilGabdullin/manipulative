import { Text } from "react-konva";
import { avg } from "../util";
import { blue } from "./Rekenrek";
import { useAppStore } from "../state/store";

const beadRadius = 20;

const BeadGroups = (props) => {
  const state = useAppStore();
  const { origin, beadNumber } = state;
  const { id, x, xMax, y, beads } = props;
  const labels = createBeadLabels(beadNumber, xMax - origin.x - x, beads, origin.x);
  return (
    <>
      {labels.map((label, i) => {
        return (
          <Text
            {...label}
            id={`${id}-label-${i}`}
            key={i}
            y={y}
            stroke={blue}
            fill={blue}
            fontSize={30}
            fontFamily="Calibri"
          />
        );
      })}
    </>
  );
};

export function createBeadLabels(beadNumber, xMax, xs, baseX = 0) {
  const groups = [];
  let group = [];
  for (let i = 0; i < beadNumber; i += 1) {
    if (group.length == 0) {
      group.push(xs[i]);
      continue;
    }
    const current = group[group.length - 1];
    if (xs[i] - beadRadius * 2 == current) {
      group.push(xs[i]);
    } else {
      groups.push(group);
      group = [xs[i]];
    }
  }

  if (group[group.length - 1] - xMax + baseX + (beadNumber - 10) * beadRadius * 2 < 0) {
    groups.push(group);
  }
  const labels = [];
  for (let i = 0; i < beadNumber; i += 1) {
    const group = groups[i];
    if (group != undefined) {
      labels.push({ text: group.length, x: baseX + avg(group) - 8, visible: true });
    } else {
      labels.push({ visible: false });
    }
  }
  return labels;
}

export default BeadGroups;
