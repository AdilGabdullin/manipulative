import { Text } from "react-konva";
import { useAppStore } from "../state/store";
import { useEffect, useRef } from "react";

let doubleClick;

const TextElement = (props) => {
  const state = useAppStore();
  const { origin, fdMode } = state;
  const { id, x, y, text, fontSize, locked, newText, scale } = props;

  useEffect(() => {
    if (newText && ref.current) {
      createTextArea(ref.current, state);
    }
  });

  const onPointerClick = (e) => {
    if (fdMode) return;
    doubleClick = false;
    setTimeout(() => {
      if (!doubleClick) {
        state.selectIds([id], locked);
      }
    }, 300);
  };

  const onPointerDblClick = (e) => {
    doubleClick = true;
    createTextArea(e.target, state);
  };

  const onDragStart = (e) => {
    state.clearSelect();
  };

  const onDragMove = (e) => {};

  const onDragEnd = (e) => {
    let dx = e.target.x() - x - origin.x;
    let dy = e.target.y() - y - origin.y;
    state.relocateElement(id, dx, dy);
  };

  const ref = useRef(null);

  return (
    <Text
      ref={ref}
      id={id}
      x={origin.x + x}
      y={origin.y + y}
      scaleX={scale}
      scaleY={scale}
      text={text}
      fontSize={fontSize}
      fill={"black"}
      fontFamily="Calibri"
      onPointerClick={onPointerClick}
      onPointerDblClick={onPointerDblClick}
      draggable={!locked && !fdMode}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    />
  );
};

export function createTextArea(textNode, state) {
  if (document.getElementById("editable-text")) return;
  const textPosition = textNode.getAbsolutePosition();
  const stageBox = textNode.getStage().container().getBoundingClientRect();
  const areaPosition = {
    x: stageBox.left + textPosition.x,
    y: stageBox.top + textPosition.y,
  };
  const area = document.createElement("textarea");
  area.id = "editable-text";
  document.body.appendChild(area);
  area.dataset.nodeId = textNode.id();
  area.value = textNode.text();
  area.style.position = "absolute";
  area.style.top = areaPosition.y + "px";
  area.style.left = areaPosition.x + "px";
  area.style.width = 200 + "px";
  area.style.height = 100 + "px";
  area.style.fontSize = textNode.getAttr("fontSize") * state.scale + "px";
  area.style.fontFamily = "Calibri";
  area.focus();
  setTimeout(() => area.focus(), 200);
  area.addEventListener("keydown", function (e) {
    if (e.code == "Escape") {
      saveText(textNode, area, state);
    }
  });
}

export function appSaveText(state, findOne) {
  const area = document.getElementById("editable-text");
  if (!area) return;
  const textNode = findOne(area.dataset.nodeId);
  saveText(textNode, area, state);
}

function saveText(textNode, area, state) {
  textNode.setAttr("text", area.value);
  setTimeout(() => {
    const { width, height } = textNode.getClientRect();
    state.updateElement(area.dataset.nodeId, {
      text: area.value,
      newText: false,
      width: width / state.scale,
      height: height / state.scale,
    });
  }, 500);
  area.remove();
}

export default TextElement;
