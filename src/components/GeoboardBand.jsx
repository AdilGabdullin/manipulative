import { Arc, Circle, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import {
  SEARCH_THRESHOLD,
  checkClockwise,
  flattenPoints,
  getArcAngles,
  isPointCloseToLine,
  pointsIsClose,
} from "../util";
import { Fragment, useEffect, useRef, useState } from "react";

export const bandPointRadius = 7;
const bandSideWidth = 7;

const GeoboardBand = ({ id, points, color, fill, measures }) => {
  const state = useAppStore();
  const { origin } = state;
  const sidesId = `${id}-sides`;
  const flatPoints = flattenPoints(points, origin.x, origin.y);
  return (
    <>
      <Line
        id={sidesId}
        points={flatPoints}
        stroke={color}
        lineJoin="round"
        lineCap="round"
        closed={true}
        strokeWidth={bandSideWidth}
        fill={fill ? color + "50" : null}
      />
      {points.map((point) => {
        const id = point.id;
        const x = origin.x + point.x;
        const y = origin.y + point.y;
        return <Circle key={id} id={id} x={x} y={y} stroke={color} radius={bandPointRadius} fill={color} />;
      })}
      {measures && <Angles bandId={id} points={points} color={color} />}
    </>
  );
};

const Angles = ({ bandId, points, color }) => {
  const state = useAppStore();
  const { origin } = state;
  const length = points.length;
  const isClockwise = checkClockwise(points);
  points = [points[length - 1], ...points, points[0]];
  const arcs = [];
  for (let i = 1; i < length + 1; i += 1) {
    arcs.push({
      name: "angle-measure",
      x: origin.x + points[i].x,
      y: origin.y + points[i].y,
      ...getArcAngles(points[i - 1], points[i], points[i + 1], isClockwise),
    });
  }
  return (
    <>
      {arcs.map((props, i) => {
        const { x, y, angle, labelVector } = props;
        return (
          <Fragment key={`${bandId}-${i}`}>
            <Arc
              name={"angle-measure"}
              {...props}
              innerRadius={40}
              outerRadius={42}
              stroke={color}
              fill={color}
              strokeWidth={2}
            />
            <AngleValue x={x + labelVector.x * 50} y={y + labelVector.y * 50} angle={angle < 0 ? 360 + angle : angle} />
          </Fragment>
        );
      })}
    </>
  );
};

const AngleValue = ({ x, y, angle }) => {
  const [size, setSize] = useState([0, 0]);
  useEffect(() => {
    const node = ref.current;
    if (node && size[0] != node.width()) {
      setSize([node.width(), node.height()]);
    }
  });
  const width = size[0] + 20;
  const height = 24;
  const ref = useRef(null);
  return (
    <>
      <Rect
        name={"angle-measure"}
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        fill={"#4a4a4a"}
        cornerRadius={8}
        visible={size[0]}
      />
      <Text
        ref={ref}
        name={"angle-measure"}
        text={Math.round(angle).toString() + "°"}
        x={x - size[0] / 2}
        y={y - size[1] / 2}
        fill={"#ffffff"}
        fontSize={18}
        visible={size[0]}
      />
    </>
  );
};

export function bandPointSearch(state, downPos) {
  for (const band of state.geoboardBands) {
    for (const [pointIndex, point] of band.points.entries()) {
      if (!point.locked && pointsIsClose(point, downPos, bandPointRadius + SEARCH_THRESHOLD)) {
        return {
          type: "band-point",
          band,
          pointIndex,
          nodes: [point.id, `${band.id}-sides`],
        };
      }
    }
  }
  return null;
}

export function bandSideSearch(state, downPos) {
  for (const band of state.geoboardBands) {
    const points = band.points;
    const length = points.length;
    for (let i = 0; i < length - 1; i += 1) {
      if (isPointCloseToLine(downPos, points[i], points[i + 1])) {
        return {
          type: "band-side",
          band,
          sideIndex: i,
          nodes: [`${band.id}-sides`],
        };
      }
    }
    if (isPointCloseToLine(downPos, points[length - 1], points[0])) {
      return {
        type: "band-side",
        band,
        sideIndex: length - 1,
        nodes: [`${band.id}-sides`],
      };
    }
  }
  return null;
}

export function bandPointMove(dragTarget, movePos, originX, originY) {
  dragTarget.nodes[0].setAttrs({ x: movePos.x + originX, y: movePos.y + originY });
  const points = flattenPoints(dragTarget.band.points, originX, originY);
  points[dragTarget.pointIndex * 2] = movePos.x + originX;
  points[dragTarget.pointIndex * 2 + 1] = movePos.y + originY;
  dragTarget.nodes[1].setAttrs({ points });
}

export function bandSideMove(dragTarget, movePos, origin) {
  const { x, y } = movePos;
  const { band, sideIndex } = dragTarget;
  const points = flattenPoints(band.points, origin.x, origin.y);
  const before = points.slice(0, (sideIndex + 1) * 2);
  const after = points.slice((sideIndex + 1) * 2);
  dragTarget.nodes[0].setAttrs({ points: [...before, x + origin.x, y + origin.y, ...after] });
}

export default GeoboardBand;
