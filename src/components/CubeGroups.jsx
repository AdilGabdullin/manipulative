import { Line, Text } from "react-konva";
import { useAppStore } from "../state/store";

const CubeGroups = ({cubes}) => {
  const groups = createGroups(cubes);

  return (
    <>
      {groups[1].map((group, i) => (
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
        <Text text={n} x={x[i]} y={y} stroke="black" fontSize={30} fontFamily="Arial" fill={"black"} />
      ))}
    </>
  );
};

const CubeGroupSum = ({ group }) => {
  const state = useAppStore();
  const { origin } = state;
  const x = group[0].x;
  const y = group[0].y + 75;
  const x2 = group[group.length - 1].x + 47;
  return (
    <>
      <Line points={addOrigin([x, y - 5, x, y, x2, y, x2, y - 5], origin)} stroke="black" strokeWidth={2} />
      <Text text={group.length} x={(x + x2) / 2+ origin.x} y={y+ origin.y} stroke="black" fontSize={30} fontFamily="Arial" fill={"black"} />
    </>
  );
};

function addOrigin(points, origin) {
  return points.map((value, i) => value + (i % 2 == 0 ? origin.x : origin.y));
}

export function createGroups(cubes) {
  const groups = [[], []];

  for (const cube of Object.values(cubes)) {
    let inGroup = false;
    for (const group of groups[cube.rotation]) {
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
      groups[cube.rotation].push([cube]);
    }
  }
  return groups;
}

function cubeIsStartOfGroup(cube, group) {
  return cube.x == group[0].x - 47;
}

function cubeIsEndOfGroup(cube, group) {
  return cube.x == group[group.length - 1].x + 47;
}

export default CubeGroups;
