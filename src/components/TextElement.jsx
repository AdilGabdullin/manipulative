import { Group, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { useEffect, useRef } from "react";

let doubleClick;

export const KIND = {
  text: 0,
  fraction: 1,
  mixed: 2,
  exponent: 3,
};

export const initialProps = [
  {
    type: "text",
    x: -40,
    y: -20,
    values: ["Text"],
    fontSize: 36,
    width: 59.466796875,
    height: 36,
    sizes: [
      {
        width: 59.466796875,
        height: 36,
      },
    ],
    editing: 0,
    scale: 1.0,
    kind: KIND.text,
    color: "black",
  },
  {
    type: "text",
    x: -9,
    y: -36,
    values: ["1", "2"],
    fontSize: 36,
    width: 18.24609375,
    height: 72,
    editing: 0,
    scale: 1.0,
    sizes: [
      {
        width: 18.24609375,
        height: 36,
      },
      {
        width: 18.24609375,
        height: 36,
      },
    ],
    kind: KIND.fraction,
    color: "black",
  },
  {
    type: "text",
    x: -18,
    y: -36,
    values: ["1", "2", "3"],
    fontSize: 36,
    width: 36.5,
    height: 72,
    editing: 2,
    scale: 1.0,
    sizes: [
      {
        width: 18.24609375,
        height: 36,
      },
      {
        width: 18.24609375,
        height: 36,
      },
      {
        width: 18.24609375,
        height: 36,
      },
    ],
    kind: KIND.mixed,
    color: "black",
  },
  {
    type: "text",
    x: -12.35,
    y: -18,
    values: ["x", "2"],
    fontSize: 36,
    width: 24.71484375,
    height: 36,
    sizes: [
      {
        x: 773.5,
        y: 259,
        width: 15.591796875,
        height: 36,
      },
      {
        x: 789.091796875,
        y: 259,
        width: 9.123046875,
        height: 18,
      },
    ],
    editing: 0,
    scale: 1.0,
    kind: KIND.exponent,
    color: "black",
  },
];

export const colorOptions = [
  { fill: "#4caf50", stroke: "#39903d", name: "Blue" },
  { fill: "#f06292", stroke: "#e92265", name: "Pink" },
  { fill: "#ff9800", stroke: "#f67e00", name: "Orange" },
  { fill: "#9c27b0", stroke: "#7d1fa3", name: "Purple" },
  { fill: "#ffeb3b", stroke: "#fdd935", name: "Yellow" },
  { fill: "brown", stroke: "#5C4033", name: "Brown" },
  { fill: "#2196f3", stroke: "#1978d4", name: "Green" },
  { fill: "#f44336", stroke: "#d5302f", name: "Red" },
  { fill: "grey", stroke: "#444444", name: "Grey" },
  { fill: "black", stroke: "#222222", name: "Black" },
];

const TextElement = (props) => {
  const state = useAppStore();
  const { origin, fdMode } = state;
  const { id, x, y, width, height, fontSize, locked, editing, scale, kind, color } = props;
  let sizes = props.sizes;

  useEffect(() => {
    if (editing !== -1 && refs[editing].current) {
      createTextArea(refs[editing].current, state);
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

  const groupRef = useRef(null);
  const refs = [useRef(null), useRef(null), useRef(null)];

  if (groupRef.current) {
    sizes = groupRef.current.children.map((node) => node.getClientRect());
  }

  const textWidth = sizes[0].width / state.scale;
  const textHeight = sizes[0].height / state.scale;
  const expWidth = kind == KIND.exponent ? sizes[1].width / state.scale : 0;
  const mixedWidth = kind == KIND.mixed ? sizes[2].width / state.scale : 0;
  const mixedHeight = kind == KIND.mixed ? sizes[2].height / state.scale : 0;
  const fractionWidth = width - mixedWidth - expWidth;
  const denominatorWidth = sizes[1] ? sizes[1].width / state.scale : 0;

  return (
    <Group
      ref={groupRef}
      id={id}
      x={Math.round(origin.x + x)}
      y={Math.round(origin.y + y)}
      scaleX={scale}
      scaleY={scale}
      draggable={!locked && !fdMode}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onPointerClick={onPointerClick}
      visible={props.visible}
    >
      <Text
        ref={refs[0]}
        id={id + "?0"}
        x={sizes ? (mixedWidth + (fractionWidth - textWidth) / 2) / scale : 0}
        y={0}
        text={props.values[0]}
        fontSize={fontSize}
        fill={color}
        fontFamily="Calibri"
        onPointerDblClick={onPointerDblClick}
      />
      {props.values[1] && (kind == KIND.mixed || kind == KIND.fraction) && (
        <Text
          ref={refs[1]}
          id={id + "?1"}
          x={sizes ? (mixedWidth + (fractionWidth - denominatorWidth) / 2) / scale : 0}
          y={sizes ? textHeight / scale : 0 + fontSize * scale}
          text={props.values[1]}
          fontSize={fontSize}
          fill={color}
          fontFamily="Calibri"
          onPointerDblClick={onPointerDblClick}
        />
      )}
      {props.values[1] && kind == KIND.exponent && (
        <Text
          ref={refs[1]}
          id={id + "?1"}
          x={sizes ? fractionWidth / scale : 0}
          y={sizes ? 0 / scale : 0}
          text={props.values[1]}
          fontSize={fontSize / 2}
          fill={color}
          fontFamily="Calibri"
          onPointerDblClick={onPointerDblClick}
        />
      )}
      {props.values[2] && (
        <Text
          ref={refs[2]}
          id={id + "?2"}
          x={0}
          y={sizes ? (height - mixedHeight) / 2 / scale : 0 + (fontSize * scale) / 2}
          text={props.values[2]}
          fontSize={fontSize}
          fill={color}
          fontFamily="Calibri"
          onPointerDblClick={onPointerDblClick}
        />
      )}
      {props.values[1] && (kind == KIND.mixed || kind == KIND.fraction) && (
        <Rect
          x={mixedWidth / scale}
          y={Math.round(height * 0.45) / scale}
          width={fractionWidth / scale}
          height={2}
          fill={color}
        />
      )}
    </Group>
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
  const nodeClientRect = textNode.getClientRect();
  const area = document.createElement("textarea");
  area.id = "editable-text";
  document.body.appendChild(area);
  const [id, editing] = textNode.id().split("?");
  area.dataset.id = id;
  area.dataset.editing = editing;
  area.value = textNode.text();
  area.style.position = "absolute";
  area.style.top = areaPosition.y + "px";
  area.style.left = areaPosition.x + "px";
  area.style.width = Math.max(nodeClientRect.width * 2, 100) + "px";
  area.style.height = nodeClientRect.height * 1 + "px";
  area.style.fontSize = textNode.getAttr("fontSize") * state.scale * textNode.parent.scaleX() + "px";
  area.style.fontFamily = "Calibri";
  area.style.color = textNode.getAttr("fill");
  area.focus();
  area.select();
  setTimeout(() => area.focus(), 200);
  area.addEventListener("keydown", function (e) {
    if (e.code == "Escape" || e.code == "Enter") {
      saveText(textNode, area, state);
    }
  });
}

export function appSaveText(state, findOne) {
  const area = document.getElementById("editable-text");
  if (!area) return;
  const textNode = findOne(area.dataset.id + "?" + area.dataset.editing);
  saveText(textNode, area, state);
}

function saveText(textNode, area, state) {
  textNode.setAttr("text", area.value);
  const id = area.dataset.id;
  const editing = +area.dataset.editing;
  const element = state.elements[id];
  const values = [...element.values];
  const kind = element.kind;
  values[editing] = area.value;

  const sizes = textNode.parent.children.map((node) => node.getClientRect());
  let width, height;

  switch (kind) {
    case KIND.text:
      width = sizes[0].width;
      height = sizes[0].height;
      break;
    case KIND.fraction:
      width = Math.max(sizes[0].width, sizes[1].width);
      height = sizes[0].height + sizes[1].height;
      break;
    case KIND.mixed:
      width = Math.max(sizes[0].width, sizes[1].width) + sizes[2].width;
      height = sizes[0].height + sizes[1].height;
      break;
    case KIND.exponent:
      width = sizes[0].width + sizes[1].width;
      height = sizes[0].height;
      break;
  }
  const stopEditing = (kind != KIND.mixed && editing + 1 == values.length) || (kind == KIND.mixed && editing == 1);
  setTimeout(() => {
    state.updateElement(id, {
      values: values,
      editing: stopEditing ? -1 : (editing + 1) % values.length,
      width: width / state.scale,
      height: height / state.scale,
      sizes: sizes,
    });
  }, 300);
  area.remove();
}

export default TextElement;
