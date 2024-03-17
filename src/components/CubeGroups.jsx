import { Line, Text } from "react-konva";
import { useAppStore } from "../state/store";

const CubeGroups = ({ groups }) => {
  return (
    <>
      {groups.map((group, i) => (
        <CubeGroup key={i} group={group} />
      ))}
    </>
  );
};

const CubeGroup = ({ group }) => {
  return (
    <>
      <CubeGroupNumbers group={group} />
      <CubeGroupSum group={group} />
    </>
  );
};

const CubeGroupNumbers = ({ group }) => {
  const state = useAppStore();
  const { origin } = state;

  const numbers = [];
  let lastImage = null;
  let currentNumber = 0;
  for (const cube of group) {
    if (lastImage === null) {
      currentNumber++;
      lastImage = cube.image;
    } else if (cube.image === lastImage) {
      currentNumber++;
    } else {
      numbers.push(currentNumber);
      lastImage = cube.image;
      currentNumber = 1;
    }
  }
  numbers.push(currentNumber);

  const x = [];
  let left = 0;
  for (const n of numbers) {
    x.push(left + (n / 2) * 47 + origin.x + group[0].x);
    left += n * 47;
  }

  const y = group[0].y - 16 + origin.y;
  return (
    <>
      {numbers.map((n, i) => (
        <Text key={i} text={n} x={x[i]} y={y} stroke="black" fontSize={30} fontFamily="Arial" fill={"black"} />
      ))}
    </>
  );
};

const CubeGroupSum = ({ group }) => {
  const state = useAppStore();
  const { origin } = state;
  let { x: x1, y: y1, rotation } = group[0];
  let points;
  let { x: x2, y: y2 } = group[group.length - 1];
  let textPos;
  if (rotation) {
    x2 += 47;
    y1 += 75;
    points = [x1, y1 - 5, x1, y1, x2, y1, x2, y1 - 5];
    textPos = { x: (x1 + x2) / 2 + origin.x, y: y1 + origin.y };
  } else {
    x1 -= 25;
    y1 += 11;
    y2 += 55;
    points = [x1 + 5, y1, x1, y1, x1, y2, x1 + 5, y2];
    textPos = { x: x1 + origin.x, y: (y1 + y2) / 2 + origin.y };
  }

  points = addOrigin(points, origin);
  return (
    <>
      <Line points={points} stroke="black" strokeWidth={2} />
      <Text text={group.length} {...textPos} stroke="black" fontSize={30} fontFamily="Arial" fill={"black"} />
    </>
  );
};

function addOrigin(points, origin) {
  return points.map((value, i) => value + (i % 2 == 0 ? origin.x : origin.y));
}

export function createGroups(cubes) {
  const groups = [];

  for (const cube of Object.values(cubes)) {
    let inGroup = false;
    for (const group of groups) {
      if (cubeIsStartOfGroup(cube, group)) {
        group.unshift(cube);
        inGroup = true;
        continue;
      }
      if (cubeIsEndOfGroup(cube, group)) {
        group.push(cube);
        inGroup = true;
        continue;
      }
    }
    if (!inGroup) {
      groups.push([cube]);
    }
  }
  return groups.map(reverseIfVertical);
}

function reverseIfVertical(group) {
  return group[0].rotation == 1 ? group : group.toReversed();
}

function cubeIsStartOfGroup(cube, group) {
  return cube.rotation == 0 ? cube.y == group[0].y - 47 : cube.x == group[0].x - 47;
}

function cubeIsEndOfGroup(cube, group) {
  return cube.rotation == 0 ? cube.y == group[group.length - 1].y + 47 : cube.x == group[group.length - 1].x + 47;
}

export default CubeGroups;
