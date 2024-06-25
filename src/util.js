export const SEARCH_THRESHOLD = 6;
let id = 0;

export function newId() {
  return `e-${id++}`;
}

export function setNewId(initialId) {
  id = initialId;
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

export function isPointCloseToLine(point, line1, line2, dist = SEARCH_THRESHOLD) {
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
  return dx * dx + dy * dy < dist * dist;
}

export function numberBetween(x, a, b) {
  return (x >= a && x <= b) || (x <= a && x >= b);
}

export function numbersClose(a, b, sens = 12) {
  return Math.abs(a - b) < sens;
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
    .find(".popup-menu,.angle-measure,.drag-hidden")
    .forEach((node) => node.visible(value));
}

export function setVisibilityFrame(e, value) {
  e.target
    .getStage()
    .find(".popup-menu,.drag-hidden,#selected-frame")
    .forEach((node) => node.visible(value));
}

export function clearSelected(state) {
  if (state.selected.length > 0) {
    while (state.selected.pop()) {}
  }
}

export function elementBox(element) {
  switch (element.type) {
    case "text":
      return textBox(element);
      break;
    case "rect":
      return element;
      break;
    case "ellipse":
      return ellipseBox(element);
      break;
    case "line":
      return lineBox(element);
      break;
  }
  return element;
}

function textBox(element) {
  return element;
}

function ellipseBox(element) {
  const { x, y, radiusX, radiusY } = element;
  return { x: x - radiusX, y: y - radiusY, width: radiusX * 2, height: radiusY * 2 };
}

function lineBox(element) {
  const { x, y, x2, y2 } = element;
  const minX = Math.min(x, x + x2);
  const maxX = Math.max(x, x + x2);
  const minY = Math.min(y, y + y2);
  const maxY = Math.max(y, y + y2);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function cos(rotation) {
  return Math.cos((rotation / 180) * Math.PI);
}

export function sin(rotation) {
  return Math.sin((rotation / 180) * Math.PI);
}

export function atan2(y, x) {
  return (Math.atan2(y, x) / Math.PI) * 180;
}

export function rotateVector({ x, y }, rotation) {
  return { x: x * cos(rotation) - y * sin(rotation), y: x * sin(rotation) + y * cos(rotation) };
}

export function gcd(a, b) {
  if (!b) {
    return a;
  }
  return gcd(b, a % b);
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function combineBoxes(box1, box2) {
  const x = Math.min(box1.x, box2.x);
  const y = Math.min(box1.y, box2.y);
  return {
    x,
    y,
    width: Math.max(box1.x + box1.width, box2.x + box2.width) - x,
    height: Math.max(box1.y + box1.height, box2.y + box2.height) - y,
  };
}

export function combineBoxList(boxes) {
  return boxes.reduce(combineBoxes, boxes[0]);
}

export function arrayChunk(inputArray, perChunk) {
  return inputArray.reduce((all, one, i) => {
    const ch = Math.floor(i / perChunk);
    all[ch] = [].concat(all[ch] || [], one);
    return all;
  }, []);
}

export function sum(xs) {
  return xs.reduce((sum, x) => sum + x, 0);
}

export function avg(xs) {
  return sum(xs) / xs.length;
}
