import { Rect } from "react-konva";
import { setVisibility } from "../util";
import { gridStep, useAppStore } from "../state/store";

const ResizeHandle = ({ frameProps, element }) => {
  const state = useAppStore();
  const { updateElement, scale } = state;
  const { x, y, width, height } = frameProps;
  const isHorizontal = element.height == gridStep - 2;
  const handleWidth = isHorizontal ? height / 5 : width / 2;
  const handleHeight = isHorizontal ? height / 2 : width / 5;
  const handleX = isHorizontal ? x + width - handleWidth / 2 : x + width / 2 - handleWidth / 2;
  const handleY = isHorizontal ? y + height / 2 - handleHeight / 2 : y - handleHeight / 2;

  const findOne = (e, id) => e.target.getStage().findOne("#" + id);
  const onDragStart = (e) => {
    setVisibility(e, false);
  };
  const onDragMove = (e) => {
    const handle = e.target;
    const step = (gridStep / 2) * scale;
    if (isHorizontal) {
      let dx = handle.x() - handleX;
      dx = Math.round(dx / step) * step;
      dx = Math.max(dx, (step / scale - element.width) * scale);
      handle.setAttrs({ x: handleX + dx, y: handleY });
      findOne(e, "selected-frame").setAttr("width", width + dx);
      findOne(e, element.id).setAttr("width", element.width + dx / scale);
    } else {
      let dy = handle.y() - handleY;
      dy = Math.round(dy / step) * step;
      if (element.height - dy / scale < step / scale) {
        dy = (element.height - step / scale) * scale;
      }
      handle.setAttrs({ x: handleX, y: handleY + dy });
      findOne(e, "selected-frame").setAttrs({
        height: height - dy,
        y: y + dy,
      });
      findOne(e, element.id).setAttrs({
        height: element.height - dy / scale,
        y: state.origin.y + element.y + dy / scale,
      });
    }
  };
  const onDragEnd = (e) => {
    setVisibility(e, true);
    const handle = e.target;
    const step = (gridStep / 2) * scale;
    if (isHorizontal) {
      let dx = handle.x() - handleX;
      dx = Math.max(dx, (step / scale - element.width) * scale);
      dx = Math.round(dx / step) * step;
      updateElement(element.id, { width: element.width + dx / scale });
    } else {
      let dy = handle.y() - handleY;
      if (element.height - dy / scale < step / scale) {
        dy = (element.height - step / scale) * scale;
      }
      dy = Math.round(dy / step) * step;
      updateElement(element.id, {
        height: element.height - dy / scale,
        y: element.y + dy / scale,
      });
    }
  };

  return (
    <Rect
      id="resize-handle"
      x={handleX}
      y={handleY}
      width={handleWidth}
      height={handleHeight}
      cornerRadius={8}
      stroke="#2196f3"
      fill="white"
      strokeWidth={2}
      draggable
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    />
  );
};

export default ResizeHandle;
