import { Text } from "react-konva";
import { useAppStore } from "../state/store";
import { center, combineBoxList, numberBetween, pointInRect } from "../util";
import { config } from "../config";

const GroupLabels = ({}) => {
  const { elements, showLabels } = useAppStore();
  if (!showLabels) return null;
  const groups = createGroups(elements);
  return (
    <>
      {groups.map((group, i) => {
        const { x, y, width } = combineBoxList(group);
        return <GroupLabel key={i} x={x + width / 2} y={y - 30} text={group.length} color={group[0].fillColor} />;
      })}
    </>
  );
};

const GroupLabel = ({ x, y, text, color }) => {
  text = config.intl.format(text);
  const { origin } = useAppStore();
  const fontSize = 32;
  return (
    <Text
      name="drag-hidden"
      x={origin.x + x - text.length * 9}
      y={origin.y + y}
      text={text}
      fontSize={fontSize}
      fontFamily="Calibri"
      fill={color}
    />
  );
};

function createGroups(elements) {
  elements = Object.values(elements);
  let groups = [];
  const frames = elements.filter((e) => e.type == "frame");
  const inFrame = (tile) => frames.some((frame) => pointInRect(center(tile), frame));
  const tiles = elements.filter((e) => e.type == "tile" && !inFrame(e));
  for (const tile of tiles) {
    const mergeIndexes = [];
    for (const [index, group] of Object.entries(groups)) {
      for (const groupTile of group) {
        if (intersect(tile, groupTile) && tile.fillColor == groupTile.fillColor) {
          mergeIndexes.push(+index);
          break;
        }
      }
    }
    if (mergeIndexes.length == 0) {
      groups.push([tile]);
    } else {
      const mergedGroup = merge(mergeIndexes.map((i) => groups[i]));
      mergedGroup.push(tile);
      groups = removeIndexes(groups, mergeIndexes);
      groups.push(mergedGroup);
    }
  }
  return groups;
}

function merge(arrays) {
  return arrays.reduce((sum, arr) => sum.concat(arr), []);
}

function removeIndexes(array, indexes) {
  const result = [];
  array.forEach((x, i) => {
    if (!indexes.includes(i)) {
      result.push(x);
    }
  });
  return result;
}

function intersect({ x, y, width, height }, other) {
  x -= 1;
  y -= 1;
  width += 2;
  height += 2;
  return (
    (numberBetween(x, other.x, other.x + other.width) ||
      numberBetween(x + width, other.x, other.x + other.width) ||
      numberBetween(other.x, x, x + width) ||
      numberBetween(other.x + other.width, x, x + width)) &&
    (numberBetween(y, other.y, other.y + other.height) ||
      numberBetween(y + height, other.y, other.y + other.height) ||
      numberBetween(other.y, y, y + height) ||
      numberBetween(other.y + other.height, y, y + height))
  );
}

export default GroupLabels;
