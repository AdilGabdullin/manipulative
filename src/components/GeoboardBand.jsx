import { Circle, Line } from "react-konva";
import { useAppStore } from "../state/store";
import { SEARCH_THRESHOLD, flattenPoints, isPointCloseToLine, pointsIsClose } from "../util";

export const bandPointRadius = 7;
const bandSideWidth = 7;

const GeoboardBand = ({ id, points, color }) => {
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
      />
      {points.map((point, pointIndex) => {
        const id = point.id;
        const x = origin.x + point.x;
        const y = origin.y + point.y;
        return (
          <Circle
            key={id}
            id={id}
            x={x}
            y={y}
            stroke={color}
            radius={bandPointRadius}
            fill={color}
          />
        );
      })}
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
