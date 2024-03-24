import { Line, Text } from "react-konva";
import { useAppStore } from "../state/store";

const CubeGroups = ({ groups }) => {
  return (
    <>
      {groups.map((group, i) => (
        <CubeGroup key={group[0].id + "-group"} group={group} />
      ))}
    </>
  );
};

const CubeGroup = ({ group }) => {
  const numbers = [];
  const colors = [];
  let lastImage = null;
  let currentNumber = 0;
  for (const cube of group) {
    if (lastImage === null) {
      currentNumber++;
      lastImage = cube.image;
      colors.push(cube.color);
    } else if (cube.image === lastImage) {
      currentNumber++;
    } else {
      numbers.push(currentNumber);
      lastImage = cube.image;
      colors.push(cube.color);
      currentNumber = 1;
    }
  }
  numbers.push(currentNumber);

  return (
    <>
      <CubeGroupNumbers group={group} numbers={numbers} colors={colors} />
      {numbers.length > 1 && <CubeGroupSum group={group} />}
    </>
  );
};

const CubeGroupNumbers = ({ group, numbers, colors }) => {
  const state = useAppStore();
  const { origin } = state;
  const x = [];
  const y = [];
  let shift = 0;
  const rotation = group[0].rotation;

  for (const n of numbers) {
    if (rotation) {
      x.push(shift + (n / 2) * 47 + group[0].x - 4);
      y.push(group[0].y - 27);
      shift += n * 47;
    } else {
      x.push(group[0].x + 62);
      y.push(-shift - (n / 2) * 47 + group[0].y + 43);
      shift += n * 47;
    }
  }
  return (
    <>
      {numbers.map((n, i) => (
        <Text
          name="cube-group"
          key={i}
          text={n}
          x={origin.x + x[i]}
          y={origin.y + y[i]}
          stroke={colors[i]}
          fill={colors[i]}
          fontSize={30}
          fontFamily="Calibri"
        />
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
    x1 += 2;
    x2 += 47;
    y1 += 75;
    points = [x1, y1 - 8, x1, y1, x2, y1, x2, y1 - 8];
    textPos = { x: (x1 + x2) / 2 + origin.x - 7, y: y1 + origin.y + 4 };
    if (group.length >= 10) {
      textPos.x -= 10;
    }
  } else {
    x1 -= 18;
    y1 += 11 + 47;
    y2 += 56 - 47;
    points = [x1 + 8, y1, x1, y1, x1, y2, x1 + 8, y2];
    textPos = { x: x1 + origin.x - 20, y: (y1 + y2) / 2 + origin.y - 10 };
    if (group.length >= 10) {
      textPos.x -= 16;
    }
  }

  points = addOrigin(points, origin);
  return (
    <>
      <Line name="cube-group" points={points} stroke={"#56544d"} strokeWidth={2} lineJoin="round" lineCap="round" />
      <Text
        name="cube-group"
        text={group.length}
        {...textPos}
        stroke={"#56544d"}
        fill={"#56544d"}
        fontSize={30}
        fontFamily="Calibri"
      />
    </>
  );
};

function addOrigin(points, origin) {
  return points.map((value, i) => value + (i % 2 == 0 ? origin.x : origin.y));
}

export function createGroups(cubes) {
  const groups = [];

  for (const cube of Object.values(cubes)) {
    if (cube.type != "cube") continue;
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
  const { x, y, rotation } = group[0];
  return (
    cube.rotation == rotation &&
    (cube.rotation == 0 ? cube.y == y - 47 && cube.x == x : cube.x == x - 47 && cube.y == y)
  );
}

function cubeIsEndOfGroup(cube, group) {
  const { x, y, rotation } = group[group.length - 1];
  return (
    cube.rotation == rotation &&
    (cube.rotation == 0 ? cube.y == y + 47 && cube.x == x : cube.x == x + 47 && cube.y == y)
  );
}

export default CubeGroups;
