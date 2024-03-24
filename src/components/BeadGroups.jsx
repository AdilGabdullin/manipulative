import { Text } from "react-konva";
import { avg } from "../util";
import { beadNumber, beadRadius, blue } from "./Rekenrek";
import { useAppStore } from "../state/store";

const BeadGroups = (props) => {
  const state = useAppStore();
  const { origin } = state;
  const { id, x, y, beads } = props;
  const groups = createGroups(beads);
  return (
    <>
      {groups.map((xs, i) => {
        console.log(xs.length, avg(xs), y);
        return (
          <Text
            key={i}
            text={xs.length}
            x={origin.x + avg(xs) - 8}
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

function createGroups(beads) {
  const result = [];
  let group = [];
  for (let i = 0; i < beadNumber; i += 1) {
    if (group.length == 0) {
      group.push(beads[i]);
      continue;
    }
    const current = group[group.length - 1];
    if (beads[i] - beadRadius * 2 == current) {
      group.push(beads[i]);
    } else {
      result.push(group);
      group = [beads[i]];
    }
  }
  return result;
}

export default BeadGroups;
