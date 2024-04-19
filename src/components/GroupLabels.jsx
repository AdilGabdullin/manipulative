import { Text } from "react-konva";
import { useAppStore } from "../state/store";
import { combineBoxList, numberBetween } from "../util";
import config from "../config";

const GroupLabels = ({}) => {
  const { elements, showLabels, numberSet } = useAppStore();
  if (!showLabels) return null;
  const groups = [];

  for (const block of Object.values(elements).toSorted((a, b) => a.x + a.y - b.x - b.y)) {
    if (block.type != "block") continue;
    let inGroup = false;
    for (const group of groups) {
      if (inGroup) break;
      for (const groupBlock of group) {
        if (intersect(block, groupBlock)) {
          group.push(block);
          inGroup = true;
          break;
        }
      }
    }
    if (!inGroup) {
      groups.push([block]);
    }
  }

  return (
    <>
      {groups.map((group, i) => {
        const { x, y, width } = combineBoxList(group.map(addTopRight));
        let sum = group.reduce((sum, block) => sum + parseInt(block.label), 0);
        if (numberSet == config.numberSet.decimal) sum = sum / 100;
        return <GroupLabel key={i} x={x + width / 2} y={y - 30} text={sum} />;
      })}
    </>
  );
};

const GroupLabel = ({ x, y, text }) => {
  text = config.intl.format(text);
  const { origin } = useAppStore();
  const fontSize = 24;
  return (
    <Text
      name="drag-hidden"
      x={origin.x + x - text.length * 6}
      y={origin.y + y}
      text={text}
      fontSize={fontSize}
      fontFamily="Calibri"
      fill="black"
    />
  );
};

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

function addTopRight(block) {
  const scale = config.block.size;
  const { x, y, width, height, top, right } = block;
  return { x: x, y: y - top, width: width + right, height: height + top };
}

export default GroupLabels;
