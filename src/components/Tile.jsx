import { Group, Rect } from "react-konva";
import { config, workspace } from "../config";
import { getStageXY, halfPixel, numberBetween, pointInRect, pointsIsClose, setVisibility } from "../util";
import { useAppStore } from "../state/store";
import { useEffect, useRef } from "react";
import { Animation } from "konva/lib/Animation";
import { magnetToLine, lineZeroPos } from "./NumberLine";
import { graphZeroPos } from "./Graph";
import { getPPWSize } from "./PartPartWhole";

const size = config.tile.size;

export const Tile = ({ id, x, y, size, fill, stroke, visible, events }) => {
  x = halfPixel(x);
  y = halfPixel(y);
  size = Math.round(size) - 1;
  return (
    <Group id={id} x={x} y={y} visible={visible} {...events}>
      <Rect width={size} height={size} fill={fill} stroke={stroke} strokeWidth={1} />
    </Group>
  );
};

export const ToolbarTile = (props) => {
  const state = useAppStore();
  const { origin, elements, addElement } = state;
  const shadow = useRef();
  const size = config.tile.size;
  const scaledSize = getSize(state);

  const outOfToolbar = (e) => e.target.getStage().getPointerPosition().x > config.leftToolbar.width;

  const placeProps = (e) => {
    const { x, y } = getStageXY(e.target.getStage(), state);
    return { x: x - scaledSize / 2, y: y - scaledSize / 2 };
  };

  let boardShadow = null;
  const getBoardShadow = (e) => {
    return boardShadow || (boardShadow = e.target.getStage().findOne("#shadow-tile"));
  };

  const add = (pos, place, keepLastActive = false) => {
    addElement(
      {
        ...props,
        type: "tile",
        x: pos ? pos.x : place.x,
        y: pos ? pos.y : place.y,
        size: size,
        width: size,
        height: size,
        fill: props.fill,
        fillColor: props.fill,
        stroke: props.stroke,
      },
      keepLastActive
    );
  };

  const events = {
    onDragStart: (e) => {
      shadow.current.visible(true);
    },
    onDragMove: (e) => {
      const target = e.target;
      const out = outOfToolbar(e);
      target.visible(!out);
      const place = placeProps(e);
      const pos = magnetToAll(place, elements, state);
      const x = halfPixel(origin.x + (pos ? pos.x : place.x));
      const y = halfPixel(origin.y + (pos ? pos.y : place.y));
      const boardShadow = getBoardShadow(e);
      boardShadow.setAttrs({ x, y, visible: out });
      boardShadow.children[0].setAttrs({ fill: props.fill, stroke: props.stroke });
    },
    onDragEnd: (e) => {
      const target = e.target;
      const out = outOfToolbar(e);
      target.visible(!out);
      shadow.current.visible(false);
      target.setAttrs({ x: 0, y: 0, visible: true });
      getBoardShadow(e).visible(false);
      if (out) {
        const place = placeProps(e);
        const pos = magnetToAll(place, elements, state);
        add(pos, place);
      }
    },
    onPointerClick: (e) => {
      const last = elements[state.lastActiveElement];
      if (last && last.type == "tile") {
        if (state.workspace == workspace.graph) {
          add({ x: last.x, y: last.y - size });
        } else {
          add({ x: last.x + size, y: last.y });
        }
      } else if (last && last.type == "frame") {
        const shift = config.frame.shift;
        add({ x: last.x + shift, y: last.y + shift }, null, true);
      } else {
        add(firstPos(state));
      }
    },
  };

  return (
    <>
      <Group ref={shadow} visible={false}>
        <Tile {...props} />
      </Group>
      <Group draggable {...events}>
        <Tile {...props} />
      </Group>
    </>
  );
};

export const BoardTile = (props) => {
  const state = useAppStore();
  const { origin, selectIds, elements, fdMode } = state;
  const { id, locked } = props;
  const x = props.x + origin.x;
  const y = props.y + origin.y;
  const groupRef = useRef();

  const events = {
    draggable: !locked && !fdMode,
    onDragStart: (e) => {
      setVisibility(e, false);
    },
    onDragMove: (e) => {
      const dx = e.target.x() - x;
      const dy = e.target.y() - y;
      const pos = magnetToAll({ ...props, x: props.x + dx, y: props.y + dy }, elements, state);
      if (pos) {
        e.target.setAttrs({ x: halfPixel(origin.x + pos.x), y: halfPixel(origin.y + pos.y) });
      }
    },
    onDragEnd: (e) => {
      const dx = e.target.x() - x;
      const dy = e.target.y() - y;
      setVisibility(e, true);
      state.relocateElement(id, dx, dy);
    },
    onPointerClick: (e) => {
      selectIds([id], locked);
    },
  };
  return (
    <Group x={0} y={0} ref={groupRef}>
      <Tile {...props} x={x} y={y} events={events} />
    </Group>
  );
};

export function magnetToAll(tile, elements, state) {
  if (state.showGrid || state.workspace == workspace.graph) {
    const size = config.tile.size;
    const { x, y } = tile;
    return { x: Math.round(x / size) * size, y: Math.round(y / size) * size };
  }
  for (const element of Object.values(elements)) {
    if (element.type != "frame") continue;
    const pos = magnetToFrame(tile, element);
    if (pos) return pos;
  }
  for (const [id, element] of Object.entries(elements)) {
    if (tile.id == id || element.type != "tile") continue;
    const pos = magnetToOne(tile, element);
    if (pos) return pos;
  }
  return magnetToLine(tile, state);
}

function magnetToOne(tile, other) {
  const size = other.size;
  const { x, y } = tile;
  const options = [
    [-size, -size],
    [0, -size],
    [size, -size],
    [-size, 0],
    [0, 0],
    [size, 0],
    [-size, size],
    [0, size],
    [size, size],
  ];
  for (const [dx, dy] of options) {
    if (pointsIsClose({ x: x + dx, y: y + dy }, other)) return { x: other.x - dx, y: other.y - dy };
  }
  return null;
}

function magnetToFrame(tile, frame) {
  if (!pointInRect({ x: tile.x + 30, y: tile.y + 30 }, frame)) {
    return null;
  }
  const options = [];
  const { size, shift } = config.frame;
  for (let x = 0; x < frame.width; x += size) {
    for (let y = 0; y < frame.height; y += size) {
      options.push([-x, -y]);
    }
  }
  const { x, y } = tile;
  for (const [dx, dy] of options) {
    if (pointsIsClose({ x: x + dx - shift, y: y + dy - shift }, frame, size / 2)) {
      return { x: frame.x - dx + shift, y: frame.y - dy + shift };
    }
  }
  return null;
}

export function getSize(state) {
  return Math.round(config.tile.size * state.scale);
}

function firstPos(state) {
  switch (state.workspace) {
    case workspace.basic:
      return { x: -size / 2, y: -size / 2 };
      break;
    case workspace.numberLine:
      return lineZeroPos(state);
      break;
    case workspace.graph:
      return graphZeroPos(state);
      break;
    case workspace.ppw:
      const { width } = getPPWSize(state);
      return { x: -width / 2 + size / 2, y: size / 2 };
      break;
  }
}
