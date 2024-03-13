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

function vectorMagnitude(vector) {
  return Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
}

function dotProduct(vector1, vector2) {
  return vector1[0] * vector2[0] + vector1[1] * vector2[1];
}

function angleBetweenVectors(A, B, C) {
  const vector1 = [A.x - B.x, A.y - B.y];
  const vector2 = [C.x - B.x, C.y - B.y];
  const mag1 = vectorMagnitude(vector1);
  const mag2 = vectorMagnitude(vector2);
  const dot = dotProduct(vector1, vector2);
  if (mag1 === 0 || mag2 === 0) {
    console.error("Invalid angle");
    return NaN;
  }
  const cosTheta = dot / (mag1 * mag2);
  const theta = (Math.acos(cosTheta) * 180) / Math.PI;
  const sinTheta = vector1[0] * vector2[1] - vector1[1] * vector2[0];
  const sign = Math.sign(sinTheta);
  return theta * sign;
}

export function getArcAngles(A, B, C, isClockwise) {
  const angle = angleBetweenVectors(A, B, C) * (isClockwise ? 1 : -1);
  const rotation = angleBetweenVectors({ x: 1000, y: B.y + 0.001 }, B, C) - angle * (isClockwise ? 1 : 0);
  const lv = [A.x + C.x - 2 * B.x, A.y + C.y - 2 * B.y];
  const mag = vectorMagnitude(lv) * Math.sign(angle);
  return { angle, rotation: rotation, labelVector: { x: lv[0] / mag, y: lv[1] / mag } };
}

export function checkClockwise(points) {
  let area = 0;
  let j = points.length - 1;
  for (let i = 0; i < points.length; i++) {
    area += (points[j].x + points[i].x) * (points[j].y - points[i].y);
    j = i;
  }
  return area > 0.0;
}

export function setVisibility(e, value) {
  e.target
    .getStage()
    .find(".popup-menu,.angle-measure")
    .forEach((node) => node.visible(value));
}

export function clearSelected(state) {
  if (state.selected.length > 0) {
    while (state.selected.pop()) {}
  }
}
