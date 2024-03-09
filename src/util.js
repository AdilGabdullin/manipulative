export const SEARCH_THRESHOLD = 6;
let id = 0;

export function newId() {
  return (id++).toString();
}

export function pointsIsClose(pos1, pos2, sens = 10) {
  return distance2(pos1, pos2) <= sens ** 2;
}

export function distance2(pos1, pos2) {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return dx * dx + dy * dy;
}

export function getStageXY(stage, state) {
  const { x, y } = stage.getPointerPosition();
  const { scale, offset, origin } = state;
  return { x: x / scale + offset.x - origin.x, y: y / scale + offset.y - origin.y };
}

export function isPointCloseToLine(point, line1, line2) {
  const { x, y } = point;
  const x1 = line1.x;
  const y1 = line1.y;
  const x2 = line2.x;
  const y2 = line2.y;
  let A = x - x1;
  let B = y - y1;
  let C = x2 - x1;
  let D = y2 - y1;
  let dot = A * C + B * D;
  let len_sq = C * C + D * D;
  let param = -1;
  if (len_sq != 0)
    //in case of 0 length line
    param = dot / len_sq;
  let xx, yy;
  const threshold = 7 / Math.sqrt(distance2(line1, line2));
  if (param < threshold) {
    return false;
  } else if (param > 1 - threshold) {
    return false;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  let dx = x - xx;
  let dy = y - yy;
  return dx * dx + dy * dy < SEARCH_THRESHOLD * SEARCH_THRESHOLD;
}

export function flattenPoints(points, originX, originY) {
  const result = [];
  for (let i = 0; i < points.length; i += 1) {
    result.push(points[i].x + originX, points[i].y + originY);
  }
  return result;
}

export function numberBetween(x, a, b) {
  return (x >= a && x <= b) || (x <= a && x >= b);
}
