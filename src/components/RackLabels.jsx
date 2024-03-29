import { Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { blue, rekenrekHeight, strokeWidth1 } from "./Rekenrek";
import { Fragment } from "react";
import { sum } from "../util";

const margin = 12;
const width = 20;
const shift = 5;
const fontSize = 26;

const RackLabels = () => {
  const { elements, origin, beadNumber, showRackGroups } = useAppStore();
  if (!showRackGroups) return null;

  const beadRadius = 200 / beadNumber;
  const racks = Object.values(elements).filter((e) => e.type == "rekenrek");
  const groups = createGroups(racks, beadRadius);

  return (
    <>
      {groups.map((group, i) => {
        const { x, start, end, text, showLine } = group;
        return (
          <Fragment key={i}>
            {showLine && (
              <Line
                name="drag-hidden"
                x={origin.x + x}
                y={origin.y + start}
                points={[width, 0, 0, 0, 0, end - start, width, end - start]}
                stroke={blue}
              />
            )}
            <Rect
              name="drag-hidden"
              x={origin.x + x - fontSize / (text > 9 ? 2 : 4)}
              y={origin.y + (start + end - fontSize) / 2 - 5}
              width={fontSize}
              height={fontSize + 10}
              fill={"white"}
            />
            <Text
              name="drag-hidden"
              x={origin.x + x - fontSize / (text > 9 ? 2 : 4)}
              y={origin.y + (start + end - fontSize) / 2}
              text={text}
              fontFamily="Calibri"
              stroke={"#56544d"}
              fill={"#56544d"}
              fontSize={fontSize}
            />
          </Fragment>
        );
      })}
    </>
  );
};

function close(a, b) {
  return Math.abs(a - b) < 1;
}

function createGroups(racks, beadRadius) {
  racks = racks.toSorted((a, b) => a.y - b.y);
  const isStartOfGroup = (rack, group) => {
    const { x, y } = group[0];
    return close(rack.x, x) && close(rack.y, y - (rekenrekHeight - 4));
  };
  const isEndOfGroup = (rack, group) => {
    const { x, y } = group[group.length - 1];
    return close(rack.x, x) && close(rack.y, y + (rekenrekHeight - 4));
  };
  const groups = [];
  for (const rack of racks) {
    let newGroup = true;
    for (const i in groups) {
      if (isStartOfGroup(rack, groups[i])) {
        groups[i].unshift(rack);
        newGroup = false;
      }
      if (isEndOfGroup(rack, groups[i])) {
        groups[i].push(rack);
        newGroup = false;
      }
    }
    if (newGroup) {
      groups.push([rack]);
    }
  }
  return groups.map((group) => {
    const x = group[0].x - margin - width;
    const start = group[0].y + shift;
    const end = group[group.length - 1].y + rekenrekHeight - shift;
    const text = sum(group.map((rack) => countLeftBeads(rack, beadRadius)));
    const showLine = group.length > 1;
    return { x, start, end, text, showLine };
  });
}

function countLeftBeads(rack, beadRadius) {
  const xMin = rack.x + beadRadius + strokeWidth1;
  let result = 0;
  for (const i in rack.beads) {
    if (Math.abs(xMin + i * beadRadius * 2 - rack.beads[i]) < 1) {
      result += 1;
    }
  }
  return result;
}

export default RackLabels;
